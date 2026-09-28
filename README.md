# Hospital Appointment & Queue Management System

A production-ready, clean, full-stack MERN MVP for managing hospital doctor appointments and real-time patient queue priorities.

---

## 📖 Overview

The **Hospital Appointment & Queue Management System** is a modern healthcare SaaS application designed to streamline patient registration, doctor schedule availability, 30-minute time-slot booking, duplicate-booking prevention, and prioritized OPD queue management.

Built using **MongoDB, Express.js, React, and Node.js (MERN stack)**, it provides clear role-based portals for **Patients**, **Doctors**, and **System Administrators**.

---

## ✨ Features

- **Role-Based Portals**: Distinct dashboards and protected routes for Patient, Doctor, and Admin roles.
- **Dynamic Slot Generation**: Automatically converts doctor working schedules into 30-minute bookable slots.
- **Backend Availability & Double-Booking Prevention**: Validates slot availability on the backend to prevent duplicate bookings.
- **Doctor+Date Scoped Queue System**: Generates queue numbers (`U-001` for Urgent, `N-001` for Normal) scoped per doctor per appointment date.
- **Priority OPD Queueing**: Places urgent cases at the top of the queue for immediate medical attention.
- **Doctor Schedule Manager**: Allows doctors to set custom daily working hours and availability.
- **Admin System Dashboard**: Real-time operational metrics, doctor creation, user directory, and Recharts analytics.
- **Authentication**: JWT token verification with bcrypt password hashing.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router v6, Tailwind CSS, Axios, Lucide React Icons, Recharts
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv
- **Database**: MongoDB & Mongoose ORM
- **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## 🏗️ Architecture

```
                               ┌─────────────────────────┐
                               │       React Client      │
                               │  (Vite + Tailwind CSS)  │
                               └────────────┬────────────┘
                                            │ HTTP / REST APIs
                                            ▼
                               ┌─────────────────────────┐
                               │   Express Node Server   │
                               │   (Auth, JWT, Services) │
                               └────────────┬────────────┘
                                            │ Mongoose Driver
                                            ▼
                               ┌─────────────────────────┐
                               │    MongoDB Database     │
                               │ (Atlas / Local MongoDB) │
                               └─────────────────────────┘
```

---

## 👥 User Roles & Demo Accounts

The system includes pre-seeded accounts for testing (`npm run seed`):

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@hospital.com` | `admin123` | System Administrator |
| **Doctor** | `smith@hospital.com` | `doctor123` | Dr. Sarah Smith (Cardiology) |
| **Doctor** | `patel@hospital.com` | `doctor123` | Dr. Rajesh Patel (Pediatrics) |
| **Doctor** | `johnson@hospital.com` | `doctor123` | Dr. Emily Johnson (Neurology) |
| **Patient** | `john.doe@example.com` | `patient123` | John Doe |
| **Patient** | `jane.smith@example.com` | `patient123` | Jane Smith |

---

## 🔄 Appointment & Queue Workflow

1. **Patient Login & Selection**: Patient logs in, selects a doctor, and picks an appointment date.
2. **Slot Generation**: Backend generates 30-minute intervals for that day's working schedule and grays out already booked slots.
3. **Slot Booking & Queue Assignment**: Patient picks a slot (`09:00`), chooses priority (`NORMAL` or `URGENT`), and submits.
4. **Queue Numbering**: Backend calculates existing queue items for that doctor and date, assigning numbers like `U-001` or `N-001`.
5. **Doctor OPD Queue**: Doctor opens live queue view. `URGENT` appointments appear prioritized at the top.
6. **Consultation Flow**: Doctor updates status from `IN_QUEUE` → `IN_PROGRESS` → `COMPLETED`.

---

## 📅 Scheduling Logic

```
Doctor Schedule: 09:00 - 13:00 (30 min duration)
Generated Slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30

Booking Validation Rules:
1. Slot must fall within doctor working hours.
2. No non-cancelled appointment must exist in DB for { doctorId, appointmentDate, startTime }.
```

---

## 🔢 Queue Logic

Queue numbers are scoped by **Doctor + Appointment Date**:
- `U-001`, `U-002` (Urgent Priority - Sorted to Top)
- `N-001`, `N-002` (Normal Priority - Sorted by Start Time)

---

## 🗄️ Database Schemas

### User Model
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed with bcrypt)
- `role`: Enum `['PATIENT', 'DOCTOR', 'ADMIN']`
- `phone`: String

### Doctor Model
- `userId`: ObjectId ref `User`
- `specialization`: String
- `department`: String
- `experience`: Number
- `consultationFee`: Number
- `availability`: Schedule map per day of week

### Appointment Model
- `patientId`: ObjectId ref `User`
- `doctorId`: ObjectId ref `Doctor`
- `appointmentDate`: String (`YYYY-MM-DD`)
- `startTime`: String (`HH:MM`)
- `endTime`: String (`HH:MM`)
- `priority`: Enum `['NORMAL', 'URGENT']`
- `queueNumber`: String (e.g. `U-001`)
- `status`: Enum `['BOOKED', 'CONFIRMED', 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']`

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hospital_management_db
JWT_SECRET=super_secret_jwt_key_hospital_management_2026_mvp
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Local Installation & Running

### 1. Clone & Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Seed Test Database
```bash
cd server
npm run seed
```

### 3. Run Backend & Frontend

Terminal 1 (Backend API):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend Client):
```bash
cd client
npm run dev
```

Access client at `http://localhost:5173`.

---

## 🚢 Deployment Steps

### A. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist IP address (`0.0.0.0/0` for global access).
3. Copy the connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/hospital_db?retryWrites=true&w=majority`.

### B. Backend (Render)
1. Create a new Web Service on [Render](https://render.com).
2. Connect your Git repository and set root directory to `server`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

### C. Frontend (Vercel)
1. Import project into [Vercel](https://vercel.com).
2. Set root directory to `client`.
3. Framework Preset: `Vite`.
4. Add Environment Variable: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`.

---

## 🧪 Testing Checklist

- [x] Patient Registration & Login
- [x] Doctor & Admin Login
- [x] Doctor Availability & Slot Generation
- [x] Slot Booking & Double-Booking Prevention
- [x] Doctor+Date Scoped Queue Generation (`U-001`, `N-001`)
- [x] OPD Queue Status Updates (`IN_QUEUE` → `IN_PROGRESS` → `COMPLETED`)
- [x] Admin Stats Analytics & Doctor Creation
- [x] Protected Routes & Role Authorization


---

## 🔮 Future Improvements

- Automated Email & SMS notifications for queue alerts
- E-Prescription & Pharmacy integration module
- Patient billing & invoice downloads
- Telehealth video consultation links
