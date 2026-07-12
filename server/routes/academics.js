const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const ctrl = require('../controllers/academicsController');

// Departments
router.get('/departments', protect, ctrl.getDepartments);
router.post('/departments', protect, roles('admin'), ctrl.createDepartment);
router.put('/departments/:id', protect, roles('admin'), ctrl.updateDepartment);
router.delete('/departments/:id', protect, roles('admin'), ctrl.deleteDepartment);

// Programs
router.get('/programs', protect, ctrl.getPrograms);
router.post('/programs', protect, roles('admin'), ctrl.createProgram);
router.put('/programs/:id', protect, roles('admin'), ctrl.updateProgram);
router.delete('/programs/:id', protect, roles('admin'), ctrl.deleteProgram);

// Courses
router.get('/courses', protect, ctrl.getCourses);
router.post('/courses', protect, roles('admin'), ctrl.createCourse);
router.put('/courses/:id', protect, roles('admin'), ctrl.updateCourse);
router.delete('/courses/:id', protect, roles('admin'), ctrl.deleteCourse);

// Subjects
router.get('/subjects', protect, ctrl.getSubjects);
router.post('/subjects', protect, roles('admin'), ctrl.createSubject);
router.put('/subjects/:id', protect, roles('admin'), ctrl.updateSubject);
router.delete('/subjects/:id', protect, roles('admin'), ctrl.deleteSubject);

// Classrooms
router.get('/classrooms', protect, ctrl.getClassrooms);
router.post('/classrooms', protect, roles('admin'), ctrl.createClassroom);
router.put('/classrooms/:id', protect, roles('admin'), ctrl.updateClassroom);
router.delete('/classrooms/:id', protect, roles('admin'), ctrl.deleteClassroom);

// Semesters
router.get('/semesters', protect, ctrl.getSemesters);
router.post('/semesters', protect, roles('admin'), ctrl.createSemester);
router.put('/semesters/:id', protect, roles('admin'), ctrl.updateSemester);
router.delete('/semesters/:id', protect, roles('admin'), ctrl.deleteSemester);

module.exports = router;
