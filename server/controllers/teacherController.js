const { User, TeacherProfile } = require('../models');
const { Op } = require('sequelize');

const userAttrs = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'photo', 'phone', 'is_active'];

const getTeachers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const profileWhere = {};
    if (status) profileWhere.status = status;

    const teachers = await TeacherProfile.findAndCountAll({
      where: profileWhere,
      include: [{
        model: User, as: 'user', attributes: userAttrs,
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

    res.json({ teachers: teachers.rows, total: teachers.count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
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
    const profile = await TeacherProfile.create({ userId: user.id, employee_id, department, status });
    const result = await TeacherProfile.findByPk(profile.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    const { first_name, last_name, email, phone, photo, employee_id, department, status } = req.body;
    await teacher.user.update({ first_name, last_name, email, phone, photo });
    await teacher.update({ employee_id, department, status });

    const updated = await TeacherProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: userAttrs }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
    await teacher.user.destroy();
    res.json({ message: 'Teacher deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
