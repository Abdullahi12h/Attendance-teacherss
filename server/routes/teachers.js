const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');

router.get('/', protect, getTeachers);
router.get('/:id', protect, getTeacher);
router.post('/', protect, roles('admin'), createTeacher);
router.put('/:id', protect, roles('admin'), updateTeacher);
router.delete('/:id', protect, roles('admin'), deleteTeacher);

module.exports = router;
