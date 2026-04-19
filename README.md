# Hostel Complaint Management System

This workspace contains the project scaffold from the PDF guide:

- `backend/`: Express, MongoDB, JWT auth, Socket.IO notifications
- `frontend/`: React app with student, admin, and staff dashboards

## Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Install backend packages:
   - `cd backend`
   - `npm install`
3. Install frontend packages:
   - `cd ../frontend`
   - `npm install`
4. Start MongoDB locally
5. Seed demo data:
   - `cd ../backend`
   - `npm run seed`
6. Run both apps:
   - `npm run dev` in `backend`
   - `npm start` in `frontend`

## Demo Logins

- Admin: `admin@hostel.edu` / `123456`
- Staff: `staff@hostel.edu` / `123456`
- Student: `student@hostel.edu` / `123456`
