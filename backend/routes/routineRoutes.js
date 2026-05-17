const express = require('express');
const router = express.Router();
const { getRoutines, createRoutine, updateRoutine, deleteRoutine } = require('../controllers/routineController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, getRoutines).post(protect, adminOnly, createRoutine);
router.route('/:id').put(protect, adminOnly, updateRoutine).delete(protect, adminOnly, deleteRoutine);

module.exports = router;
