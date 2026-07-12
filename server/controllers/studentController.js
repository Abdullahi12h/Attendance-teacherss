const { User, StudentProfile } = require('../models');
const { Op } = require('sequelize');

const userAttrs = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'photo', 'phone', 'is_active'];

// GET /api/students
const getStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const where = {};
    const profileWhere = {};

    if (status) profileWhere.status = status;

    const students = await StudentProfile.findAndCountAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: userAttrs,
        where: search ? {
          [Op.or]: [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ]
        } : undefined,
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      students: students.rows,
      total: students.count,
      page: parseInt(page),
      pages: Math.ceil(students.count / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
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
      userId: user.id, student_id, gender, department, program,
      semester, academic_year, guardian, fingerprint_id, rfid, qr_code, status,
    });

    const result = await StudentProfile.findByPk(profile.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const {
      first_name, last_name, email, phone, photo,
      student_id, gender, department, program, semester, academic_year,
      guardian, fingerprint_id, rfid, qr_code, status,
    } = req.body;

    await student.user.update({ first_name, last_name, email, phone, photo });
    await student.update({ student_id, gender, department, program, semester, academic_year, guardian, fingerprint_id, rfid, qr_code, status });

    const updated = await StudentProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    await student.user.destroy(); // cascades to profile
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
