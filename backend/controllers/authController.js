const Admin = require('../models/Admin');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const admin = await Admin.create({ name, email, password, phone });
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email }).select('+password');
    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      batch: student.batch,
      token: generateToken(student._id, 'student'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
