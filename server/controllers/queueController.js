const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const queueService = require('../services/queueService');

/**
 * @desc    Get queue for a specific doctor for today (or specified date)
 * @route   GET /api/queue/:doctorId?date=YYYY-MM-DD
 * @access  Private (Doctor / Admin / Patient)
 */
const getDoctorQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = req.query.date || todayStr;

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get active appointments for queue (exclude CANCELLED)
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: targetDate,
      status: { $ne: 'CANCELLED' }
    }).populate('patientId', 'name email phone');

    const sortedQueue = queueService.sortQueueAppointments(appointments);

    // Calculate queue metrics
    const totalInQueue = sortedQueue.filter(a => a.status === 'IN_QUEUE' || a.status === 'BOOKED' || a.status === 'CONFIRMED').length;
    const currentlyServing = sortedQueue.find(a => a.status === 'IN_PROGRESS') || null;
    const completedCount = sortedQueue.filter(a => a.status === 'COMPLETED').length;

    res.json({
      success: true,
      doctorId,
      doctorName: doctor.userId ? doctor.userId.name : 'Doctor',
      date: targetDate,
      metrics: {
        totalAppointments: sortedQueue.length,
        waiting: totalInQueue,
        inProgress: currentlyServing ? 1 : 0,
        completed: completedCount
      },
      currentlyServing,
      queue: sortedQueue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment/queue status directly from Queue View
 * @route   PATCH /api/queue/:appointmentId/status
 * @access  Private (Doctor / Admin)
 */
const updateQueueStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['BOOKED', 'CONFIRMED', 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found in queue' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: `Queue item updated to ${status}`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorQueue,
  updateQueueStatus
};
