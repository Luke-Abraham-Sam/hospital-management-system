const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    trim: true
  },
  startTime: {
    type: String, // e.g. "09:30"
    required: true,
    trim: true
  },
  endTime: {
    type: String, // e.g. "10:00"
    required: true,
    trim: true
  },
  reason: {
    type: String,
    default: 'General Consultation',
    trim: true
  },
  priority: {
    type: String,
    enum: ['NORMAL', 'URGENT'],
    default: 'NORMAL'
  },
  queueNumber: {
    type: String, // e.g. "U-001" or "N-001"
    required: true
  },
  status: {
    type: String,
    enum: ['BOOKED', 'CONFIRMED', 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'BOOKED'
  }
}, {
  timestamps: true
});

// Index to optimize lookup queries for appointment slots and queue
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
