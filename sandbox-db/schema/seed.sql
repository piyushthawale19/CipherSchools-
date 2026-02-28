-- ============================================================
-- sandbox-db/schema/seed.sql
-- Pre-populates all assignment schemas with sample data.
-- Run after init.sql as a superuser connected to ciphersqlstudio_sandbox.
-- ============================================================

-- ============================================================
-- ASSIGNMENT 1: Basic SELECT and Filtering
-- Schema: assignment_1_schema
-- Tables: employees
-- ============================================================

DROP TABLE IF EXISTS assignment_1_schema.employees CASCADE;

CREATE TABLE assignment_1_schema.employees (
  employee_id  INTEGER PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  salary       REAL NOT NULL,
  department   TEXT NOT NULL,
  hire_date    DATE
);

INSERT INTO assignment_1_schema.employees VALUES
  (1,  'Alice',   'Smith',   72000, 'Sales',       '2020-03-15'),
  (2,  'Bob',     'Jones',   45000, 'Sales',        '2021-07-01'),
  (3,  'Carol',   'White',   85000, 'Engineering',  '2019-11-20'),
  (4,  'Dave',    'Brown',   63000, 'Sales',        '2022-01-10'),
  (5,  'Eve',     'Davis',   91000, 'Engineering',  '2018-05-08'),
  (6,  'Frank',   'Lee',     38000, 'HR',           '2023-02-14'),
  (7,  'Grace',   'Kim',     77000, 'Sales',        '2020-08-25'),
  (8,  'Hank',    'Wilson',  55000, 'Engineering',  '2021-04-30'),
  (9,  'Iris',    'Taylor',  42000, 'HR',           '2022-09-01'),
  (10, 'Jack',    'Martin',  68000, 'Sales',        '2019-03-17'),
  (11, 'Karen',   'Thompson',80000, 'Engineering',  '2017-12-05'),
  (12, 'Leo',     'Garcia',  48000, 'Sales',        '2023-06-20'),
  (13, 'Mia',     'Harris',  56000, 'HR',           '2020-10-11'),
  (14, 'Nate',    'Clark',   94000, 'Engineering',  '2016-07-29'),
  (15, 'Olivia',  'Lewis',   53000, 'Sales',        '2022-03-08');

-- Grant SELECT to read-only user
GRANT SELECT ON ALL TABLES IN SCHEMA assignment_1_schema TO sandbox_readonly;


-- ============================================================
-- ASSIGNMENT 2: JOIN Challenge — Employees and Departments
-- Schema: assignment_2_schema
-- Tables: employees, departments
-- ============================================================

DROP TABLE IF EXISTS assignment_2_schema.employees CASCADE;
DROP TABLE IF EXISTS assignment_2_schema.departments CASCADE;

CREATE TABLE assignment_2_schema.departments (
  dept_id    INTEGER PRIMARY KEY,
  dept_name  TEXT NOT NULL,
  location   TEXT
);

CREATE TABLE assignment_2_schema.employees (
  employee_id  INTEGER PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  salary       REAL NOT NULL,
  dept_id      INTEGER REFERENCES assignment_2_schema.departments(dept_id)
);

INSERT INTO assignment_2_schema.departments VALUES
  (1, 'Engineering',  'New York'),
  (2, 'Sales',        'Chicago'),
  (3, 'HR',           'San Francisco'),
  (4, 'Marketing',    'Austin');

INSERT INTO assignment_2_schema.employees VALUES
  (1,  'Alice',   'Smith',  72000, 1),
  (2,  'Bob',     'Jones',  45000, 2),
  (3,  'Carol',   'White',  85000, 1),
  (4,  'Dave',    'Brown',  63000, 2),
  (5,  'Eve',     'Davis',  91000, 1),
  (6,  'Frank',   'Lee',    38000, 3),
  (7,  'Grace',   'Kim',    77000, 2),
  (8,  'Hank',    'Wilson', 55000, 4),
  (9,  'Iris',    'Taylor', 42000, 3),
  (10, 'Jack',    'Martin', 68000, 2);

GRANT SELECT ON ALL TABLES IN SCHEMA assignment_2_schema TO sandbox_readonly;


-- ============================================================
-- ASSIGNMENT 3: GROUP BY and Aggregates
-- Schema: assignment_3_schema
-- Tables: employees
-- ============================================================

DROP TABLE IF EXISTS assignment_3_schema.employees CASCADE;

CREATE TABLE assignment_3_schema.employees (
  employee_id  INTEGER PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  salary       REAL NOT NULL,
  department   TEXT NOT NULL
);

