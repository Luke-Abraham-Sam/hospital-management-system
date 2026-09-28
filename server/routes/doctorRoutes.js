const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorAvailability
} = require('../controllers/doctorController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);
router.put('/:id/availability', requireAuth, requireRole('DOCTOR', 'ADMIN'), updateDoctorAvailability);

module.exports = router;
