const express = require('express');
const router = express.Router();
const { getResults, createResult, updateResult, deleteResult, getStudentResults, getPerformanceAnalytics } = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my-results', protect, getStudentResults);
router.get('/analytics/:studentId?', protect, getPerformanceAnalytics);
router.route('/').get(protect, getResults).post(protect, adminOnly, createResult);
router.route('/:id').put(protect, adminOnly, updateResult).delete(protect, adminOnly, deleteResult);

module.exports = router;
