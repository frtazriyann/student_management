const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, submitTask, getStudentTasks } = require('../controllers/taskController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.get('/my-tasks', protect, studentOnly, getStudentTasks);
router.put('/:id/submit', protect, studentOnly, submitTask);
router.route('/').get(protect, adminOnly, getTasks).post(protect, adminOnly, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, adminOnly, deleteTask);

module.exports = router;
