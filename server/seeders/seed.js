const mongoose = require('mongoose');
const {
  User,
  StudentProfile,
  TeacherProfile,
  Department,
  Program,
  Course,
  Subject,
  Classroom,
  Semester,
  Device,
  SystemSettings,
  RFIDCard
} = require('../models');

require('dotenv').config();

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      SystemSettings.deleteMany({}),
      User.deleteMany({}),
      TeacherProfile.deleteMany({}),
      StudentProfile.deleteMany({}),
      RFIDCard.deleteMany({}),
      Department.deleteMany({}),
      Program.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Classroom.deleteMany({}),
      Semester.deleteMany({}),
      Device.deleteMany({})
    ]);
    console.log('[Seed] Collections cleared.');

    // 1. Create System Settings
    console.log('[Seed] Seeding System Settings...');
    await SystemSettings.create({
      university_name: 'Smart University',
      primary_color: '#4F46E5',
      dark_mode: true,
      timezone: 'Africa/Nairobi',
      late_threshold_minutes: 15,
      allow_manual_entry: true
    });

    // 2. Create Users
    console.log('[Seed] Seeding Users...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@university.edu',
      password: 'admin123',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      role: 'admin',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phone: '+1 (555) 015-8832'
    });

    const teacherUser = await User.create({
      username: 'teacher',
      email: 'michael.chang@university.edu',
      password: 'teacher123',
      first_name: 'Michael',
      last_name: 'Chang',
      role: 'teacher',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+1 (555) 018-9921'
    });

    const studentUser1 = await User.create({
      username: 'student',
      email: 'alex.wright@student.edu',
      password: 'student123',
      first_name: 'Alexander',
      last_name: 'Wright',
      role: 'student',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      phone: '+1 (555) 019-2834'
    });

    const studentUser2 = await User.create({
      username: 'marcus',
      email: 'marcus.vance@student.edu',
      password: 'student123',
      first_name: 'Marcus',
      last_name: 'Vance',
      role: 'student',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+1 (555) 021-3928'
    });

    const studentUser3 = await User.create({
      username: 'amina',
      email: 'amina.barre@student.edu',
      password: 'student123',
      first_name: 'Amina',
      last_name: 'Barre',
      role: 'student',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+1 (555) 032-9021'
    });

    // 3. Create Profiles
    console.log('[Seed] Seeding Profiles...');
    await TeacherProfile.create({
      userId: teacherUser._id,
      employee_id: 'T-88021',
      department: 'Software Engineering',
      status: 'Active'
    });

    const sp1 = await StudentProfile.create({
      userId: studentUser1._id,
      student_id: 'CS-2026-089',
      gender: 'Male',
      department: 'Computer Science',
      program: 'Computer Science & Eng',
      semester: '6th Semester',
      academic_year: '2025-2026',
      guardian: 'Mary Wright (Mother)',
      fingerprint_id: 'FP-8802',
      rfid: 'AB12CD34',
      status: 'Active'
    });

    const sp2 = await StudentProfile.create({
      userId: studentUser2._id,
      student_id: 'SE-2026-042',
      gender: 'Male',
      department: 'Software Engineering',
      program: 'Software Engineering',
      semester: '6th Semester',
      academic_year: '2025-2026',
      guardian: 'Robert Vance (Father)',
      fingerprint_id: 'FP-8104',
      rfid: '55FF66EE',
      status: 'Active'
    });

    const sp3 = await StudentProfile.create({
      userId: studentUser3._id,
      student_id: 'CS-2026-015',
      gender: 'Female',
      department: 'Computer Science',
      program: 'Computer Science & Eng',
      semester: '6th Semester',
      academic_year: '2025-2026',
      guardian: 'Farah Barre (Father)',
      fingerprint_id: 'FP-8201',
      rfid: '11223344',
      status: 'Active'
    });

    console.log('[Seed] Seeding RFID Cards...');
    await RFIDCard.create({
      uid: 'AB12CD34',
      studentProfileId: sp1._id,
      status: 'Active'
    });

    await RFIDCard.create({
      uid: '55FF66EE',
      studentProfileId: sp2._id,
      status: 'Active'
    });

    await RFIDCard.create({
      uid: '11223344',
      studentProfileId: sp3._id,
      status: 'Active'
    });

    // 4. Create Academics Structure
    console.log('[Seed] Seeding Academics structure...');
    const sweDept = await Department.create({
      code: 'SWE',
      name: 'Software Engineering',
      hod: 'Dr. Michael Chang',
      room: 'Room 402'
    });

    const csDept = await Department.create({
      code: 'CS',
      name: 'Computer Science',
      hod: 'Prof. Sarah Jenkins',
      room: 'Room 403'
    });

    const bsseProgram = await Program.create({
      code: 'BSSE',
      name: 'Software Engineering',
      duration: '4 Years',
      departmentId: sweDept._id
    });

    const bscsProgram = await Program.create({
      code: 'BSCS',
      name: 'Computer Science & Engineering',
      duration: '4 Years',
      departmentId: csDept._id
    });

    const sweCourse = await Course.create({
      code: 'SWE-312',
      name: 'Software Architecture',
      credits: 3,
      programId: bsseProgram._id
    });

    const csCourse = await Course.create({
      code: 'CS-402',
      name: 'Artificial Intelligence',
      credits: 3,
      programId: bscsProgram._id
    });

    await Subject.create({
      code: 'SWE-312-T',
      name: 'SWE-312-T (Design Patterns)',
      hours: 3,
      courseId: sweCourse._id
    });

    await Subject.create({
      code: 'CS-402-L',
      name: 'CS-402-L (AI Machine Learning Lab)',
      hours: 3,
      courseId: csCourse._id
    });

    const classroom1 = await Classroom.create({
      room_number: 'Lecture Hall 04',
      building: 'Science Block',
      capacity: 80,
      device_uuid: 'DEV-ESP32-A8'
    });

    const classroom2 = await Classroom.create({
      room_number: 'CS Lab 02',
      building: 'IT Center',
      capacity: 40,
      device_uuid: 'DEV-ESP32-C4'
    });

    const semester1 = await Semester.create({
      term: '6th Semester',
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-07-31'),
      status: 'Active'
    });

    const semester2 = await Semester.create({
      term: '8th Semester',
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-07-31'),
      status: 'Active'
    });

    // 5. Create Devices
    console.log('[Seed] Seeding Devices...');
    await Device.create({
      name: 'Lecture Hall ESP-01',
      device_id: 'DEV-ESP32-A8',
      ip: '192.168.1.104',
      battery: 92,
      wifi: 'Excellent',
      status: 'Connected'
    });

    await Device.create({
      name: 'CS Lab 2 Scanner',
      device_id: 'DEV-ESP32-C4',
      ip: '192.168.1.112',
      battery: 85,
      wifi: 'Good',
      status: 'Connected'
    });

    await Device.create({
      name: 'Main Seminar Reader',
      device_id: 'DEV-ESP32-S9',
      ip: '192.168.1.109',
      battery: 99,
      wifi: 'Excellent',
      status: 'Connected'
    });

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seed();
