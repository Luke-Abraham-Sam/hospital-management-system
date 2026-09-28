const Doctor = require('../models/Doctor');
const slotService = require('../services/slotService');

/**
 * @desc    Get all doctors with basic details
 * @route   GET /api/doctors
 * @access  Public / Authenticated
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public / Authenticated
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor available slots for a specific date
 * @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
 * @access  Public / Authenticated
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter (YYYY-MM-DD) is required' });
    }

    const availabilityData = await slotService.getAvailableSlots(id, date);

    res.json({
      success: true,
      data: availabilityData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor availability working hours
 * @route   PUT /api/doctors/:id/availability
 * @access  Private (Doctor / Admin)
 */
const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    let doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Ensure authorized doctor or admin
    if (req.user.role === 'DOCTOR' && doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update another doctor\'s availability' });
    }

    if (!availability) {
      return res.status(400).json({ success: false, message: 'Availability schedule object is required' });
    }

    doctor.availability = { ...doctor.availability, ...availability };
    await doctor.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorAvailability
};
