# Hostel Complaint Management System

A full-stack complaint tracking app for hostel management. Students can raise issues, admins can review and assign them, and maintenance staff can update progress until the complaint is resolved.

The project uses:

- `React` for the frontend
- `Node.js + Express` for the backend API
- `MongoDB` for persistence
- `JWT` for authentication
- `Socket.IO` for real-time notifications

## Features

- Role-based login for `student`, `admin`, and `staff`
- Student complaint submission and complaint history
- Admin complaint dashboard with filtering and staff assignment
- Staff dashboard for assigned tasks, progress notes, and resolution
- Live notification flow with Socket.IO
- Seed script for demo users and sample complaint data

## Tech Stack

### Frontend

- React
- React Router
- Socket.IO Client

### Backend

- Express
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Morgan
- CORS

### Database

- MongoDB Community Server

## Project Structure

```text
Hostel-Complaint-application/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env.example
|   |-- package.json
|   |-- seed.js
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   `-- pages/
|   `-- package.json
`-- README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Julian0914/Hostel-Complaint-application.git
cd Hostel-Complaint-application
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env` from `backend/.env.example`.

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel_complaints
JWT_SECRET=change-me-in-real-use
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running locally before starting the backend.

Default local connection used by this project:

```text
mongodb://localhost:27017/hostel_complaints
```

### 5. Seed demo data

```bash
cd backend
npm run seed
```

### 6. Run the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Open the app in your browser:

```text
http://localhost:3000
```

## Demo Accounts

Use these seeded accounts to test the full flow:

- Admin: `admin@hostel.edu` / `123456`
- Staff: `staff@hostel.edu` / `123456`
- Student: `student@hostel.edu` / `123456`

## How to Test the Full Flow

For the best demo experience, open three browser tabs or windows.

### Student flow

- Log in as `student`
- Submit a complaint
- View it under `My Complaints`

### Admin flow

- Log in as `admin`
- Open the complaints list
- Assign the complaint to a staff member
- Update complaint status if needed

### Staff flow

- Log in as `staff`
- Open assigned tasks
- Add a progress note or mark the complaint as resolved

### Real-time notifications

You should see notifications appear across open sessions when:

- a student submits a complaint
- an admin assigns a complaint
- an admin updates complaint status
- a staff member resolves a complaint

## API Overview

Base URL:

```text
http://localhost:5000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`

### Student

- `POST /student/complaints`
- `GET /student/complaints`
- `GET /student/complaints/:id`

### Admin

- `GET /admin/complaints`
- `GET /admin/complaints/staff`
- `PUT /admin/complaints/:id/assign`
- `PUT /admin/complaints/:id/status`
- `DELETE /admin/complaints/:id`

### Staff

- `GET /staff/complaints`
- `PUT /staff/complaints/:id/progress`
- `PUT /staff/complaints/:id/complete`

### Health Check

- `GET /health`

## MongoDB Collections

This app uses the `hostel_complaints` database with these main collections:

- `users`
- `complaints`

You can inspect them in:

- the VS Code MongoDB extension using `Open Collection`
- `mongosh`

Example:

```javascript
use hostel_complaints
show collections
db.users.find().pretty()
db.complaints.find().pretty()
```

## Screenshots

You can replace the placeholders below with real screenshots after taking them from the running app.

### Login Page

`Add screenshot here`

### Student Dashboard

`Add screenshot here`

### Admin Dashboard

`Add screenshot here`

### Staff Dashboard

`Add screenshot here`

### MongoDB Collections View

`Add screenshot here`

## Notes

- `backend/.env` is intentionally not committed
- `node_modules` and frontend build output are ignored
- This project is currently set up for local development

## Future Improvements

- Restrict admin registration from the public UI
- Persist notifications in MongoDB
- Add validation and stronger error handling
- Add automated tests
- Deploy frontend and backend
