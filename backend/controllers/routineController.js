const Routine = require('../models/Routine');

exports.getRoutines = async (req, res) => {
  try {
    const { batch, day, type } = req.query;
    const query = {};
    if (batch) query.batch = batch;
    if (day) query.day = day;
    if (type) query.type = type;
    const routines = await Routine.find(query)
      .populate('subject', 'name code')
      .sort({ day: 1, startTime: 1 });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoutine = async (req, res) => {
  try {
    const routine = await Routine.create(req.body);
    const populated = await routine.populate('subject', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code');
    if (!routine) return res.status(404).json({ message: 'Routine not found' });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });
    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
