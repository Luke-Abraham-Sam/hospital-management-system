# Hospital Management System - Testing Guide & Scenarios

This document outlines the test cases, automated verification steps, and manual test scenarios to validate the Hospital Appointment & Queue Management System.

---

## 1. Automated Verification Checks

Run the following commands in terminal:

### Backend Unit & Service Tests:
```bash
cd server
npm test
```
*Expected Output*: Checks time calculation helpers, slot parsing, date computation, and queue priority ordering (`URGENT` top priority). All tests pass with zero errors.

### Database Seeding Test:
```bash
cd server
npm run seed
```
*Expected Output*: Connects to MongoDB URI, clears old data, creates Admin, 3 Doctors, 3 Patients, and sample appointments with `U-001` and `N-001` queue numbers.

### Frontend Compilation Build Test:
```bash
cd client
npm run build
```
*Expected Output*: Vite packages production assets into `dist/` with zero JavaScript compiler or JSX syntax errors.

---

## 2. Manual End-to-End Test Scenarios

### Scenario A: Patient Registration & Authentication
1. Navigate to `/register`.
2. Fill out Name, Email (`newpatient@example.com`), Phone, and Password (`patient123`).
3. Click **Create Account**.
4. *Expected Result*: Redirected to `/patient/dashboard`. Header shows user name and `PATIENT` badge. JWT token saved in `localStorage`.

### Scenario B: Doctor Directory & Availability Slot Viewing
1. Log in as Patient (`john.doe@example.com` / `patient123`).
2. Go to **Find Doctors** (`/patient/doctors`).
3. Click **Book Appointment** on Dr. Sarah Smith (Cardiology).
4. Change appointment date to tomorrow's date.
5. *Expected Result*: Interactive 30-minute time slots render dynamically (`09:00`, `09:30`, `10:00`...). Booked slots are disabled and styled line-through.

### Scenario C: Slot Booking & Queue Number Assignment
1. Select an available slot (e.g. `11:00`).
2. Select Priority: `URGENT Priority`.
3. Input Reason: "Emergency chest tightness".
4. Click **Confirm Appointment Booking**.
5. *Expected Result*: Confirmation card appears displaying assigned Doctor+Date scoped queue number (e.g., `U-001`).

### Scenario D: Double-Booking Prevention Check
1. Open a second browser window / incognito tab and log in as another patient (`jane.smith@example.com`).
2. Attempt to book the **exact same doctor, date, and 11:00 time slot**.
3. *Expected Result*: Slot `11:00` appears disabled in the UI. If forced via API, backend returns `400 Bad Request` with message `"This slot has already been booked by another patient"`.

### Scenario E: Doctor Live Queue Management
1. Log in as Doctor (`smith@hospital.com` / `doctor123`).
2. Navigate to **Live Queue** (`/doctor/queue`).
3. *Expected Result*:
   - Queue items are sorted with `URGENT` priority items (`U-001`) at the top of the table.
   - Clicking **Start Consultation** updates status to `IN_PROGRESS` and highlights row in green.
   - Clicking **Complete** updates status to `COMPLETED`.

### Scenario F: Admin Metrics & Staff Management
1. Log in as Admin (`admin@hospital.com` / `admin123`).
2. Navigate to **Admin Dashboard** (`/admin/dashboard`).
3. *Expected Result*: Total Patients, Total Doctors, Total Appointments metrics display live numbers. Recharts status breakdown chart displays visual bar graph.
4. Click **Register New Doctor** modal, input details, and submit.
5. *Expected Result*: New doctor account created and listed under **User Directory** (`/admin/users`).
