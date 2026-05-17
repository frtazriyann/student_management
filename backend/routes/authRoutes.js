const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, loginStudent, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register-admin', registerAdmin);
router.post('/login-admin', loginAdmin);
router.post('/login-student', loginStudent);
router.get('/me', protect, getMe);

module.exports = router;
