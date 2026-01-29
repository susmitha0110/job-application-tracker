# Job Application Tracker

A full-stack **Job Application Tracker** built to manage and track job applications across different stages (Applied, Interview, Offer, Rejected).  
This project demonstrates real-world full-stack development using **React, FastAPI, PostgreSQL, Docker, and JWT authentication**.

## Features

### Authentication
- Secure **admin login** using JWT
- Protected APIs (only authenticated users can create/update/delete applications)

### Job Application Management
- Add new job applications with:
  - Company
  - Role
  - Status
  - Location
  - Job URL
  - Notes
- View all applications in a clean dashboard
- Update application status (Applied → Interview → Offer → Rejected)
- Delete applications

### Dashboard & UI
- Status-wise summary cards
- Search applications by company name
- Filter applications by status
- Modern, responsive UI with clean styling (no UI libraries)

###  Dockerized Setup
- Fully containerized using Docker Compose
- Separate services for:
  - Frontend (React + Vite)
  - Backend (FastAPI)
  - Database (PostgreSQL)

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS (custom modern UI)

### Backend
- FastAPI
- Python
- SQLAlchemy
- JWT Authentication

### Database
- PostgreSQL

### DevOps / Tooling
- Docker & Docker Compose
- Git & GitHub

## Project Structure

job-application-tracker/
│
├── docker-compose.yml
├── .env.example
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── auth.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ ├── db.py
│ │ └── routers/
│ │ ├── auth.py
│ │ └── applications.py
│ └── Dockerfile
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ ├── auth.ts
│ │ │ └── applications.ts
│ │ ├── App.tsx
│ │ ├── App.css
│ │ └── main.tsx
│ ├── Dockerfile
│ └── .env.example
│
└── README.md

## Environment Setup

### 1️Clone the repository
git clone https://github.com/<your-username>/job-application-tracker.git
cd job-application-tracker


### 2 Root .env
DATABASE_URL=postgresql+psycopg2://job_user:job_pass@db:5432/job_db
CORS_ORIGINS=http://localhost:5173

JWT_SECRET_KEY=change_this_to_a_long_random_string
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=Admin@12345
JWT_EXPIRE_MINUTES=120


### 3 frontend/.env
VITE_API_BASE=http://localhost:8000

## Run Instructions
Docker Desktop: docker compose up --build

## API Endpoints

### Authentication

POST /api/auth/login → Admin login (returns JWT token)

### Applications (JWT Protected)

GET /api/applications → List applications

POST /api/applications → Create a new application

PATCH /api/applications/{id} → Update application

DELETE /api/applications/{id} → Delete application


## What This Project Demonstrates

- End-to-end full-stack development

- RESTful API design with FastAPI

- JWT authentication and role-based access

- PostgreSQL data modeling and CRUD operations

- Docker-based development workflow

- Clean, modern frontend UI with React & TypeScript


### Future Enhancements

- Kanban board (drag & drop by status)

- Edit drawer for updating application details

- Analytics dashboard (applications per week/month)

- Follow-up reminders and notifications

- Multi-user support

