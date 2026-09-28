# Hospital Management System API Documentation

Base URL: `/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/register`
Register a new patient account.

- **Access**: Public
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "patient123",
  "phone": "+1-555-0201",
  "role": "PATIENT"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6600a1b2c3d4e5f678901234",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "PATIENT",
    "phone": "+1-555-0201",
    "doctorId": null
  }
}
```

### POST `/api/auth/login`
Authenticate user and obtain JWT token.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "smith@hospital.com",
  "password": "doctor123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6600a1b2c3d4e5f678905678",
    "name": "Dr. Sarah Smith",
    "email": "smith@hospital.com",
    "role": "DOCTOR",
    "doctorId": "6600a1b2c3d4e5f678909999"
  }
}
```

### GET `/api/auth/me`
Retrieve currently authenticated user profile.

- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "_id": "6600a1b2c3d4e5f678901234",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "PATIENT"
  }
}
```

---

## 2. Doctor Endpoints (`/api/doctors`)

### GET `/api/doctors`
List all active hospital doctors.

- **Access**: Public / Authenticated
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 3,
  "doctors": [
    {
      "_id": "6600a1b2c3d4e5f678909999",
      "userId": {
        "_id": "6600a1b2c3d4e5f678905678",
        "name": "Dr. Sarah Smith",
        "email": "smith@hospital.com"
      },
      "specialization": "Cardiology",
      "department": "Cardiovascular Health",
      "experience": 12,
      "consultationFee": 120
    }
  ]
}
```

### GET `/api/doctors/:id/availability?date=YYYY-MM-DD`
Retrieve generated 30-minute consultation slots for a specific doctor and date.

- **Access**: Public / Authenticated
- **Query Params**: `date` (format: `2026-09-30`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "date": "2026-09-30",
    "day": "Wednesday",
    "isAvailable": true,
    "slots": [
      { "startTime": "09:00", "endTime": "09:30", "available": true },
      { "startTime": "09:30", "endTime": "10:00", "available": false },
      { "startTime": "10:00", "endTime": "10:30", "available": true }
    ]
  }
}
```

---

## 3. Appointment Endpoints (`/api/appointments`)

### POST `/api/appointments`
Book a new appointment slot.

- **Access**: Private (Patient)
- **Request Body**:
```json
{
  "doctorId": "6600a1b2c3d4e5f678909999",
  "appointmentDate": "2026-09-30",
  "startTime": "09:00",
  "endTime": "09:30",
  "priority": "URGENT",
  "reason": "Severe chest tightness"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "6600b888c3d4e5f678907777",
    "patientId": "6600a1b2c3d4e5f678901234",
    "doctorId": "6600a1b2c3d4e5f678909999",
    "appointmentDate": "2026-09-30",
    "startTime": "09:00",
    "endTime": "09:30",
    "priority": "URGENT",
    "queueNumber": "U-001",
    "status": "BOOKED"
  }
}
```

### GET `/api/appointments/my`
List appointments for logged-in patient.

- **Access**: Private (Patient)
- **Response (200 OK)**: Array of appointment records populated with doctor info.

---

## 4. Queue Endpoints (`/api/queue`)

### GET `/api/queue/:doctorId?date=YYYY-MM-DD`
Get live OPD queue for doctor on date (sorted with URGENT priority first).

- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "doctorId": "6600a1b2c3d4e5f678909999",
  "date": "2026-09-28",
  "metrics": {
    "totalAppointments": 3,
    "waiting": 2,
    "inProgress": 1,
    "completed": 0
  },
  "currentlyServing": {
    "_id": "...",
    "queueNumber": "N-001",
    "status": "IN_PROGRESS"
  },
  "queue": [ ... ]
}
```

### PATCH `/api/queue/:appointmentId/status`
Update appointment status in queue.

- **Access**: Private (Doctor / Admin)
- **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```

---

## 5. Admin Endpoints (`/api/admin`)

### GET `/api/admin/stats`
Get system-wide metrics and status breakdown.

- **Access**: Private (Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalPatients": 14,
    "totalDoctors": 3,
    "totalAppointments": 28,
    "todayAppointmentsCount": 5
  },
  "statusBreakdown": [
    { "status": "BOOKED", "count": 10 },
    { "status": "COMPLETED", "count": 12 },
    { "status": "IN_QUEUE", "count": 4 },
    { "status": "CANCELLED", "count": 2 }
  ]
}
```
