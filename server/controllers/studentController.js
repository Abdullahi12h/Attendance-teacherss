const { User, StudentProfile } = require('../models');

// GET /api/students
const getStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const profileFilter = {};
    if (status) profileFilter.status = status;

    let query = StudentProfile.find(profileFilter)
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
      .sort({ createdAt: -1 });

    const total = await StudentProfile.countDocuments(profileFilter);
    const students = await query
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Filter out students whose user didn't match search
    const filtered = search ? students.filter(s => s.userId) : students;

    res.json({
      students: filtered,
      total: filtered.length,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/students
const createStudent = async (req, res) => {
  try {
    const {
      username, email, password, first_name, last_name, phone, photo,
      student_id, gender, department, program, semester, academic_year,
      guardian, fingerprint_id, rfid, qr_code, status,
    } = req.body;

    const user = await User.create({
      username, email, password: password || 'Student@123',
      first_name, last_name, phone, photo, role: 'student',
    });

    const profile = await StudentProfile.create({
      userId: user._id, student_id, gender, department, program,
      semester, academic_year, guardian, fingerprint_id, rfid, qr_code, status,
    });

    const result = await StudentProfile.findById(profile._id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id).populate('userId');
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const {
      first_name, last_name, email, phone, photo,
      student_id, gender, department, program, semester, academic_year,
      guardian, fingerprint_id, rfid, qr_code, status,
    } = req.body;

    await User.findByIdAndUpdate(student.userId._id, { first_name, last_name, email, phone, photo });
    Object.assign(student, { student_id, gender, department, program, semester, academic_year, guardian, fingerprint_id, rfid, qr_code, status });
    await student.save();

    const updated = await StudentProfile.findById(req.params.id)
      .populate('userId', 'username email first_name last_name role photo phone is_active');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    await User.findByIdAndDelete(student.userId);
    await student.deleteOne();
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
