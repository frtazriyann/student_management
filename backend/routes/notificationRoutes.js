const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, getStudentNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.get('/my-notifications', protect, studentOnly, getStudentNotifications);
router.put('/:id/read', protect, markAsRead);
router.route('/').get(protect, adminOnly, getNotifications).post(protect, adminOnly, createNotification);

module.exports = router;
