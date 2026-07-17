# Task Management API

A simple REST API for managing tasks, built with Node.js, Express.js, and MySQL.

## Tech Stack
- **Node.js**
- **Express.js**
- **MySQL** (using \`mysql2\`)
- **Environment Variables** (using \`dotenv\`)

## Features
- Complete CRUD operations for tasks.
- Validation for task title and priority.
- Pagination and status filtering.
- SQL LIKE search functionality on title and description.
- Aggregation query returning dashboard statistics (Bonus).
- Parameterized queries to prevent SQL injection.

## Project Setup Instructions

1. **Clone or Download the Repository:**
   Ensure you have downloaded all source code into your working directory.

2. **Install Dependencies:**
   Run the following command to install the required packages:
   \`\`\`bash
   npm install
   \`\`\`

3. **Database Configuration:**
   - Make sure MySQL server is running.
   - Run the provided \`database.sql\` script in your MySQL environment to create the \`assessment_db\` database and the \`tasks\` table.
   - You can run it via command line:
     \`\`\`bash
     mysql -u root -p < database.sql
     \`\`\`

4. **Environment Variables:**
   - A \`.env\` file is already provided. 
   - Update the variables in \`.env\` file if your MySQL configuration is different:
     \`\`\`env
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=assessment_db
     \`\`\`

5. **Start the Server:**
   \`\`\`bash
   npm start
   \`\`\`
   *(Note: You can add \`"start": "node src/index.js"\` to your \`package.json\` scripts, or run \`node src/index.js\` directly).*

## API Documentation

### 1. Create Task
- **Endpoint:** \`POST /tasks\`
- **Description:** Creates a new task. Validates \`title\` and \`priority\`.
- **Request Body:**
  \`\`\`json
  {
      "title": "Learn Node.js",
      "description": "Complete the assessment",
      "status": "Pending",
      "priority": "High"
  }
  \`\`\`
- **Status Codes:** 201 Created, 400 Bad Request

### 2. List Tasks
- **Endpoint:** \`GET /tasks\`
- **Description:** Returns a list of tasks. Supports pagination and filtering.
- **Query Params:**
  - \`page\` (default: 1)
  - \`limit\` (default: 10)
  - \`status\` (optional, e.g., 'Pending', 'In Progress', 'Completed')
- **Status Codes:** 200 OK

### 3. Search Tasks
- **Endpoint:** \`GET /tasks/search?keyword=query\`
- **Description:** Searches for tasks where the title or description matches the keyword.
- **Status Codes:** 200 OK, 400 Bad Request

### 4. Get Task by ID
- **Endpoint:** \`GET /tasks/:id\`
- **Description:** Fetches a specific task by its ID.
- **Status Codes:** 200 OK, 404 Not Found

### 5. Update Task
- **Endpoint:** \`PUT /tasks/:id\`
- **Description:** Updates the fields of an existing task.
- **Request Body (Partial or Full):**
  \`\`\`json
  {
      "status": "In Progress"
  }
  \`\`\`
- **Status Codes:** 200 OK, 400 Bad Request, 404 Not Found

### 6. Delete Task
- **Endpoint:** \`DELETE /tasks/:id\`
- **Description:** Deletes a task by its ID.
- **Status Codes:** 200 OK, 404 Not Found

### 7. Dashboard (Bonus)
- **Endpoint:** \`GET /dashboard\`
- **Description:** Returns aggregated counts for total tasks, pending tasks, completed tasks, and high priority tasks using SQL aggregations.
- **Status Codes:** 200 OK
