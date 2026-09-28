const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get system dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'PATIENT' });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointmentsCount = await Appointment.countDocuments({ appointmentDate: todayStr });

    const statusBreakdown = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStatusBreakdown = statusBreakdown.map(item => ({
      status: item._id,
      count: item.count
    }));

    // Department breakdown
    const departmentStats = await Doctor.aggregate([
      { $group: { _id: '$department', doctorCount: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointmentsCount
      },
      statusBreakdown: formattedStatusBreakdown,
      departmentStats: departmentStats.map(d => ({ department: d._id, count: d.doctorCount }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments across the system
 * @route   GET /api/admin/appointments
 * @access  Private (Admin)
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

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
 * @desc    Create a new doctor account & profile
 * @route   POST /api/admin/doctors
 * @access  Private (Admin)
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, department, experience, consultationFee } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, specialization, and department are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'DOCTOR',
      phone: phone || ''
    });

    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      department,
      experience: experience || 0,
      consultationFee: consultationFee || 50
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      doctor: {
        _id: doctor._id,
        name: user.name,
        email: user.email,
        specialization: doctor.specialization,
        department: doctor.department
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  getAllAppointments,
  createDoctor
};
