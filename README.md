# Todo Management System

A full-stack Todo application built with Next.js, TypeScript, Express, Prisma, and PostgreSQL.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Containerization:** Docker and Docker Compose

## Features

- Create, view, update, and delete Todos
- Set Todos as completed or pending
- Filter Todos by All, Pending, and Completed
- Display descriptions and creation dates
- Persistent PostgreSQL storage
- Loading and error handling
- Duplicate submission protection
- Server-side request validation using Zod
- API pagination with page and limit parameters
- Docker Compose setup for the frontend, backend, and database

## Getting Started with Docker

### Prerequisites

- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/robertmarcelo/task-management-system.git
cd task-management-system
```

### 2. Start the application

```bash
docker compose up --build -d
```

This starts the frontend, backend, and PostgreSQL database.

### 3. Open the application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Todo API:** http://localhost:5000/api/todos

### 4. Stop the application

```bash
docker compose down
```

To stop the application and delete the Docker database volume:

```bash
docker compose down -v
```

**Warning:** The `-v` option deletes the database data stored in the Docker volume.

## API Endpoints

Base URL: `http://localhost:5000/api/todos`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Retrieve all Todos |
| GET | `/api/todos?status=completed` | Retrieve completed Todos |
| GET | `/api/todos?status=pending` | Retrieve pending Todos |
| POST | `/api/todos` | Create a Todo |
| PATCH | `/api/todos/:id` | Update a Todo |
| DELETE | `/api/todos/:id` | Delete a Todo |

### Pagination

The GET endpoint supports pagination:

```text
GET /api/todos?page=1&limit=10
```

Pagination information is returned through response headers:

- `X-Total-Count`
- `X-Page`
- `X-Limit`
- `X-Total-Pages`

### Request Validation

Zod validates incoming create and update requests. Invalid requests return an HTTP 400 response with an error message.

The API also returns HTTP 404 when an operation targets a Todo that does not exist.

## Project Structure

```text
task-management-system/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   │   └── todo.routes.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   ├── Dockerfile
│   └── package.json
├── compose.yaml
└── README.md
```

## Database

Docker Compose runs PostgreSQL in a separate container and stores its data in a named Docker volume.

The database configuration in `compose.yaml` is intended for local development and demonstration only. Do not use the example credentials in a production environment.

## Author

Developed as a Full-Stack Developer take-home assessment.