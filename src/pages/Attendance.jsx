import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  // Student's own ID for filtering
  const myStudentId = user?.studentId || user?.student_id;
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, studentId: 'CS-2026-089', name: 'Alexander Wright', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', department: 'Computer Science', course: 'Artificial Intelligence', teacher: 'Prof. Sarah Jenkins', date: '2026-07-10', time: '09:02 AM', status: 'Present', verification: 'Fingerprint' },
    { id: 2, studentId: 'SE-2026-042', name: 'Marcus Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', department: 'Software Engineering', course: 'Software Architecture', teacher: 'Dr. Michael Chang', date: '2026-07-10', time: '09:12 AM', status: 'Late', verification: 'Fingerprint' },
    { id: 3, studentId: 'CS-2026-015', name: 'Amina Barre', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', department: 'Computer Science', course: 'Artificial Intelligence', teacher: 'Prof. Sarah Jenkins', date: '2026-07-10', time: '09:05 AM', status: 'Present', verification: 'Fingerprint' },
    { id: 4, studentId: 'BA-2025-102', name: 'Eleanor Vance', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', department: 'Business', course: 'Principles of Management', teacher: 'Prof. E Stone', date: '2026-07-10', time: '---', status: 'Absent', verification: 'System Auto' },
    { id: 5, studentId: 'CS-2026-054', name: 'Tyler Durden', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', department: 'Computer Science', course: 'Artificial Intelligence', teacher: 'Prof. Sarah Jenkins', date: '2026-07-09', time: '09:01 AM', status: 'Present', verification: 'Fingerprint' },
    { id: 6, studentId: 'SE-2026-042', name: 'Marcus Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', department: 'Software Engineering', course: 'Web Programming', teacher: 'Dr. Michael Chang', date: '2026-07-09', time: '02:02 PM', status: 'Present', verification: 'Fingerprint' },
  ]);

  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveStatusOverride = (status) => {
    setLoading(true);
    setTimeout(() => {
      setAttendanceRecords(prev => prev.map(r => 
        r.id === selectedRecord.id 
          ? { 
              ...r, 
              status, 
              time: status === 'Absent' ? '---' : (r.time === '---' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : r.time),
              verification: 'Manual Override'
            } 
          : r
      ));
      toast.success(`Attendance updated to ${status} for ${selectedRecord.name}`);
      setIsModalOpen(false);
      setLoading(false);
    }, 500);
  };

  const filteredRecords = React.useMemo(() => {
    return attendanceRecords.filter(r => {
      // Students can ONLY see their own records
      if (isStudent && r.studentId !== myStudentId) return false;
      const matchCourse = courseFilter ? r.course === courseFilter : true;
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      return matchCourse && matchStatus;
    });
  }, [attendanceRecords, courseFilter, statusFilter, isStudent, myStudentId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500"><CheckCircle className="h-3 w-3" /> Present</span>;
      case 'Late':
        return <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500"><Clock className="h-3 w-3" /> Late</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-500"><ShieldAlert className="h-3 w-3" /> Absent</span>;
    }
  };

  const columns = [
    {
      label: 'Photo',
      key: 'photo',
      render: (row) => (
        <img 
          src={row.photo} 
          alt={row.name} 
          className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-550/15"
        />
      )
    },
    { label: 'Student ID', key: 'studentId', sortable: true },
    { label: 'Student Name', key: 'name', sortable: true },
    { label: 'Department', key: 'department', sortable: true },
    { label: 'Course', key: 'course', sortable: true },
    { label: 'Teacher', key: 'teacher', sortable: true },
    { label: 'Date', key: 'date', sortable: true },
    { label: 'Time Checked', key: 'time', sortable: true },
    { 
      label: 'Status', 
      key: 'status', 
      sortable: true,
      render: (row) => getStatusBadge(row.status)
    },
    { label: 'Verification', key: 'verification', sortable: true }
  ];

  const filterControls = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={courseFilter}
        onChange={(e) => setCourseFilter(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-550/30 focus:border-indigo-550 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
      >
        <option value="">All Courses</option>
        <option value="Artificial Intelligence">Artificial Intelligence</option>
        <option value="Software Architecture">Software Architecture</option>
        <option value="Web Programming">Web Programming</option>
        <option value="Principles of Management">Principles of Management</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-550/30 focus:border-indigo-550 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
      >
        <option value="">All Statuses</option>
        <option value="Present">Present</option>
        <option value="Late">Late</option>
        <option value="Absent">Absent</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          {isStudent ? 'My Attendance Logs' : 'Attendance Audit Sheets'}
        </h2>
        <p className="text-xs font-medium text-slate-400">
          {isStudent
            ? `Showing your personal biometric check-in history. Student ID: ${myStudentId}`
            : 'Verify class logs, edit registration states, and audit fingerprint check-ins.'}
        </p>
      </div>

      {/* Reusable Data Table */}
      <Table 
        columns={columns}
        data={filteredRecords}
        loading={loading}
        searchPlaceholder="Search logs by student ID, name..."
        searchKeys={['name', 'studentId', 'course', 'teacher', 'verification']}
        filterElement={filterControls}
        exportFilename="attendance_logs"
        printTitle="Central Attendance Log Sheets"
        actions={isStudent ? null : (row) => (
          <button 
            onClick={() => handleEditRecord(row)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 border border-slate-100 dark:border-slate-850 transition-colors"
            title="Manual Override"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
      />

      {/* Manual Override Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manual Attendance Override"
        maxWidth="max-w-sm"
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
              <img src={selectedRecord.photo} alt={selectedRecord.name} className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedRecord.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{selectedRecord.studentId} &bull; {selectedRecord.course}</p>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed text-center">
              Manually alter this check-in status. Action is logged under administrative overrides.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button 
                onClick={() => handleSaveStatusOverride('Present')}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm transition-all"
              >
                Present
              </button>
              <button 
                onClick={() => handleSaveStatusOverride('Late')}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 py-3 text-xs font-bold text-white shadow-sm transition-all"
              >
                Late
              </button>
              <button 
                onClick={() => handleSaveStatusOverride('Absent')}
                className="rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-xs font-bold text-white shadow-sm transition-all"
              >
                Absent
              </button>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition-colors dark:bg-slate-800 dark:text-slate-350"
            >
              Cancel
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Attendance;
