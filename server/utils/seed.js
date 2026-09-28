const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'ADMIN',
      phone: '+1-555-0100'
    });

    // 2. Create Doctors (Users + Doctor Profiles)
    const docUser1 = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'smith@hospital.com',
      password: 'doctor123',
      role: 'DOCTOR',
      phone: '+1-555-0101'
    });
    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      specialization: 'Cardiology',
      department: 'Cardiovascular Health',
      experience: 12,
      consultationFee: 120
    });

    const docUser2 = await User.create({
      name: 'Dr. Rajesh Patel',
      email: 'patel@hospital.com',
      password: 'doctor123',
      role: 'DOCTOR',
      phone: '+1-555-0102'
    });
    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      specialization: 'Pediatrics',
      department: 'Pediatric Care',
      experience: 8,
      consultationFee: 90
    });

    const docUser3 = await User.create({
      name: 'Dr. Emily Johnson',
      email: 'johnson@hospital.com',
      password: 'doctor123',
      role: 'DOCTOR',
      phone: '+1-555-0103'
    });
    const doctor3 = await Doctor.create({
      userId: docUser3._id,
      specialization: 'Neurology',
      department: 'Neurosciences',
      experience: 15,
      consultationFee: 150
    });

    // 3. Create Patients
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'patient123',
      role: 'PATIENT',
      phone: '+1-555-0201'
    });

    const patient2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'patient123',
      role: 'PATIENT',
      phone: '+1-555-0202'
    });

    const patient3 = await User.create({
      name: 'Robert Brown',
      email: 'robert.b@example.com',
      password: 'patient123',
      role: 'PATIENT',
      phone: '+1-555-0203'
    });

    // 4. Create Initial Sample Appointments
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Tomorrow string
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Today's appointments for Dr. Smith
    await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentDate: todayStr,
      startTime: '09:00',
      endTime: '09:30',
      reason: 'Routine ECG Checkup',
      priority: 'NORMAL',
      queueNumber: 'N-001',
      status: 'IN_PROGRESS'
    });

    await Appointment.create({
      patientId: patient2._id,
      doctorId: doctor1._id,
      appointmentDate: todayStr,
      startTime: '09:30',
      endTime: '10:00',
      reason: 'Chest discomfort & palpitation',
      priority: 'URGENT',
      queueNumber: 'U-001',
      status: 'IN_QUEUE'
    });

    await Appointment.create({
      patientId: patient3._id,
      doctorId: doctor1._id,
      appointmentDate: todayStr,
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Hypertension Follow-up',
      priority: 'NORMAL',
      queueNumber: 'N-002',
      status: 'BOOKED'
    });

    // Today's appointment for Dr. Patel
    await Appointment.create({
      patientId: patient2._id,
      doctorId: doctor2._id,
      appointmentDate: todayStr,
      startTime: '11:00',
      endTime: '11:30',
      reason: 'Child Vaccination Follow-up',
      priority: 'NORMAL',
      queueNumber: 'N-001',
      status: 'COMPLETED'
    });

    // Tomorrow's appointment for Dr. Johnson
    await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor3._id,
      appointmentDate: tomorrowStr,
      startTime: '14:00',
      endTime: '14:30',
      reason: 'Migraine consultation',
      priority: 'NORMAL',
      queueNumber: 'N-001',
      status: 'CONFIRMED'
    });

    console.log('\n==================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log('==================================================');
    console.log(' Demo Accounts Created:');
    console.log(' 👑 Admin:   admin@hospital.com   / admin123');
    console.log(' 🩺 Doctor:  smith@hospital.com   / doctor123  (Dr. Sarah Smith - Cardiology)');
    console.log(' 🩺 Doctor:  patel@hospital.com   / doctor123  (Dr. Rajesh Patel - Pediatrics)');
    console.log(' 🩺 Doctor:  johnson@hospital.com / doctor123  (Dr. Emily Johnson - Neurology)');
    console.log(' 👤 Patient: john.doe@example.com / patient123 (John Doe)');
    console.log(' 👤 Patient: jane.smith@example.com/ patient123 (Jane Smith)');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
