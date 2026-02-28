# CipherSQLStudio — Secure PostgreSQL Sandbox Setup

> **Type:** Architectural Reference Only  
> **You implement the actual SQL and Node.js connection code yourself.**  
> This document covers security model, configuration rationale, and setup order.

---

## WHY A SANDBOX IS NECESSARY

Without a sandbox:

- A student running `DROP TABLE employees` would destroy data for everyone
- A student running `SELECT * FROM users` could expose other users' data
- Runaway queries could lock up the database server

The sandbox enforces:

1. **Isolation** — each schema is scoped to one assignment
2. **Read-only** — the DB user physically cannot write
3. **Time-bounded** — queries are killed after 5 seconds
4. **Row-limited** — max 500 rows returned regardless of query

---

## SANDBOX SECURITY LAYERS (Defense in Depth)

```
Layer 1 — Application (queryValidatorService)
  ↓ Blocklist dangerous keywords
  ↓ Allowlist: must start with SELECT
  ↓ Reject multiple statements
  ↓ Reject queries over max length

Layer 2 — Session (sandboxRunnerService)
  ↓ SET search_path → isolates to one assignment's schema
  ↓ SET statement_timeout → kills long queries
  ↓ SET work_mem → limits memory per query

Layer 3 — Database User (sandbox_reader role)
  ↓ Has ONLY GRANT SELECT on sandbox schemas
  ↓ Cannot INSERT, UPDATE, DELETE, DROP, CREATE, GRANT
  ↓ Cannot access other schemas or other databases

Layer 4 — Application Result Handling
  ↓ Enforce row limit in application code (not SQL)
  ↓ Sanitize pg error objects before sending to client
  ↓ Log all executions for audit
```

Even if Layer 1 fails (validator bypass), Layers 2–4 prevent data destruction.

---

## SETUP ORDER (What to Do, In Sequence)

### Step 1 — Create Sandbox Database and Schemas

```sql
-- Pseudocode — you write the exact DDL

-- 1. Create the sandbox database itself
CREATE DATABASE ciphersql_sandbox;

-- 2. Connect to that database (in psql: \c ciphersql_sandbox)

-- 3. Create one schema per assignment
CREATE SCHEMA assignment_1_schema;
CREATE SCHEMA assignment_2_schema;
-- ...

-- 4. Create all tables inside their schema
CREATE TABLE assignment_1_schema.employees ( ... );
CREATE TABLE assignment_1_schema.departments ( ... );
-- etc. — see DATABASE_SCHEMA.md for field definitions
```

### Step 2 — Create the Read-Only User

```sql
-- Create the role
CREATE ROLE sandbox_reader
  WITH LOGIN
  PASSWORD 'use_a_strong_env_loaded_password_here'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE;

-- For each schema, grant USAGE (can see schema) + SELECT (can read tables)
GRANT USAGE ON SCHEMA assignment_1_schema TO sandbox_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA assignment_1_schema TO sandbox_reader;

-- This ensures future tables added get SELECT automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_1_schema
  GRANT SELECT ON TABLES TO sandbox_reader;

-- Explicitly DENY CREATE on the public schema (extra safety)
REVOKE CREATE ON SCHEMA public FROM sandbox_reader;
```

### Step 3 — Configure Session-Level Limits

These go inside your `sandboxRunnerService.js` before executing any query:

```
Pseudocode for what to SET per query session:

  SET search_path TO assignment_{N}_schema
    → Scopes all unqualified table references to this schema
    → Student cannot reference assignment_2_schema from assignment_1's session

  SET statement_timeout = '5000'
    → Auto-kills any query running > 5 seconds
    → Prevents: SELECT pg_sleep(9999)
    → Prevents: Slow cross-joins on large datasets

  SET work_mem = '8MB'
    → Limits memory per sort/hash operation
    → Prevents memory exhaustion attacks

  SET lock_timeout = '2000'
    → Kills if any lock is waited on > 2 seconds
```

### Step 4 — PostgreSQL Pool Configuration in Node.js

```
Two separate pools — NEVER mix them:

1. pool_admin = new Pool({
     user: process.env.PG_ADMIN_USER,
     host: process.env.PG_HOST,
     database: process.env.PG_DATABASE,
     password: process.env.PG_ADMIN_PASSWORD,
     port: process.env.PG_PORT,
     max: 5,                    // small pool for admin operations
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   })
   → Used for: seeding data, admin operations, schema management
   → NEVER used for student query execution

2. pool_sandbox = new Pool({
     user: process.env.PG_SANDBOX_USER,    // = sandbox_reader
     host: process.env.PG_HOST,
     database: process.env.PG_DATABASE,
     password: process.env.PG_SANDBOX_PASSWORD,
     port: process.env.PG_PORT,
     max: 20,                   // larger pool for concurrent students
     idleTimeoutMillis: 10000,
     connectionTimeoutMillis: 3000,
   })
   → Used ONLY for: student query execution in sandboxRunnerService
```

---

## SANDBOX RUNNER SERVICE — Implementation Pseudocode

