const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  getAllAppointments,
  createDoctor
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/appointments', getAllAppointments);
router.post('/doctors', createDoctor);

module.exports = router;