INSERT INTO assignment_3_schema.employees VALUES
  (1,  'Alice',   'Smith',   72000, 'Engineering'),
  (2,  'Bob',     'Jones',   58000, 'Engineering'),
  (3,  'Carol',   'White',   85000, 'Engineering'),
  (4,  'Dave',    'Brown',   45000, 'Sales'),
  (5,  'Eve',     'Davis',   51000, 'Sales'),
  (6,  'Frank',   'Lee',     47000, 'Sales'),
  (7,  'Grace',   'Kim',     38000, 'HR'),
  (8,  'Hank',    'Wilson',  41000, 'HR'),
  (9,  'Iris',    'Taylor',  93000, 'Engineering'),
  (10, 'Jack',    'Martin',  62000, 'Sales'),
  (11, 'Karen',   'Thompson',77000, 'Engineering'),
  (12, 'Leo',     'Garcia',  35000, 'Marketing'),
  (13, 'Mia',     'Harris',  82000, 'Engineering'),
  (14, 'Nate',    'Clark',   56000, 'Sales'),
  (15, 'Olivia',  'Lewis',   49000, 'Sales');

GRANT SELECT ON ALL TABLES IN SCHEMA assignment_3_schema TO sandbox_readonly;


-- ============================================================
-- ASSIGNMENT 4: Subquery — Top Earners
-- Schema: assignment_4_schema
-- Tables: employees
-- ============================================================

DROP TABLE IF EXISTS assignment_4_schema.employees CASCADE;

CREATE TABLE assignment_4_schema.employees (
  employee_id  INTEGER PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  salary       REAL NOT NULL,
  department   TEXT NOT NULL
);

INSERT INTO assignment_4_schema.employees VALUES
  (1,  'Alice',   'Smith',  72000, 'Engineering'),
  (2,  'Bob',     'Jones',  45000, 'Sales'),
  (3,  'Carol',   'White',  91000, 'Engineering'),
  (4,  'Dave',    'Brown',  38000, 'HR'),
  (5,  'Eve',     'Davis',  67000, 'Sales'),
  (6,  'Frank',   'Lee',    54000, 'Engineering'),
  (7,  'Grace',   'Kim',    82000, 'Sales'),
  (8,  'Hank',    'Wilson', 43000, 'HR'),
  (9,  'Iris',    'Taylor', 76000, 'Engineering'),
  (10, 'Jack',    'Martin', 61000, 'Sales');
-- Average salary = 62900; employees above average: Alice(72000), Carol(91000), Grace(82000), Iris(76000)

GRANT SELECT ON ALL TABLES IN SCHEMA assignment_4_schema TO sandbox_readonly;


-- ============================================================
-- ASSIGNMENT 5: Library System — Books and Authors
-- Schema: assignment_5_schema
-- Tables: books, authors
-- ============================================================

DROP TABLE IF EXISTS assignment_5_schema.books CASCADE;
DROP TABLE IF EXISTS assignment_5_schema.authors CASCADE;

CREATE TABLE assignment_5_schema.authors (
  author_id    INTEGER PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  nationality  TEXT
);

CREATE TABLE assignment_5_schema.books (
  book_id         INTEGER PRIMARY KEY,
  title           TEXT NOT NULL,
  author_id       INTEGER REFERENCES assignment_5_schema.authors(author_id),
  published_year  INTEGER,
  genre           TEXT
);

INSERT INTO assignment_5_schema.authors VALUES
  (1, 'John',  'Doe',     'American'),
  (2, 'Jane',  'Kim',     'Korean'),
  (3, 'Raj',   'Patel',   'Indian'),
  (4, 'Maria', 'Santos',  'Brazilian'),
  (5, 'Lena',  'Müller',  'German');

INSERT INTO assignment_5_schema.books VALUES
  (1,  'The Silent Code',      1, 2015, 'Thriller'),
  (2,  'Data Dreams',          2, 1998, 'Sci-Fi'),
  (3,  'Query Masters',        1, 2021, 'Education'),
  (4,  'Byte Tales',           3, 2003, 'Fiction'),
  (5,  'Neural Nights',        4, 2019, 'Sci-Fi'),
  (6,  'SQL and the City',     5, 2011, 'Comedy'),
  (7,  'Zero and One',         2, 1995, 'Thriller'),
  (8,  'Cascade Theory',       3, 2008, 'Education'),
  (9,  'Index of Secrets',     4, 2022, 'Thriller'),
  (10, 'The Last Transaction', 5, 2017, 'Drama');
-- Books published after 2000: #1,3,4,5,6,8,9,10 → 8 books

GRANT SELECT ON ALL TABLES IN SCHEMA assignment_5_schema TO sandbox_readonly;

-- ============================================================
-- Final: Grant future tables automtically (if schemas are extended)
-- ============================================================

ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_1_schema GRANT SELECT ON TABLES TO sandbox_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_2_schema GRANT SELECT ON TABLES TO sandbox_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_3_schema GRANT SELECT ON TABLES TO sandbox_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_4_schema GRANT SELECT ON TABLES TO sandbox_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA assignment_5_schema GRANT SELECT ON TABLES TO sandbox_readonly;
