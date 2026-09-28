# Educational Module Guides & Business Logic

This document breaks down the major engineering modules of the Hospital Appointment & Queue Management System for students and developers studying this codebase.

---

## 1. Authentication & Authorization Module

- **What it does**: Manages user registration, login, JWT token issuance, password hashing, and role-based route protection.
- **Why it exists**: Ensures secure system access, protects patient medical privacy, and enforces access control boundaries between Patients, Doctors, and Admins.
- **Input**: Email, Password, Name, Role (`PATIENT`, `DOCTOR`, `ADMIN`).
- **Processing**:
  1. Hashing passwords using `bcryptjs` with salt factor 10 before saving to MongoDB.
  2. Verifying password hashes during login.
  3. Generating a signed JWT payload containing user ID.
  4. Verifying Bearer tokens in express middleware (`auth.js`).
- **Output**: Signed JWT token string and user session object.
- **Important Business Rules**:
  - Email addresses must be unique.
  - Passwords are never stored or logged in plain text.
  - Patients cannot view Doctor queues or Admin analytics pages.
- **Key Files**:
  - `server/middleware/auth.js`
  - `server/controllers/authController.js`
  - `client/src/context/AuthContext.jsx`
  - `client/src/components/ProtectedRoute.jsx`
- **Key API Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`

---

## 2. Appointment Scheduling & Slot Generation Module

- **What it does**: Computes 30-minute available consultation slots for any selected doctor and date based on doctor working hours and existing active bookings.
- **Why it exists**: Prevents double-booking doctor time, prevents patients from booking outside working hours, and provides a clear UI grid of available slots.
- **Input**: `doctorId`, `appointmentDate` (YYYY-MM-DD), requested `startTime` & `endTime`.
- **Processing**:
  1. Identifies the day of week for `appointmentDate` (e.g., Monday).
  2. Reads doctor's `availability` schema for that day.
  3. Divides working hours into 30-minute intervals (e.g., 09:00 - 09:30, 09:30 - 10:00).
  4. Queries `Appointment` collection for active bookings (`status !== 'CANCELLED'`) matching doctor and date.
  5. Filters out booked slots.
  6. Backend validates slot availability before persisting new appointment.
- **Output**: Array of `{ startTime, endTime, available: boolean }` slots, or saved Appointment document.
- **Important Business Rules**:
  - Final availability check MUST occur on the backend (`slotService.js`), not relying on frontend state alone.
  - Cancelled appointments release their slot back to available status.
- **Key Files**:
  - `server/services/slotService.js`
  - `server/controllers/doctorController.js`
  - `server/controllers/appointmentController.js`
  - `client/src/pages/BookAppointment.jsx`
- **Key API Endpoints**:
  - `GET /api/doctors/:id/availability?date=YYYY-MM-DD`
  - `POST /api/appointments`

---

## 3. Queue Management Module

- **What it does**: Assigns doctor-and-date scoped queue numbers (`U-001` for Urgent, `N-001` for Normal) and orders the doctor's daily patient list with urgent priority first.
- **Why it exists**: Manages outpatient department (OPD) flow efficiently and ensures emergency/urgent cases receive immediate attention ahead of routine checkups.
- **Input**: `doctorId`, `appointmentDate`, `priority` (`NORMAL` | `URGENT`), `status` transition.
- **Processing**:
  1. Counts existing appointments for the doctor and date with the specified priority to assign sequential queue numbers (`U-001`, `U-002`, `N-001`...).
  2. Sorts doctor queue items: `URGENT` items placed at the top, followed by `NORMAL` items ordered by appointment start time.
  3. Doctor updates queue status (`IN_QUEUE` → `IN_PROGRESS` → `COMPLETED`).
- **Output**: Live OPD queue metrics (`waiting`, `inProgress`, `completed`) and sorted queue list.
- **Important Business Rules**:
  - Queue numbers reset per Doctor per Date (each doctor has their own daily queue sequence).
  - Urgent priority appointments move to the top of the queue.
- **Key Files**:
  - `server/services/queueService.js`
  - `server/controllers/queueController.js`
  - `client/src/pages/DoctorQueue.jsx`
- **Key API Endpoints**:
  - `GET /api/queue/:doctorId?date=YYYY-MM-DD`
  - `PATCH /api/queue/:appointmentId/status`

---

## 4. Admin Analytics & User Management Module

- **What it does**: Aggregates system metrics (patient count, doctor count, total appointments, today's appointments) and renders visual distribution charts via Recharts.
- **Why it exists**: Provides hospital administrators with total visibility into operations, workload distribution, and staff onboarding.
- **Input**: System collections query aggregates.
- **Output**: Summary stats object, department counts, status breakdown array.
- **Key Files**:
  - `server/controllers/adminController.js`
  - `client/src/pages/AdminDashboard.jsx`
- **Key API Endpoints**:
  - `GET /api/admin/stats`
  - `GET /api/admin/users`
  - `GET /api/admin/appointments`
  - `POST /api/admin/doctors`
