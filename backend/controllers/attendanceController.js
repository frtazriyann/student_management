const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Records array is required' });
    }
    const results = [];
    for (const record of records) {
      const existing = await Attendance.findOne({
        student: record.student,
        date: new Date(record.date),
      });
      if (existing) {
        existing.status = record.status;
        existing.notes = record.notes;
        await existing.save();
        results.push(existing);
      } else {
        const attendance = await Attendance.create({
          student: record.student,
          date: new Date(record.date),
          status: record.status,
          batch: record.batch,
          notes: record.notes,
        });
        results.push(attendance);
      }
    }
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { student, batch, date, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    if (student) query.student = student;
    if (batch) query.batch = batch;
    if (date) query.date = new Date(date);
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const attendance = await Attendance.find(query)
      .populate('student', 'name email batch')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Attendance.countDocuments(query);
    res.json({ attendance, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { student, month, year } = req.query;
    const studentId = student || req.user._id;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const records = await Attendance.find({
      student: studentId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const lateDays = records.filter((r) => r.status === 'late').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 100) / 100 : 0;
    res.json({ records, totalDays, presentDays, absentDays, lateDays, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user._id }).sort({ date: -1 });
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 100) / 100 : 0;
    res.json({ records, totalDays, presentDays, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
