const { Department, Program, Course, Subject, Classroom, Semester } = require('../models');

// ── Departments ───────────────────────────────────────────────────────────────
const getDepartments = async (req, res) => {
  try {
    const items = await Department.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const createDepartment = async (req, res) => {
  try { res.status(201).json(await Department.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateDepartment = async (req, res) => {
  try {
    const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Programs ──────────────────────────────────────────────────────────────────
const getPrograms = async (req, res) => {
  try {
    const items = await Program.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const createProgram = async (req, res) => {
  try { res.status(201).json(await Program.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateProgram = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteProgram = async (req, res) => {
  try { await Program.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Courses ───────────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const items = await Course.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const createCourse = async (req, res) => {
  try { res.status(201).json(await Course.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateCourse = async (req, res) => {
  try {
    const item = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteCourse = async (req, res) => {
  try { await Course.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Subjects ──────────────────────────────────────────────────────────────────
const getSubjects = async (req, res) => {
  try {
    const items = await Subject.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const createSubject = async (req, res) => {
  try { res.status(201).json(await Subject.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateSubject = async (req, res) => {
  try {
    const item = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteSubject = async (req, res) => {
  try { await Subject.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Classrooms ────────────────────────────────────────────────────────────────
const getClassrooms = async (req, res) => {
  try { res.json(await Classroom.find().sort({ room_number: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const createClassroom = async (req, res) => {
  try { res.status(201).json(await Classroom.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateClassroom = async (req, res) => {
  try {
    const item = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteClassroom = async (req, res) => {
  try { await Classroom.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Semesters ─────────────────────────────────────────────────────────────────
const getSemesters = async (req, res) => {
  try { res.json(await Semester.find().sort({ start_date: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const createSemester = async (req, res) => {
  try { res.status(201).json(await Semester.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const updateSemester = async (req, res) => {
  try {
    const item = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteSemester = async (req, res) => {
  try { await Semester.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getPrograms, createProgram, updateProgram, deleteProgram,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getClassrooms, createClassroom, updateClassroom, deleteClassroom,
  getSemesters, createSemester, updateSemester, deleteSemester,
};
