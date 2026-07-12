import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, Filler, ArcElement 
} from 'chart.js';
import { 
  Users, GraduationCap, Calendar, Clock, AlertTriangle, CheckCircle, 
  Cpu, Award, ArrowUpRight, Plus, Eye, BookOpen, Download, AlertCircle, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Register ChartJS elements
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, Filler, ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminDashboardView />;
  } else if (user?.role === 'teacher') {
    return <TeacherDashboardView />;
  } else {
    return <StudentDashboardView studentUser={user} />;
  }
};

/* ==========================================
   1. ADMIN DASHBOARD VIEW
   ========================================== */
const AdminDashboardView = () => {
  const navigate = useNavigate();
  
  // Static stats values
  const stats = [
    { title: 'Total Students', value: '2,840', change: '+3.2%', icon: Users, color: 'indigo' },
    { title: 'Total Teachers', value: '142', change: '+1.5%', icon: GraduationCap, color: 'blue' },
    { title: 'Attendance Today', value: '92.4%', change: '+0.8%', icon: CheckCircle, color: 'emerald' },
    { title: 'Active Classes', value: '18', change: 'Live', icon: Clock, color: 'purple' },
    { title: 'Connected Devices', value: '8 / 8', change: '100%', icon: Cpu, color: 'amber' },
  ];

  // Daily attendance details
  const attendanceBreakdown = {
    present: 2450,
    absent: 198,
    late: 192,
  };

  // Line Chart Data: Last 7 days attendance trends
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Present Rate (%)',
        data: [91.2, 92.5, 89.8, 93.4, 92.4, 94.1, 92.0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointHoverRadius: 7,
      },
      {
        label: 'Late Rate (%)',
        data: [5.2, 4.8, 6.2, 3.8, 4.5, 3.2, 4.2],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
      }
    ]
  };

  // Bar Chart Data: Department attendance performance
  const barChartData = {
    labels: ['Comp Sci', 'Business', 'Engineering', 'Medicine', 'Art & Design', 'Humanities'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [94.5, 89.2, 91.8, 95.2, 87.6, 88.9],
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8,
        hoverBackgroundColor: '#4f46e5',
      }
    ]
  };

  // Doughnut Chart Data: Today's attendance split
  const doughnutChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [attendanceBreakdown.present, attendanceBreakdown.absent, attendanceBreakdown.late],
        backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: { size: 10, weight: '500', family: 'Inter' },
          color: '#94a3b8'
        }
      },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 11, weight: '700', family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { borderDash: [5, 5], color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          font: { size: 10, weight: '600', family: 'Inter' },
          color: '#94a3b8'
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Welcome Title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
            Administrative Console
          </h2>
          <p className="text-xs font-medium text-slate-400">
            System overview and biometric metrics for Academic Year 2025-2026.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => navigate('/students')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 transition-all hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="hover-card-trigger glass-panel rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800 dark:text-white md:text-2xl font-sans">{stat.value}</span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 rounded px-1.5 py-0.5">{stat.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart - Weekly Attendance Trends */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel rounded-3xl p-5 lg:col-span-2 flex flex-col"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Attendance Trajectory</span>
              <p className="text-[10px] text-slate-400">Fluctuations in weekly attendance registrations.</p>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="h-64 flex-1">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Doughnut Chart - Today's Attendance breakdown */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel rounded-3xl p-5 flex flex-col"
        >
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-800 dark:text-white">Today's Check-in Mix</span>
            <p className="text-[10px] text-slate-400">Visual allocation of daily verification status.</p>
          </div>
          <div className="relative h-44 flex-1">
            <Doughnut data={doughnutChartData} options={donutOptions} />
            <div className="absolute inset-x-0 top-[38%] flex flex-col items-center">
              <span className="text-lg font-bold text-slate-800 dark:text-white">2,840</span>
              <span className="text-[8px] font-medium text-slate-400">TOTAL SCANS</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-sm font-bold">{attendanceBreakdown.present}</span>
              <span className="uppercase text-[8px] tracking-wider mt-0.5">Present</span>
            </div>
            <div className="flex flex-col">
              <span className="text-rose-500 text-sm font-bold">{attendanceBreakdown.absent}</span>
              <span className="uppercase text-[8px] tracking-wider mt-0.5">Absent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-500 text-sm font-bold">{attendanceBreakdown.late}</span>
              <span className="uppercase text-[8px] tracking-wider mt-0.5">Late</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Department Stats & Connected Devices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart - Department Performance */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel rounded-3xl p-5 flex flex-col"
        >
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-800 dark:text-white">Attendance by Department</span>
            <p className="text-[10px] text-slate-400">Department performance scores comparison.</p>
          </div>
          <div className="h-64 flex-1">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Connected Scanner Devices Dashboard */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel rounded-3xl p-5 flex flex-col"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">Biometric Scanner Hub</span>
              <p className="text-[10px] text-slate-400">Live operational diagnostic of Wi-Fi terminals.</p>
            </div>
            <button 
              onClick={() => navigate('/devices')}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
            >
              Manage Devices
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[256px] pr-1">
            {[
              { name: 'Lecture Hall ESP-01', battery: '92%', status: 'Online', ip: '192.168.1.104', signal: 'Excellent' },
              { name: 'CS Lab 2 Scanner', battery: '85%', status: 'Online', ip: '192.168.1.112', signal: 'Good' },
              { name: 'Engineering Wing B', battery: '14%', status: 'Battery Low', ip: '192.168.1.115', signal: 'Fair' },
              { name: 'Main Seminar Reader', battery: '99%', status: 'Online', ip: '192.168.1.109', signal: 'Excellent' },
            ].map((dev, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/40 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{dev.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400">{dev.ip} &bull; Signal: {dev.signal}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dev.status === 'Online' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600 animate-pulse'}`}>{dev.status}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-1">Bat: {dev.battery}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ==========================================
   2. TEACHER DASHBOARD VIEW
   ========================================== */
const TeacherDashboardView = () => {
  const navigate = useNavigate();

  const todayClasses = [
    { id: 1, code: 'SWE-312', name: 'Software Architecture', time: '09:00 AM - 10:30 AM', classroom: 'Lecture Hall 04', dept: 'Software Engineering', sem: '6th Sem', section: 'A' },
    { id: 2, code: 'CS-402', name: 'Artificial Intelligence', time: '11:00 AM - 12:30 PM', classroom: 'CS Lab 02', dept: 'Computer Science', sem: '8th Sem', section: 'B' },
    { id: 3, code: 'SWE-320', name: 'Web Programming', time: '02:00 PM - 03:30 PM', classroom: 'Lecture Hall 04', dept: 'Software Engineering', sem: '6th Sem', section: 'A' },
  ];

  const handleStartAttendance = (cls) => {
    // Navigate to Attendance Session screen and carry current class data
    navigate('/attendance-session', { state: { activeClass: cls } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl">
          Teacher Portal
        </h2>
        <p className="text-xs font-medium text-slate-400">
          Welcome back. Select an active lecture below to initiate fingerprint scans.
        </p>
      </div>

      {/* Summary metric banner */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Lectures</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{todayClasses.length} lectures today</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Term Attendance Avg</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">91.6% average</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Performers</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">24 students at 100%</span>
          </div>
        </div>
      </div>

      {/* Class Schedule Grid */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-slate-800 dark:text-white">Today's Class Roster</span>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {todayClasses.map((cls) => (
            <div 
              key={cls.id}
              className="hover-card-trigger glass-panel rounded-2xl p-5 border border-slate-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                    {cls.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{cls.classroom}</span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white font-sans truncate">{cls.name}</h3>
                
                <div className="mt-4 space-y-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cls.dept} &bull; {cls.sem} &bull; Sec {cls.section}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleStartAttendance(cls)}
                className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-semibold text-white shadow shadow-indigo-500/10 active:scale-[0.98] transition-all"
              >
                <Cpu className="h-4 w-4" />
                <span>START ATTENDANCE</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   3. STUDENT DASHBOARD VIEW
   ========================================== */
const StudentDashboardView = ({ studentUser }) => {
  const navigate = useNavigate();
  
  // Custom mock data for the student
  const overallPercentage = studentUser?.attendancePercentage || 88.5;
  const recentAttendances = [
    { date: '2026-07-10', course: 'SWE-312', name: 'Software Architecture', teacher: 'Dr. Michael Chang', time: '09:12 AM', status: 'Late', verification: 'Fingerprint' },
    { date: '2026-07-09', course: 'SWE-320', name: 'Web Programming', teacher: 'Dr. Michael Chang', time: '02:02 PM', status: 'Present', verification: 'Fingerprint' },
    { date: '2026-07-08', course: 'CS-402', name: 'Artificial Intelligence', teacher: 'Prof. S Jenkins', time: '11:05 AM', status: 'Present', verification: 'Fingerprint' },
    { date: '2026-07-07', course: 'SWE-312', name: 'Software Architecture', teacher: 'Dr. Michael Chang', time: '---', status: 'Absent', verification: 'System Auto' },
  ];

  const subjectRates = [
    { code: 'SWE-312', name: 'Software Architecture', present: 14, total: 16, percentage: 87.5 },
    { code: 'SWE-320', name: 'Web Programming', present: 12, total: 12, percentage: 100 },
    { code: 'CS-402', name: 'Artificial Intelligence', present: 11, total: 13, percentage: 84.6 },
  ];

  const handleDownloadPDF = () => {
    toast.success('Downloading your Attendance PDF Report...', { id: 'pdf-download' });
    
    // Simulate generation and download
    const headers = ['Date', 'Course', 'Time Checked', 'Status', 'Method'];
    const rows = recentAttendances.map(r => [r.date, r.name, r.time, r.status, r.verification]);
    triggerPrint(`${studentUser.name} - Attendance Report`, headers, rows);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500/10 text-emerald-500';
      case 'Late': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-rose-500/10 text-rose-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl">
            Student Attendance Portal
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Biometric statistics for student ID: <span className="text-indigo-500 font-semibold">{studentUser?.studentId}</span>
          </p>
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300 transition-all self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Attendance Ring gauge (Doughnut style) */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Overall attendance rate</span>
          
          <div className="relative h-36 w-36 mb-4">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-400"
                strokeDasharray={`${overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-800 dark:text-white font-sans">{overallPercentage}%</span>
              <span className="text-[8px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">COMPLETED</span>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-500 leading-normal max-w-[200px]">
            You have checked into <b>37 out of 42</b> total lectures. Minimum requirement is 75%.
          </p>
        </div>

        {/* Attendance by subject summary */}
        <div className="glass-panel rounded-3xl p-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">Subject Breakdown</span>
            <p className="text-[10px] text-slate-400">Attendance percentages allocated per course.</p>
          </div>

          <div className="mt-4 space-y-4">
            {subjectRates.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{sub.name} <span className="font-medium text-slate-400">({sub.code})</span></span>
                  <span className="font-bold text-slate-500">{sub.present} / {sub.total} &bull; <b className="text-slate-700 dark:text-white">{sub.percentage}%</b></span>
                </div>
                {/* Custom modern progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${sub.percentage}%` }}
                    className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance History log */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-slate-800 dark:text-white">Recent Attendance Logs</span>
        <div className="overflow-x-auto rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/60">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40 text-left text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Course</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Instructor</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Check-in Time</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Method</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-600 dark:text-slate-350">
              {recentAttendances.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-3.5 whitespace-nowrap font-semibold">{rec.date}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{rec.name}</span>
                      <span className="text-[10px] text-slate-400">{rec.course}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium">{rec.teacher}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-semibold">{rec.time}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-400">{rec.verification}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
