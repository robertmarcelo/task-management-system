# Todo Management System

A full-stack Todo application built with Next.js, TypeScript, Express, Prisma, PostgreSQL, and JWT Authentication.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Containerization:** Docker and Docker Compose

## Features

- User registration and login with secure password hashing (`bcryptjs`)
- JWT authentication for API protection and session management
- User-scoped Todos (each user registers, logs in, and manages their own private tasks)
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
- **Auth API:** http://localhost:5000/api/auth
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

### Authentication Endpoints

Base URL: `http://localhost:5000/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Authenticate with email/password and obtain JWT token |
| GET | `/api/auth/me` | Retrieve the authenticated user's profile *(Requires Bearer Token)* |

#### Registration Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response Example (200 / 201)
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-11-22T00:00:00.000Z"
  },
  "token": "eyJhbGciOi..."
}
```

---

### Todo Endpoints

Base URL: `http://localhost:5000/api/todos`

> **Note:** All Todo endpoints require the `Authorization` header:
> `Authorization: Bearer <your_jwt_token>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Retrieve current user's Todos |
| GET | `/api/todos?status=completed` | Retrieve completed Todos |
| GET | `/api/todos?status=pending` | Retrieve pending Todos |
| POST | `/api/todos` | Create a Todo for the current user |
| PATCH | `/api/todos/:id` | Update a Todo owned by the current user |
| DELETE | `/api/todos/:id` | Delete a Todo owned by the current user |

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

Zod validates incoming auth, create, and update requests. Invalid requests return an HTTP 400 response with an error message.

The API also returns HTTP 404 when an operation targets a Todo that does not exist or belongs to another user.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `PORT` | Backend server port | `5000` |
| `JWT_SECRET` | Secret key used to sign and verify JWTs | Configured in `.env` / `compose.yaml` |
| `JWT_EXPIRES_IN` | JWT expiration duration (e.g. `7d`, `24h`) | `7d` |

## Project Structure

```text
task-management-system/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── database/
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── todo.routes.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── AuthForm.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── types/
│   │   ├── todo.ts
│   │   └── user.ts
│   ├── Dockerfile
│   └── package.json
├── compose.yaml
└── README.md
```

## Database

Docker Compose runs PostgreSQL in a separate container and stores its data in a named Docker volume. Prisma manages schema migrations automatically during container startup.

The database configuration in `compose.yaml` is intended for local development and demonstration only. Do not use the example credentials in a production environment.

## Author

Developed as a Full-Stack Developer take-home assessment.
