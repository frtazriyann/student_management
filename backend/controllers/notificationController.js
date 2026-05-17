const Notification = require('../models/Notification');
const { sendSMS, sendWhatsApp } = require('../utils/notifications');
const Student = require('../models/Student');

exports.getNotifications = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    const notifications = await Notification.find(query)
      .populate('recipient', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments(query);
    res.json({ notifications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    if (req.body.channel === 'sms' || req.body.channel === 'whatsapp') {
      const student = await Student.findById(req.body.recipient);
      if (student && student.phone) {
        let result;
        if (req.body.channel === 'sms') {
          result = await sendSMS(student.phone, req.body.message);
        } else {
          result = await sendWhatsApp(student.phone, req.body.message);
        }
        notification.status = result.success ? 'sent' : 'failed';
        notification.sentAt = result.success ? new Date() : undefined;
        await notification.save();
      }
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { broadcast: true }],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
