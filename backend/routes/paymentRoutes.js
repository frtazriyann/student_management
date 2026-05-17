const express = require('express');
const router = express.Router();
const { getPayments, createPayment, updatePayment, getPaymentStats, getStudentPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getPaymentStats);
router.get('/student/:studentId?', protect, getStudentPayments);
router.route('/').get(protect, adminOnly, getPayments).post(protect, adminOnly, createPayment);
router.route('/:id').put(protect, adminOnly, updatePayment);

module.exports = router;
