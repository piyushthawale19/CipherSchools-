# ⚡ CipherSQL Studio

![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

A browser-based SQL learning platform where students write real SQL queries against an isolated PostgreSQL sandbox, receive instant correctness feedback, and get AI-powered hints that guide without ever spoiling the answer.

---

## Features

- **Monaco SQL Editor** — syntax highlighting, autocomplete, keyboard shortcuts
- **Live sandbox execution** — queries run in isolated per-assignment PostgreSQL schemas
- **Instant correctness checking** — row-level comparison against expected output
- **AI hint system** — GPT-4o-mini provides guidance, never solutions
- **JWT authentication** — access tokens in memory + httpOnly refresh token cookies
- **Mobile-first UI** — responsive 3-panel layout (brief / editor / hints)
- **Full audit trail** — every submission and hint request logged to MongoDB

---

## Tech Stack & Technology Choices

| Layer           | Technology                             | Why                                                                 |
| --------------- | -------------------------------------- | ------------------------------------------------------------------- |
| **Frontend**    | React 18 + Vite 5                      | Fast HMR, modern tooling, great Monaco integration                  |
| **UI**          | SCSS (Dart Sass `@use`) + BEM          | Scoped, maintainable styles without a CSS-in-JS runtime             |
| **SQL Editor**  | Monaco Editor (`@monaco-editor/react`) | Same engine as VS Code — first-class SQL editing                    |
| **HTTP Client** | Axios                                  | Interceptors for silent JWT refresh; clean API wrappers             |
| **Routing**     | React Router v6                        | Declarative nested routes, `ProtectedRoute` pattern                 |
| **Backend**     | Node.js + Express                      | Lightweight, large ecosystem, easy PostgreSQL + MongoDB integration |
| **Auth**        | JWT (access 15m) + bcrypt              | Stateless access tokens in memory; refresh tokens httpOnly/hashed   |
| **Primary DB**  | MongoDB Atlas (Mongoose)               | Flexible schema for assignments, submissions, hint logs             |
| **Sandbox DB**  | PostgreSQL                             | ACID-compliant; schema-level isolation; real SQL for learners       |
| **AI Hints**    | OpenAI `gpt-4o-mini`                   | Low latency, low cost; strict system prompt prevents answer leakage |

---

## Project Structure

```
CipherSQL Studio - Full Stack Assignment/
├── backend/
│   ├── config/
│   │   ├── db.mongo.js          MongoDB Atlas connection
│   │   ├── db.postgres.js       PostgreSQL pool (read-only)
│   │   └── env.js               Fail-fast env validation
│   ├── controllers/
│   │   ├── auth.controller.js   register, login, refresh, logout, getMe
│   │   ├── assignment.controller.js
│   │   ├── query.controller.js  validate → sandbox → log → respond
│   │   └── hint.controller.js   rate-limit → LLM → log
│   ├── middleware/
│   │   ├── auth.middleware.js   JWT Bearer verification
│   │   ├── errorHandler.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Assignment.model.js
│   │   ├── Submission.model.js
│   │   └── HintLog.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── assignment.routes.js
│   │   ├── query.routes.js
│   │   └── hint.routes.js
│   ├── services/
│   │   ├── queryValidator.service.js  blocklist + allowlist
│   │   ├── sandboxRunner.service.js   search_path isolation, 5 s timeout
│   │   ├── resultFormatter.service.js pg rows → {columns, rows[][]}
│   │   └── llmHint.service.js         strict-prompt OpenAI call
│   ├── scripts/
│   │   └── seedAssignments.js   Seeds 5 assignments into MongoDB
│   ├── utils/
│   │   ├── jwtHelper.js
│   │   ├── hashHelper.js
│   │   └── logger.js
│   ├── app.js                   Express app (helmet, cors, morgan)
│   ├── server.js                Entry point
│   ├── .env.example             ← copy to .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js  In-memory token + silent refresh interceptor
│   │   │   ├── authApi.js
│   │   │   └── queryApi.js
│   │   ├── components/
│   │   │   ├── assignment/      EditorWrapper, ResultsPanel, HintPanel,
│   │   │   │                    SchemaViewer, SubmissionBanner
│   │   │   ├── dashboard/       AssignmentCard, FilterChips
│   │   │   └── shared/          Navbar, Badge, Button, LoadingSpinner,
│   │   │                        ErrorMessage
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   Session restore on mount
│   │   │   └── QueryContext.jsx  Per-assignment query + hint state
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useQueryExec.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AssignmentPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── styles/              SCSS — Dart Sass @use/@forward, BEM, mobile-first
│   │   │   ├── abstracts/       _variables, _mixins, _functions, _index
│   │   │   ├── base/            _reset, _typography
│   │   │   ├── components/      _button, _badge, _card, _editor,
│   │   │   │                    _results-table, _hint-panel, _form,
│   │   │   │                    _modal, _schema-viewer
│   │   │   ├── layout/          _grid, _navbar, _sidebar
│   │   │   ├── pages/           _login, _dashboard, _assignment
│   │   │   └── main.scss        Global entry — @use imports in order
│   │   ├── utils/
│   │   │   └── errorParser.js
│   │   ├── App.jsx              Router + ProtectedRoute
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example             ← copy to .env
│   └── package.json
│
├── sandbox-db/
│   └── schema/
│       ├── init.sql             Creates 5 schemas + sandbox_readonly user
│       └── seed.sql             DDL + sample data for all 5 assignments
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── HINT_SYSTEM.md
│   ├── SANDBOX_SETUP.md
│   └── UI_WIREFRAMES.md
│
├── .gitignore
├── package.json                 Root scripts — run both servers with `npm run dev`
└── README.md
```

---

## Prerequisites

| Tool           | Version           | Notes                                                       |
| -------------- | ----------------- | ----------------------------------------------------------- |
| Node.js        | 18+               | [nodejs.org](https://nodejs.org)                            |
| npm            | 9+                | Included with Node                                          |
| PostgreSQL     | 14+               | [postgresql.org](https://www.postgresql.org/download/)      |
| MongoDB        | Atlas (free tier) | [cloud.mongodb.com](https://cloud.mongodb.com)              |
| OpenAI API key | —                 | [platform.openai.com](https://platform.openai.com/api-keys) |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/cipher-sql-studio.git
cd cipher-sql-studio
```

### 2. Set up the PostgreSQL sandbox database

```bash
# Create the database
createdb ciphersqlstudio_sandbox

# Create schemas + read-only user
psql -d ciphersqlstudio_sandbox -f sandbox-db/schema/init.sql

# Create tables + insert sample data
psql -d ciphersqlstudio_sandbox -f sandbox-db/schema/seed.sql
```

> The `init.sql` script creates a `sandbox_readonly` PostgreSQL user. Take note of the password it uses — you'll need it in `backend/.env`.

### 3. Configure the backend

```bash
cd backend
npm install
cp .env.example .env   # then open .env and fill in all values
```

Seed the 5 assignments into MongoDB:

```bash
node scripts/seedAssignments.js
```

### 4. Configure the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

### 5. Run both servers

From the repo root:

```bash
npm install          # installs concurrently
npm run dev          # starts backend :5000 + frontend :5173
```

Or start them separately:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### `backend/.env`

| Variable                   | Example                   | Description                                                                                       |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `PORT`                     | `5000`                    | Express server port                                                                               |
| `NODE_ENV`                 | `development`             | `development` or `production`                                                                     |
| `MONGO_URI`                | `mongodb+srv://...`       | MongoDB Atlas connection string                                                                   |
| `PG_HOST`                  | `localhost`               | PostgreSQL host                                                                                   |
| `PG_PORT`                  | `5432`                    | PostgreSQL port                                                                                   |
| `PG_DATABASE`              | `ciphersqlstudio_sandbox` | Database name                                                                                     |
| `PG_USER`                  | `sandbox_readonly`        | Read-only PG user (created by `init.sql`)                                                         |
| `PG_PASSWORD`              | `your_password`           | Password for the read-only user                                                                   |
| `JWT_SECRET`               | _(64-char hex)_           | Signs access tokens — generate with `node -e "require('crypto').randomBytes(64).toString('hex')"` |
| `JWT_REFRESH_SECRET`       | _(64-char hex)_           | Signs refresh tokens — use a **different** value from `JWT_SECRET`                                |
| `JWT_ACCESS_EXPIRES`       | `15m`                     | Access token lifetime                                                                             |
| `JWT_REFRESH_EXPIRES`      | `7d`                      | Refresh token lifetime                                                                            |
| `OPENAI_API_KEY`           | `sk-...`                  | OpenAI API key                                                                                    |
| `OPENAI_MODEL`             | `gpt-4o-mini`             | Model used for hint generation                                                                    |
| `CLIENT_ORIGIN`            | `http://localhost:5173`   | Allowed CORS origin                                                                               |
| `HINT_RATE_LIMIT_PER_HOUR` | `5`                       | Max hint requests per user per hour                                                               |
| `QUERY_RATE_LIMIT_MAX`     | `30`                      | Max query executions per minute per IP                                                            |

### `frontend/.env`

| Variable       | Example                 | Description                                  |
| -------------- | ----------------------- | -------------------------------------------- |
| `VITE_API_URL` | `http://localhost:5000` | Backend base URL (used in production builds) |

> In development, Vite proxies `/api → http://localhost:5000` via `vite.config.js`, so `VITE_API_URL` is only needed for production builds.

---

## API Reference

```
Auth
  POST  /api/auth/register          Register (displayName, email, password)
  POST  /api/auth/login             Login → access token + httpOnly cookie
  POST  /api/auth/refresh           Silent refresh via cookie
  POST  /api/auth/logout            Clear session
  GET   /api/auth/me                Get current user profile

Assignments
  GET   /api/assignments            List published assignments
  GET   /api/assignments/:id        Get single assignment + sample tables
  GET   /api/assignments/:id/schema Schema description only

Query Execution
  POST  /api/query/execute          Run a SQL query against the sandbox
  GET   /api/query/history/:id      Submission history for an assignment

Hints
  POST  /api/hints/request          Request an LLM hint
```

---

## Security Design

| Concern                   | Approach                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| XSS token theft           | Access token stored in-memory (React closure), never `localStorage`                                      |
| CSRF / token hijack       | Refresh token in `httpOnly; SameSite=Strict` cookie; hashed with SHA-256 before DB storage               |
| SQL injection via sandbox | Read-only PostgreSQL user; `SET search_path` per query; blocklist regex rejects any non-SELECT statement |
| Runaway queries           | `SET statement_timeout = '5000'` and `SET work_mem = '4MB'` per connection                               |
| Data exfiltration         | Results capped at 500 rows; `information_schema` access blocked                                          |
| Hint answer leakage       | System prompt has 10 explicit rules; code-block stripper post-processes every LLM response               |
| Brute force               | express-rate-limit on auth (10/15 min), query (30/min), and api (100/15 min) endpoints                   |

---

## Development Notes

- **SCSS**: Uses Dart Sass `@use`/`@forward` — no `@import`. Each partial opens with `@use "abstracts" as *;`, resolved via `src/styles/abstracts/_index.scss` through `loadPaths` in `vite.config.js`.
- **Monaco**: Lazy-loaded automatically by `@monaco-editor/react`; no extra Webpack/Vite config needed.
- **PostgreSQL pool**: Non-fatal on startup — server runs with a warning if Postgres is unreachable, so MongoDB-only features still work.
- **Token rotation**: Every `/auth/refresh` call issues a new refresh token and invalidates the old one (single-use rotation).

---

## License

MIT

---

## Project Structure

```
.
├── backend/                  Node/Express API server
│   ├── config/               DB connections + env validation
│   ├── controllers/          Route handlers
│   ├── middleware/           Auth, error handler, rate limiter
│   ├── models/               Mongoose schemas
│   ├── routes/               Express routers
│   ├── services/             Business logic (validator, sandbox, LLM)
│   ├── scripts/              Seed script
│   ├── utils/                JWT, bcrypt, logger helpers
│   ├── app.js                Express app setup
│   └── server.js             Entry point
├── frontend/                 React SPA
│   ├── src/
│   │   ├── api/              Axios instance + auth/query API wrappers
│   │   ├── components/       Shared + feature components
│   │   ├── context/          AuthContext, QueryContext
│   │   ├── hooks/            useAuth, useQueryExec
│   │   ├── pages/            Route page components
│   │   ├── styles/           SCSS (BEM, mobile-first, Dart Sass @use)
│   │   ├── utils/            errorParser
│   │   ├── App.jsx           Router + ProtectedRoute
│   │   └── main.jsx          React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── sandbox-db/
│   └── schema/
│       ├── init.sql          Creates schemas + read-only user
│       └── seed.sql          DDL + sample data for 5 assignments
├── docs/                     Architecture and design docs
└── ARCHITECTURE.md
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

---

## Setup

### 1. PostgreSQL sandbox database

```bash
# Create the database
createdb ciphersqlstudio_sandbox

# Run init (creates schemas + read-only user)
psql -d ciphersqlstudio_sandbox -f sandbox-db/schema/init.sql

# Run seed (creates tables + inserts data)
psql -d ciphersqlstudio_sandbox -f sandbox-db/schema/seed.sql
```

### 2. Backend

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Seed assignment documents into MongoDB
node scripts/seedAssignments.js

# Start the dev server
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

| Variable                 | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `PORT`                   | Express server port (default `5000`)                     |
| `MONGO_URI`              | MongoDB Atlas connection string                          |
| `PG_HOST`                | PostgreSQL host                                          |
| `PG_PORT`                | PostgreSQL port (default `5432`)                         |
| `PG_DATABASE`            | Database name (`ciphersqlstudio_sandbox`)                |
| `PG_USER`                | Read-only PostgreSQL user (`sandbox_readonly`)           |
| `PG_PASSWORD`            | Password for the read-only user                          |
| `JWT_SECRET`             | Secret for signing access tokens (min 32 chars)          |
| `JWT_REFRESH_SECRET`     | Secret for signing refresh tokens (min 32 chars)         |
| `JWT_EXPIRES_IN`         | Access token TTL (e.g., `15m`)                           |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g., `7d`)                           |
| `OPENAI_API_KEY`         | OpenAI API key                                           |
| `CLIENT_ORIGIN`          | Frontend origin for CORS (e.g., `http://localhost:5173`) |

### `frontend/.env`

| Variable       | Description                                      |
| -------------- | ------------------------------------------------ |
| `VITE_API_URL` | Backend base URL (e.g., `http://localhost:5000`) |

---

## Security Design

- **Access tokens** are stored in-memory (React closure) — never in `localStorage`
- **Refresh tokens** are stored in httpOnly cookies and hashed (SHA-256) before saving to MongoDB
- **SQL sandbox**: read-only PostgreSQL user; `SET search_path` isolation; 5 s statement timeout; 500 row cap
- **Query validation**: blocklist regex (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, pg_sleep, information_schema, etc.); only single `SELECT` statements allowed
- **Hint system**: LLM is strictly prompted to never provide SQL code or column names

---

## API Reference

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login, returns access token + sets cookie
POST   /api/auth/refresh        Silent token refresh (uses httpOnly cookie)
POST   /api/auth/logout         Clears session
GET    /api/auth/me             Get current user

GET    /api/assignments         List published assignments (filterable)
GET    /api/assignments/:id     Get single assignment
GET    /api/assignments/:id/schema  Get schema description

POST   /api/query/execute       Execute SQL query
GET    /api/query/history/:id   Get submission history for assignment

POST   /api/hints/request       Request an LLM hint
```

---

## Development Notes

- SCSS uses Dart Sass `@use`/`@forward` — no `@import`. Each partial starts with `@use "abstracts" as *;`, which resolves via `src/styles/abstracts/_index.scss` thanks to `loadPaths` in `vite.config.js`.
- Monaco Editor is lazy-loaded by `@monaco-editor/react` automatically.
- The PostgreSQL pool is non-fatal on startup — the server will start even if Postgres is unreachable, logging a warning.
