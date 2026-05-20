# CoachPro - Student Coaching Management System

A complete modern Student/Coaching Management System built with the MERN Stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Admin Panel
- **Student Management** - Add/Edit/Delete students with full profile details
- **Payment Management** - Monthly fee tracking, paid/unpaid/partial status, due calculation
- **Task & Assignment System** - Assign tasks to students, track submissions and completion
- **Routine & Scheduling** - Weekly class routines, special classes, exam schedules
- **Exam & Result Management** - Create exams, store marks, auto-calculate grades/GPA
- **Performance Analytics** - AI-powered analysis with charts, weak subject detection, trend prediction
- **PDF & File Management** - Upload notes, answer sheets, exam papers, study materials
- **Attendance System** - Daily attendance marking with batch filtering, monthly reports
- **Notifications** - In-app, SMS (Twilio), and WhatsApp Cloud API notifications
- **Subject Management** - Add/manage subjects with codes and descriptions

### Student Panel
- **Dashboard** - Profile overview, payment status, pending tasks, attendance stats
- **Tasks & Assignments** - View and submit assigned tasks
- **Results & Performance** - View exam results with subject-wise performance charts
- **Attendance** - View attendance percentage and history
- **Resources** - Download notes, answer sheets, study materials
- **Routine** - View weekly class schedule
- **Notifications** - View and manage notifications

### Technical Features
- JWT-based authentication with role-based access (Admin/Student)
- Dark/Light mode toggle
- Responsive mobile-friendly design
- RESTful API with MVC architecture
- MongoDB with Mongoose ODM (optimized indexes and relationships)
- Charts and analytics with Recharts
- Toast notifications
- Pagination, search, and filtering
- File upload support
- Rate limiting and security headers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, React Router, Zustand, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer (Cloudinary ready) |
| Notifications | Twilio API, WhatsApp Cloud API |
| Security | Helmet, CORS, express-rate-limit |

## Project Structure

```
student-coaching-management/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route handlers (MVC)
│   ├── middleware/       # Auth, file upload middleware
│   ├── models/          # Mongoose schemas (11 collections)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helper functions (analytics, notifications, JWT)
│   ├── uploads/         # Local file uploads
│   ├── server.js        # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Admin & Student page components
│   │   ├── store/       # Zustand state management
│   │   ├── utils/       # API client (Axios)
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Database Collections

| Collection | Description |
|-----------|-------------|
| Admins | Admin accounts with secure passwords |
| Students | Student profiles with subjects, batch, fees |
| Subjects | Subject catalog with codes |
| Payments | Monthly fee records (paid/unpaid/partial) |
| Tasks | Assignments with deadlines and submissions |
| Attendance | Daily attendance records |
| Exams | Exam definitions with total marks |
| Results | Student exam results with grades |
| Routines | Weekly class schedules |
| Notifications | SMS/WhatsApp/in-app notifications |
| Documents | Uploaded PDFs and study materials |

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_coaching
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Optional: Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Twilio for SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_phone

# Optional: WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_ACCESS_TOKEN=your_token
```

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/register-admin` - Register admin
- `POST /api/auth/login-admin` - Admin login
- `POST /api/auth/login-student` - Student login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - List students (admin)
- `POST /api/students` - Create student (admin)
- `PUT /api/students/:id` - Update student (admin)
- `DELETE /api/students/:id` - Delete student (admin)
- `GET /api/students/profile` - Get own profile (student)

### Payments
- `GET /api/payments` - List payments (admin)
- `POST /api/payments` - Record payment (admin)
- `PUT /api/payments/:id` - Update payment (admin)
- `GET /api/payments/stats` - Payment statistics (admin)
- `GET /api/payments/student` - Student's payments

### Tasks, Attendance, Exams, Results, Routines, Subjects, Notifications, Documents
- Full CRUD operations with role-based access
- See route files for complete API documentation

## Deployment

### Backend (Node.js)
Deploy to any Node.js hosting (Render, Railway, Heroku, AWS, etc.)

### Frontend (React)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel, Netlify, etc.
```

## License
MIT
