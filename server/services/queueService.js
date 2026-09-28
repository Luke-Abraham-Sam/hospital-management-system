const Appointment = require('../models/Appointment');

/**
 * Generate queue number scoped by Doctor + Appointment Date
 * U-001 for Urgent, N-001 for Normal
 */
const generateQueueNumber = async (doctorId, appointmentDate, priority) => {
  const isUrgent = priority === 'URGENT';
  const prefix = isUrgent ? 'U' : 'N';

  // Count existing appointments for this doctor and date with the same priority
  const count = await Appointment.countDocuments({
    doctorId,
    appointmentDate,
    priority: isUrgent ? 'URGENT' : 'NORMAL'
  });

  const nextNumber = count + 1;
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Sort queue items so URGENT appointments come before NORMAL,
 * and within each priority group, sorted by appointment startTime or queue number.
 */
const sortQueueAppointments = (appointments) => {
  return appointments.sort((a, b) => {
    // 1. URGENT first
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
    if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1;

    // 2. Same priority: sort by start time (e.g. "09:00" < "09:30")
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;

    return 0;
  });
};

module.exports = {
  generateQueueNumber,
  sortQueueAppointments
};