```
sandboxRunnerService(query, assignmentId):

  1. Fetch assignment from MongoDB to get: postgresSchema name
       → If assignment not found → throw AppError(404)

  2. Get client from pool_sandbox
       → If pool is at max → throw AppError(503, "Service busy")

  3. Inside try/finally block:

     try:
       a. SET session variables (one by one via client.query):
            SET search_path TO '{postgresSchema}'
            SET statement_timeout = '5000'
            SET work_mem = '8MB'
            SET lock_timeout = '2000'

       b. Record start time: Date.now()

       c. Execute: client.query(userQuery)
            → This is where the student's SQL runs
            → The sandbox_reader user enforces read-only at DB level

       d. Record end time: executionTime = Date.now() - start

       e. Enforce row limit:
            rows = result.rows.slice(0, MAX_ROWS)  // MAX_ROWS = 500
            limited = result.rows.length > MAX_ROWS

       f. Return:
            {
              rows,
              fields: result.fields.map(f => f.name),
              rowCount: result.rowCount,
              executionTime,
              limited         // tells frontend: "results were cut off"
            }

     catch (pgError):
       → DO NOT return pgError directly
       → Log full error internally (logger.error)
       → Extract safe parts: pgError.message, pgError.code
       → Sanitize: remove file paths, line numbers from message
       → Throw AppError(422, sanitizedMessage)

     finally:
       → client.release()   // ALWAYS release, even on error
```

---

## ERROR SANITIZATION STRATEGY

Raw PostgreSQL errors contain internal file paths and line numbers. Never send these to the client.

```
Raw pg error object contains:
  message  → "column 'emplyee_id' does not exist"   ← OK to send
  code     → "42703"                                  ← OK to send (SQL state code)
  file     → "parse_relation.c"                       ← NEVER send
  line     → "3377"                                   ← NEVER send
  routine  → "errorMissingRTE"                        ← NEVER send
  detail   → internal query plan details              ← NEVER send
  hint     → sometimes reveals schema internals       ← NEVER send

Safe to return to frontend:
  {
    sqlState: pgError.code,          // "42703"
    message: pgError.message         // "column 'emplyee_id' does not exist"
  }
```

---

## POSTGRESQL SETUP FOR LOCAL DEVELOPMENT

```
Recommended local setup approach:

Option A — Native PostgreSQL
  1. Install PostgreSQL 15+
  2. Create ciphersql_sandbox database
  3. Run init.sql to create schemas + sandbox_reader
  4. Run seed.sql to populate data
  5. Add PG_SANDBOX_USER + PG_SANDBOX_PASSWORD to .env

Option B — Docker (cleaner isolation)
  1. docker-compose.yml with postgres:15 image
  2. Mount init.sql + seed.sql into /docker-entrypoint-initdb.d/
  3. Auto-runs on first container start
  4. Environment variables in .env file
  → DO NOT commit .env files

Environment Variables needed:
  PG_HOST=localhost
  PG_PORT=5432
  PG_DATABASE=ciphersql_sandbox
  PG_ADMIN_USER=postgres
  PG_ADMIN_PASSWORD=...
  PG_SANDBOX_USER=sandbox_reader
  PG_SANDBOX_PASSWORD=...
```

---

## POSTGRESQL SECURITY CHECKLIST

```
✗  Using pg superuser for student queries
✓  sandbox_reader has only GRANT SELECT

✗  Not setting statement_timeout
✓  Always SET statement_timeout = '5000' per session

✗  Single schema for all assignments
✓  Separate schema per assignment + SET search_path per query

✗  Returning raw pg errors to frontend
✓  Sanitize: only message + code, strip internal details

✗  Not releasing pool client on error
✓  Always client.release() in finally block

✗  Hard-coding DB credentials
✓  All credentials in .env, validated at startup in config/env.js

✗  Forgetting DEFAULT PRIVILEGES grant
✓  ALTER DEFAULT PRIVILEGES ensures future tables are also read-only

✗  Setting MAX_ROWS inside SQL (LIMIT clause appended to query)
✓  Enforce row limit in application code after execution — safer
```

---

## TESTING YOUR SANDBOX SECURITY

After setup, manually verify these queries are blocked or safe:

```
Test 1 — Blocked by validator:
  "DROP TABLE employees;"
  Expected: 400 error, "Query contains blocked keyword"

Test 2 — Blocked by validator:
  "DELETE FROM employees WHERE 1=1; SELECT 1;"
  Expected: 400 error

Test 3 — Blocked by DB user permissions (even if validator fails):
  "INSERT INTO employees VALUES (999, 'Hacker', ...)"
  Expected: pg error "permission denied for table employees"

Test 4 — Blocked by statement_timeout:
  "SELECT pg_sleep(10)"
  Expected: pg error "canceling statement due to statement timeout"

Test 5 — Valid query works:
  "SELECT e.first_name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.department_id"
  Expected: 200 with results

Test 6 — Schema isolation:
  "SELECT * FROM assignment_2_schema.employees"
  Expected: pg error "schema does not exist" or permission denied
```
