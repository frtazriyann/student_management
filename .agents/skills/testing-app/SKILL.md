---
name: testing-coachpro
description: How to set up and test the CoachPro Student Coaching Management System locally.
---

# Testing CoachPro

## Start Services

1. Start MongoDB:
   ```bash
   sudo mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
   ```

2. Start backend (port 5000):
   ```bash
   cd backend
   JWT_SECRET=$JWT_SECRET MONGODB_URI=mongodb://localhost:27017/student_coaching PORT=5000 node server.js
   ```

3. Start frontend (port 5173):
   ```bash
   cd frontend
   npm run dev
   ```

## Test Accounts

- Register an admin at /register (name, email, phone, password)
- Students are created via Admin Panel > Students > Add Student
- Students login with the email/password set during creation

## Key Test Flows

1. **Admin Registration/Login**: Register at /register, login at /login with Admin tab
2. **Add Student**: Admin > Students > Add Student. Subjects field is comma-separated text input (e.g. "Math, Physics")
3. **Add Exam**: Admin > Exams > Create Exam. Subject is a text input field
4. **Add Result**: Admin > Results > Add Result. Exam Name, Subject, Total Marks are all text inputs (auto-creates Exam/Subject docs)
5. **Dark Mode**: Toggle via sidebar button. Should apply to entire interface (all pages, modals, sidebar, header)
6. **Student Panel**: Login as student, verify Dashboard shows profile/stats, Results page shows charts and grades

## Notes

- No automated tests exist. Testing is manual via browser.
- Backend Mongoose warnings about duplicate indexes are harmless.
- The frontend uses Vite HMR so code changes are reflected immediately.
- Dark mode uses Tailwind v4 `@custom-variant dark` in index.css.
- Subjects/Exams are auto-created by backend controllers from text input (case-insensitive duplicate prevention).
