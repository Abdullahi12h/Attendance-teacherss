const { User, TeacherProfile } = require('../models');

const getTeachers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const profileFilter = {};
    if (status) profileFilter.status = status;

    const total = await TeacherProfile.countDocuments(profileFilter);
    const teachers = await TeacherProfile.find(profileFilter)
      .populate({
        path: 'userId',
        select: 'username email first_name last_name role photo phone is_active',
        ...(search ? {
          match: {
            $or: [
              { first_name: new RegExp(search, 'i') },
              { last_name: new RegExp(search, 'i') },
              { email: new RegExp(search, 'i') },
            ]
          }
        } : {})
      })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const filtered = search ? teachers.filter(t => t.userId) : teachers;
    res.json({ teachers: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, photo, employee_id, department, status } = req.body;
    const user = await User.create({
      username, email, password: password || 'Teacher@123',
      first_name, last_name, phone, photo, role: 'teacher',
    });
    const profile = await TeacherProfile.create({ userId: user._id, employee_id, department, status });
    const result = await TeacherProfile.findById(profile._id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id).populate('userId');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    const { first_name, last_name, email, phone, photo, employee_id, department, status } = req.body;
    await User.findByIdAndUpdate(teacher.userId._id, { first_name, last_name, email, phone, photo });
    Object.assign(teacher, { employee_id, department, status });
    await teacher.save();

    const updated = await TeacherProfile.findById(req.params.id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
    await User.findByIdAndDelete(teacher.userId);
    await teacher.deleteOne();
    res.json({ message: 'Teacher deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
