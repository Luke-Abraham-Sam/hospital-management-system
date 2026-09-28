const mongoose = require('mongoose');

const slotTimeSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true }   // e.g. "13:00"
}, { _id: false });

const dayAvailabilitySchema = new mongoose.Schema({
  available: { type: Boolean, default: true },
  slots: [slotTimeSchema]
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  experience: {
    type: Number,
    default: 0
  },
  consultationFee: {
    type: Number,
    default: 50
  },
  availability: {
    Monday: { type: dayAvailabilitySchema, default: () => ({ available: true, slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "17:00" }] }) },
    Tuesday: { type: dayAvailabilitySchema, default: () => ({ available: true, slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "17:00" }] }) },
    Wednesday: { type: dayAvailabilitySchema, default: () => ({ available: true, slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "17:00" }] }) },
    Thursday: { type: dayAvailabilitySchema, default: () => ({ available: true, slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "17:00" }] }) },
    Friday: { type: dayAvailabilitySchema, default: () => ({ available: true, slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "17:00" }] }) },
    Saturday: { type: dayAvailabilitySchema, default: () => ({ available: false, slots: [] }) },
    Sunday: { type: dayAvailabilitySchema, default: () => ({ available: false, slots: [] }) }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
