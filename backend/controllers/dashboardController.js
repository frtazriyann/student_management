const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');

exports.getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const [
      totalStudents,
      activeStudents,
      totalPaymentsPaid,
      totalPaymentsDue,
      pendingTasks,
      upcomingExams,
      todayAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { month: currentMonth, year: currentYear, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { month: currentMonth, year: currentYear, status: { $in: ['unpaid', 'partial'] } } },
        { $group: { _id: null, total: { $sum: '$dueAmount' } } },
      ]),
      Task.countDocuments({ status: { $in: ['pending', 'in-progress'] } }),
      Exam.countDocuments({ date: { $gte: now } }),
      Attendance.countDocuments({
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
        status: 'present',
      }),
    ]);

    const recentPayments = await Payment.find()
      .populate('student', 'name batch')
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { year: currentYear, status: 'paid' } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalStudents,
      activeStudents,
      totalCollected: totalPaymentsPaid[0]?.total || 0,
      totalDue: totalPaymentsDue[0]?.total || 0,
      pendingTasks,
      upcomingExams,
      todayAttendance,
      recentPayments,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const [
      student,
      payments,
      pendingTasks,
      recentResults,
      attendanceStats,
    ] = await Promise.all([
      Student.findById(studentId).populate('subjects', 'name code'),
      Payment.find({ student: studentId, year: currentYear }).sort({ createdAt: -1 }),
      Task.countDocuments({ assignedTo: studentId, status: { $in: ['pending', 'in-progress'] } }),
      Result.find({ student: studentId })
        .populate({ path: 'exam', populate: { path: 'subject', select: 'name code' } })
        .sort({ createdAt: -1 })
        .limit(5),
      Attendance.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const currentPayment = payments.find((p) => p.month === currentMonth);
    const totalDue = payments
      .filter((p) => p.status !== 'paid')
      .reduce((sum, p) => sum + p.dueAmount, 0);

    res.json({
      student,
      currentPayment,
      totalDue,
      pendingTasks,
      recentResults,
      attendanceStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
