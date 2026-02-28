// ============================================================
// scripts/seedAssignments.js
// Pre-populates MongoDB with sample SQL assignments.
// Run: node scripts/seedAssignments.js
// ============================================================

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment.model");
const { MONGO_URI } = require("../config/env");

const assignments = [
  {
    title: "Basic SELECT and Filtering",
    description:
      "Filter and retrieve specific rows from the employees table based on conditions.",
    difficulty: "easy",
    category: "SELECT",
    question:
      'Find the first name, last name, and salary of all employees in the "Sales" department who earn more than 50000. Sort the results by salary in descending order.',
    schemaDescription:
      "Table: employees(employee_id INTEGER, first_name TEXT, last_name TEXT, salary REAL, department TEXT, hire_date DATE). Sample data has 20 employees across Sales, Engineering, and HR departments.",
    postgresSchema: "assignment_1_schema",
    orderIndex: 1,
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "TEXT" },
          { columnName: "last_name", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "hire_date", dataType: "DATE" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            last_name: "Smith",
            salary: 72000,
            department: "Sales",
            hire_date: "2020-03-15",
          },
          {
            employee_id: 2,
            first_name: "Bob",
            last_name: "Jones",
            salary: 45000,
            department: "Sales",
            hire_date: "2021-07-01",
          },
          {
            employee_id: 3,
            first_name: "Carol",
            last_name: "White",
            salary: 85000,
            department: "Engineering",
            hire_date: "2019-11-20",
          },
          {
            employee_id: 4,
            first_name: "Dave",
            last_name: "Brown",
            salary: 63000,
            department: "Sales",
            hire_date: "2022-01-10",
          },
          {
            employee_id: 5,
            first_name: "Eve",
            last_name: "Davis",
            salary: 91000,
            department: "Engineering",
            hire_date: "2018-05-08",
          },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { first_name: "Alice", last_name: "Smith", salary: 72000 },
        { first_name: "Dave", last_name: "Brown", salary: 63000 },
      ],
    },
    isPublished: true,
  },
  {
    title: "JOIN Challenge: Employees and Departments",
    description: "Use JOIN to combine data from two related tables.",
    difficulty: "medium",
    category: "JOIN",
    question:
      "Display the full name (first_name + ' ' + last_name) as \"full_name\", the department name (from the departments table), and salary of all employees. Order by department name, then by salary descending.",
    schemaDescription:
      "Table: employees(employee_id, first_name, last_name, salary, dept_id). Table: departments(dept_id, dept_name, location). Both tables share dept_id as the linking column.",
    postgresSchema: "assignment_2_schema",
    orderIndex: 2,
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "TEXT" },
          { columnName: "last_name", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" },
          { columnName: "dept_id", dataType: "INTEGER" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            last_name: "Smith",
            salary: 72000,
            dept_id: 1,
          },
          {
            employee_id: 2,
            first_name: "Bob",
            last_name: "Jones",
            salary: 45000,
            dept_id: 2,
          },
          {
            employee_id: 3,
            first_name: "Carol",
            last_name: "White",
            salary: 85000,
            dept_id: 1,
          },
        ],
      },
      {
        tableName: "departments",
        columns: [
          { columnName: "dept_id", dataType: "INTEGER" },
          { columnName: "dept_name", dataType: "TEXT" },
          { columnName: "location", dataType: "TEXT" },
        ],
        rows: [
          { dept_id: 1, dept_name: "Engineering", location: "New York" },
          { dept_id: 2, dept_name: "Sales", location: "Chicago" },
          { dept_id: 3, dept_name: "HR", location: "San Francisco" },
        ],
      },
    ],
    expectedOutput: { type: "count", value: 3 },
    isPublished: true,
  },
  {
    title: "GROUP BY and Aggregates",
    description:
      "Aggregate employee data by department using GROUP BY and aggregate functions.",
    difficulty: "medium",
    category: "AGGREGATE",
    question:
      'For each department, calculate the number of employees (as "employee_count") and the average salary (as "avg_salary", rounded to 2 decimal places). Only include departments with more than 2 employees. Sort by avg_salary descending.',
    schemaDescription:
      "Table: employees(employee_id, first_name, last_name, salary, department). The department column is a direct text value (no separate department table). Has 15 employees across 4 departments.",
    postgresSchema: "assignment_3_schema",
    orderIndex: 3,
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "TEXT" },
          { columnName: "last_name", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" },
          { columnName: "department", dataType: "TEXT" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            last_name: "Smith",
            salary: 72000,
            department: "Engineering",
          },
          {
            employee_id: 2,
            first_name: "Bob",
            last_name: "Jones",
            salary: 58000,
            department: "Engineering",
          },
          {
            employee_id: 3,
            first_name: "Carol",
            last_name: "White",
            salary: 85000,
            department: "Engineering",
          },
          {
            employee_id: 4,
            first_name: "Dave",
            last_name: "Brown",
            salary: 45000,
            department: "Sales",
          },
          {
            employee_id: 5,
            first_name: "Eve",
            last_name: "Davis",
            salary: 51000,
            department: "Sales",
          },
          {
            employee_id: 6,
            first_name: "Frank",
            last_name: "Lee",
            salary: 47000,
            department: "Sales",
          },
        ],
      },
    ],
    expectedOutput: { type: "count", value: 2 },
    isPublished: true,
  },
  {
    title: "Subquery: Top Earners",
    description:
      "Use a subquery to find employees earning above the average salary.",
    difficulty: "hard",
    category: "SUBQUERY",
    question:
      "Find the first_name, last_name, and salary of all employees who earn more than the average salary across all employees. Sort by salary descending.",
    schemaDescription:
      "Table: employees(employee_id, first_name, last_name, salary, department). Straightforward single table — use a subquery to calculate the average salary inside the WHERE clause.",
    postgresSchema: "assignment_4_schema",
    orderIndex: 4,
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "TEXT" },
          { columnName: "last_name", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" },
          { columnName: "department", dataType: "TEXT" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            last_name: "Smith",
            salary: 72000,
            department: "Engineering",
          },
          {
            employee_id: 2,
            first_name: "Bob",
            last_name: "Jones",
            salary: 45000,
            department: "Sales",
          },
          {
            employee_id: 3,
            first_name: "Carol",
            last_name: "White",
            salary: 91000,
            department: "Engineering",
          },
          {
            employee_id: 4,
            first_name: "Dave",
            last_name: "Brown",
            salary: 38000,
            department: "HR",
          },
          {
            employee_id: 5,
            first_name: "Eve",
            last_name: "Davis",
            salary: 67000,
            department: "Sales",
          },
        ],
      },
    ],
    expectedOutput: { type: "count", value: 3 },
    isPublished: true,
  },
  {
    title: "Library System: Books and Authors",
    description:
      "Practice JOINs and filtering on a library dataset with books and authors.",
    difficulty: "easy",
    category: "JOIN",
    question:
      "List all book titles and their author names (first_name + ' ' + last_name as \"author_name\") for books published after 2000. Sort alphabetically by title.",
    schemaDescription:
      "Table: books(book_id, title, author_id, published_year, genre). Table: authors(author_id, first_name, last_name, nationality). Linked by author_id.",
    postgresSchema: "assignment_5_schema",
    orderIndex: 5,
    sampleTables: [
      {
        tableName: "books",
        columns: [
          { columnName: "book_id", dataType: "INTEGER" },
          { columnName: "title", dataType: "TEXT" },
          { columnName: "author_id", dataType: "INTEGER" },
          { columnName: "published_year", dataType: "INTEGER" },
          { columnName: "genre", dataType: "TEXT" },
        ],
        rows: [
          {
            book_id: 1,
            title: "The Silent Code",
            author_id: 1,
            published_year: 2015,
            genre: "Thriller",
          },
          {
            book_id: 2,
            title: "Data Dreams",
            author_id: 2,
            published_year: 1998,
            genre: "Sci-Fi",
          },
          {
            book_id: 3,
            title: "Query Masters",
            author_id: 1,
            published_year: 2021,
            genre: "Education",
          },
          {
            book_id: 4,
            title: "Byte Tales",
            author_id: 3,
            published_year: 2003,
            genre: "Fiction",
          },
        ],
      },
      {
        tableName: "authors",
        columns: [
          { columnName: "author_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "TEXT" },
          { columnName: "last_name", dataType: "TEXT" },
          { columnName: "nationality", dataType: "TEXT" },
        ],
        rows: [
          {
            author_id: 1,
            first_name: "John",
            last_name: "Doe",
            nationality: "American",
          },
          {
            author_id: 2,
            first_name: "Jane",
            last_name: "Kim",
            nationality: "Korean",
          },
          {
            author_id: 3,
            first_name: "Raj",
            last_name: "Patel",
            nationality: "Indian",
          },
        ],
      },
    ],
    expectedOutput: { type: "count", value: 3 },
    isPublished: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to MongoDB");

    await Assignment.deleteMany({});
    console.log("[Seed] Cleared existing assignments");

    const created = await Assignment.insertMany(assignments);
    console.log(`[Seed] Inserted ${created.length} assignments`);

    console.log("[Seed] Done! Assignment IDs:");
    created.forEach((a) =>
      console.log(`  ${a._id} — ${a.title} (${a.postgresSchema})`),
    );
  } catch (err) {
    console.error("[Seed] Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("[Seed] Disconnected");
  }
}

seed();
