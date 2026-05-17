const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceReport, getStudentAttendance } = require('../controllers/attendanceController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.get('/my-attendance', protect, studentOnly, getStudentAttendance);
router.get('/report', protect, getAttendanceReport);
router.post('/mark', protect, adminOnly, markAttendance);
router.get('/', protect, getAttendance);

module.exports = router;
