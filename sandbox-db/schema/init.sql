
-- sandbox-db/schema/init.sql
-- Run as a PostgreSQL superuser once to set up the sandbox.
-- Creates the read-only user and the database
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'sandbox_readonly') THEN
    CREATE USER sandbox_readonly WITH PASSWORD 'change_this_password';
  END IF;
END
$$;

-- Revoke default public schema access
REVOKE ALL ON DATABASE ciphersqlstudio_sandbox FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Grant connect to read-only user
GRANT CONNECT ON DATABASE ciphersqlstudio_sandbox TO sandbox_readonly;
GRANT USAGE ON SCHEMA public TO sandbox_readonly;

-- ============================================================
-- Create all assignment schemas
-- ============================================================

CREATE SCHEMA IF NOT EXISTS assignment_1_schema;
CREATE SCHEMA IF NOT EXISTS assignment_2_schema;
CREATE SCHEMA IF NOT EXISTS assignment_3_schema;
CREATE SCHEMA IF NOT EXISTS assignment_4_schema;
CREATE SCHEMA IF NOT EXISTS assignment_5_schema;

-- Grant usage on all assignment schemas to read-only user
GRANT USAGE ON SCHEMA assignment_1_schema TO sandbox_readonly;
GRANT USAGE ON SCHEMA assignment_2_schema TO sandbox_readonly;
GRANT USAGE ON SCHEMA assignment_3_schema TO sandbox_readonly;
GRANT USAGE ON SCHEMA assignment_4_schema TO sandbox_readonly;
GRANT USAGE ON SCHEMA assignment_5_schema TO sandbox_readonly;
