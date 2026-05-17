const Payment = require('../models/Payment');
const Student = require('../models/Student');

exports.getPayments = async (req, res) => {
  try {
    const { student, month, year, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (student) query.student = student;
    if (month) query.month = month;
    if (year) query.year = Number(year);
    if (status) query.status = status;
    const payments = await Payment.find(query)
      .populate('student', 'name email batch phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Payment.countDocuments(query);
    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { student, month, year, amount } = req.body;
    const exists = await Payment.findOne({ student, month, year });
    if (exists) return res.status(400).json({ message: 'Payment record already exists for this month' });
    const s = await Student.findById(student);
    if (!s) return res.status(404).json({ message: 'Student not found' });
    const dueAmount = s.monthlyFee - (amount || 0);
    const status = amount >= s.monthlyFee ? 'paid' : amount > 0 ? 'partial' : 'unpaid';
    const payment = await Payment.create({
      ...req.body,
      dueAmount: Math.max(0, dueAmount),
      status,
      paidDate: amount > 0 ? new Date() : undefined,
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const s = await Student.findById(payment.student);
    if (req.body.amount !== undefined && s) {
      req.body.dueAmount = Math.max(0, s.monthlyFee - req.body.amount);
      req.body.status = req.body.amount >= s.monthlyFee ? 'paid' : req.body.amount > 0 ? 'partial' : 'unpaid';
      if (req.body.amount > 0) req.body.paidDate = new Date();
    }
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('student', 'name email batch');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};
    if (year) query.year = Number(year);
    if (month) query.month = month;
    const totalPaid = await Payment.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDue = await Payment.aggregate([
      { $match: { ...query, status: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$dueAmount' } } },
    ]);
    const totalStudents = await Student.countDocuments({ isActive: true });
    const paidCount = await Payment.countDocuments({ ...query, status: 'paid' });
    const unpaidCount = await Payment.countDocuments({ ...query, status: { $in: ['unpaid', 'partial'] } });
    res.json({
      totalCollected: totalPaid[0]?.total || 0,
      totalDue: totalDue[0]?.total || 0,
      totalStudents,
      paidCount,
      unpaidCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.params.studentId;
    const payments = await Payment.find({ student: studentId })
      .sort({ year: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
