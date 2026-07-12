const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudent);
router.post('/', protect, roles('admin'), createStudent);
router.put('/:id', protect, roles('admin'), updateStudent);
router.delete('/:id', protect, roles('admin'), deleteStudent);

module.exports = router;
