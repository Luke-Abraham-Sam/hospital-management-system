const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, requireRole('PATIENT'), createAppointment);
router.get('/my', requireAuth, requireRole('PATIENT'), getMyAppointments);
router.get('/doctor', requireAuth, requireRole('DOCTOR', 'ADMIN'), getDoctorAppointments);
router.get('/:id', requireAuth, getAppointmentById);
router.patch('/:id/status', requireAuth, requireRole('DOCTOR', 'ADMIN'), updateAppointmentStatus);
router.patch('/:id/cancel', requireAuth, cancelAppointment);

module.exports = router;
