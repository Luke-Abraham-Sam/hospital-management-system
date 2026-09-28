const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const slotService = require('../services/slotService');
const queueService = require('../services/queueService');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, reason, priority } = req.body;

    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, appointmentDate, startTime, and endTime are required'
      });
    }

    // 1. Perform backend slot availability and double-booking validation
    const slotValidation = await slotService.validateSlotBooking(doctorId, appointmentDate, startTime, endTime);
    if (!slotValidation.valid) {
      return res.status(400).json({
        success: false,
        message: slotValidation.reason
      });
    }

    // 2. Generate Doctor + Date scoped queue number (e.g. U-001 or N-001)
    const appointmentPriority = priority === 'URGENT' ? 'URGENT' : 'NORMAL';
    const queueNumber = await queueService.generateQueueNumber(doctorId, appointmentDate, appointmentPriority);

    // 3. Save Appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      reason: reason || 'General Consultation',
      priority: appointmentPriority,
      queueNumber,
      status: 'BOOKED'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in patient
 * @route   GET /api/appointments/my
 * @access  Private (Patient)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        select: 'specialization department consultationFee',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ appointmentDate: -1, startTime: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in doctor
 * @route   GET /api/appointments/doctor
 * @access  Private (Doctor)
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const filter = { doctorId: doctor._id };
    if (req.query.date) {
      filter.appointmentDate = req.query.date;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: 1, startTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments: queueService.sortQueueAppointments(appointments)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment details
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor / Admin)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['BOOKED', 'CONFIRMED', 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Patient can only cancel their own appointment
    if (req.user.role === 'PATIENT' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'CANCELLED';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
};
