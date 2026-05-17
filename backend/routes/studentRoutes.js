const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentProfile } = require('../controllers/studentController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.get('/profile', protect, studentOnly, getStudentProfile);
router.route('/').get(protect, adminOnly, getStudents).post(protect, adminOnly, createStudent);
router.route('/:id').get(protect, getStudent).put(protect, adminOnly, updateStudent).delete(protect, adminOnly, deleteStudent);

module.exports = router;
