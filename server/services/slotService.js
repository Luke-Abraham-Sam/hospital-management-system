const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Helper to convert "HH:MM" string to total minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to convert total minutes back to "HH:MM" string
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper to get Day Name from YYYY-MM-DD
const getDayName = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
};

/**
 * Generate 30-minute available slots for a given doctor and date
 */
const getAvailableSlots = async (doctorId, dateStr) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const dayName = getDayName(dateStr);
  const dayConfig = doctor.availability[dayName];

  if (!dayConfig || !dayConfig.available || !dayConfig.slots || dayConfig.slots.length === 0) {
    return {
      date: dateStr,
      day: dayName,
      isAvailable: false,
      slots: []
    };
  }

  // Get existing active appointments for this doctor on this date
  const existingAppointments = await Appointment.find({
    doctorId,
    appointmentDate: dateStr,
    status: { $ne: 'CANCELLED' }
  }).select('startTime endTime status');

  const bookedTimeMap = new Set(existingAppointments.map(app => app.startTime));

  const slots = [];
  const slotDuration = 30; // 30 minutes per appointment slot

  for (const timeBlock of dayConfig.slots) {
    let currentMinutes = timeToMinutes(timeBlock.startTime);
    const endMinutes = timeToMinutes(timeBlock.endTime);

    while (currentMinutes + slotDuration <= endMinutes) {
      const startTime = minutesToTime(currentMinutes);
      const endTime = minutesToTime(currentMinutes + slotDuration);
      const isBooked = bookedTimeMap.has(startTime);

      slots.push({
        startTime,
        endTime,
        available: !isBooked
      });

      currentMinutes += slotDuration;
    }
  }

  return {
    date: dateStr,
    day: dayName,
    isAvailable: true,
    slots
  };
};

/**
 * Validate slot availability on backend before saving new appointment
 */
const validateSlotBooking = async (doctorId, appointmentDate, startTime, endTime) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return { valid: false, reason: 'Doctor does not exist' };

  const dayName = getDayName(appointmentDate);
  const dayConfig = doctor.availability[dayName];

  if (!dayConfig || !dayConfig.available) {
    return { valid: false, reason: `Doctor is not available on ${dayName}s` };
  }

  // Check if requested time falls within doctor's working slots
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  let fallsInWorkingHours = false;
  for (const timeBlock of dayConfig.slots) {
    const blockStart = timeToMinutes(timeBlock.startTime);
    const blockEnd = timeToMinutes(timeBlock.endTime);
    if (startMin >= blockStart && endMin <= blockEnd) {
      fallsInWorkingHours = true;
      break;
    }
  }

  if (!fallsInWorkingHours) {
    return { valid: false, reason: 'Requested time is outside doctor working hours' };
  }

  // Check for duplicate booking in database
  const existing = await Appointment.findOne({
    doctorId,
    appointmentDate,
    startTime,
    status: { $ne: 'CANCELLED' }
  });

  if (existing) {
    return { valid: false, reason: 'This slot has already been booked by another patient' };
  }

  return { valid: true };
};

module.exports = {
  getAvailableSlots,
  validateSlotBooking,
  getDayName,
  timeToMinutes,
  minutesToTime
};
