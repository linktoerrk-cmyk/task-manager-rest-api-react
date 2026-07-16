# Task Manager

A full-stack task manager application built with React, Node.js/Express, and PostgreSQL. Supports user registration, login (JWT), and full CRUD for tasks.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens)

## Project Structure

```
task-manager/
├── server/         # Express API
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── client/         # React frontend
│   ├── src/
│   │   └── App.tsx
│   ├── package.json
│   └── index.html
└── schema.sql      # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
psql -U postgres -c "CREATE DATABASE taskmanager;"
psql -U postgres -d taskmanager -f schema.sql
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanager
JWT_SECRET=your_super_secret_key_here
PORT=4000
```

```bash
npm run dev
```

The API will run on `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will run on `http://localhost:5173`.

## API Endpoints

| Method | Path              | Auth     | Description         |
|--------|-------------------|----------|---------------------|
| POST   | /api/register     | No       | Register a user     |
| POST   | /api/login        | No       | Login, get JWT      |
| GET    | /api/tasks        | Required | Get all user tasks  |
| POST   | /api/tasks        | Required | Create a task       |
| PUT    | /api/tasks/:id    | Required | Update a task       |
| DELETE | /api/tasks/:id    | Required | Delete a task       |

## Features

- User registration and login with hashed passwords
- JWT-based protected routes
- Create, read, update, delete tasks
- Mark tasks as complete/incomplete
- Each user only sees their own tasks