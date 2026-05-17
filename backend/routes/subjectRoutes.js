const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, getSubjects).post(protect, adminOnly, createSubject);
router.route('/:id').put(protect, adminOnly, updateSubject).delete(protect, adminOnly, deleteSubject);

module.exports = router;
