const express = require('express');
const router = express.Router();
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, getExams).post(protect, adminOnly, createExam);
router.route('/:id').put(protect, adminOnly, updateExam).delete(protect, adminOnly, deleteExam);

module.exports = router;
