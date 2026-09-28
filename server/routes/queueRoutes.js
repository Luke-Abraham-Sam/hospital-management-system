const express = require('express');
const router = express.Router();
const { getDoctorQueue, updateQueueStatus } = require('../controllers/queueController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/:doctorId', requireAuth, getDoctorQueue);
router.patch('/:appointmentId/status', requireAuth, requireRole('DOCTOR', 'ADMIN'), updateQueueStatus);

module.exports = router;
