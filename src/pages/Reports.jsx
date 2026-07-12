import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Printer, Filter, FileSpreadsheet, FileDown } from 'lucide-react';
import { exportToCSV, exportToExcel, triggerPrint } from '../utils/exportHelpers';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const myStudentId = user?.studentId || user?.student_id;
  const myName = user?.first_name ? `${user.first_name} ${user.last_name}` : user?.name;
  const [reportType, setReportType] = useState('daily');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('Spring 2026');
  const [loading, setLoading] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  // Mock report datasets
  const mockReportsData = {
    daily: [
      { Date: '2026-07-10', Department: 'Computer Science', Course: 'Artificial Intelligence', TotalStudents: 45, PresentCount: 42, LateCount: 2, AbsentCount: 1, AverageRate: '97.7%' },
      { Date: '2026-07-10', Department: 'Software Engineering', Course: 'Software Architecture', TotalStudents: 42, PresentCount: 38, LateCount: 3, AbsentCount: 1, AverageRate: '97.6%' },
      { Date: '2026-07-10', Department: 'Business', Course: 'Principles of Management', TotalStudents: 80, PresentCount: 71, LateCount: 5, AbsentCount: 4, AverageRate: '95.0%' },
    ],
    weekly: [
      { Week: 'Week 27 (July 5-11)', Course: 'Artificial Intelligence', Instructor: 'Sarah Jenkins', TotalLectures: 3, TotalScans: 135, PresentRate: '94.8%', AbsentRate: '5.2%' },
      { Week: 'Week 27 (July 5-11)', Course: 'Software Architecture', Instructor: 'Michael Chang', TotalLectures: 3, TotalScans: 126, PresentRate: '92.1%', AbsentRate: '7.9%' },
      { Week: 'Week 27 (July 5-11)', Course: 'Web Programming', Instructor: 'Michael Chang', TotalLectures: 2, TotalScans: 84, PresentRate: '97.6%', AbsentRate: '2.4%' },
    ],
    student: [
      { StudentID: 'CS-2026-089', StudentName: 'Alexander Wright', Program: 'BSc Computer Science', LecturesAttended: 38, TotalLectures: 42, AttendanceRate: '90.4%', WarningStatus: 'None' },
      { StudentID: 'SE-2026-042', StudentName: 'Marcus Vance', Program: 'BSc Software Eng', LecturesAttended: 30, TotalLectures: 42, AttendanceRate: '71.4%', WarningStatus: 'Critical (<75%)' },
      { StudentID: 'CS-2026-015', StudentName: 'Amina Barre', Program: 'BSc Computer Science', LecturesAttended: 41, TotalLectures: 42, AttendanceRate: '97.6%', WarningStatus: 'None' },
    ]
  };

  // Students only get their own row from the student audit dataset
  const getStudentOwnData = () => {
    const allStudentData = mockReportsData.student;
    const myRow = allStudentData.find(r => r.StudentID === myStudentId);
    return myRow ? [myRow] : [
      // fallback if studentId doesn't match
      { StudentID: myStudentId || '---', StudentName: myName || 'You', Program: user?.program || '---', LecturesAttended: 37, TotalLectures: 42, AttendanceRate: '88.1%', WarningStatus: 'None' }
    ];
  };

  const handleGenerateReport = () => {
    setLoading(true);
    setPreviewLoaded(false);
    
    setTimeout(() => {
      setLoading(false);
      setPreviewLoaded(true);
      toast.success('Report data compiled successfully');
    }, 1000);
  };

  const getActiveDataset = () => {
    // Students always get ONLY their own report row
    if (isStudent) return getStudentOwnData();
    if (reportType === 'daily') return mockReportsData.daily;
    if (reportType === 'weekly') return mockReportsData.weekly;
    return mockReportsData.student;
  };

  const handleDownloadCSV = () => {
    const data = getActiveDataset();
    exportToCSV(data, `${reportType}_report.csv`);
    toast.success('CSV download triggered');
  };

  const handleDownloadExcel = () => {
    const data = getActiveDataset();
    exportToExcel(data, `${reportType}_report.xls`);
    toast.success('Excel workbook downloaded');
  };

  const handlePrint = () => {
    const data = getActiveDataset();
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(h => item[h]));
    triggerPrint(`Attendance System - ${reportType.toUpperCase()} Summary`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          {isStudent ? 'My Attendance Report' : 'Analytics & Reports Console'}
        </h2>
        <p className="text-xs font-medium text-slate-400">
          {isStudent
            ? `Your personal attendance summary — Student ID: ${myStudentId}`
            : 'Generate, preview, and export periodic attendance logs.'}
        </p>
      </div>

      {/* Report Generator — hidden for students (they always see their own data) */}
      {!isStudent && (
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wide">
          <Filter className="h-4 w-4 text-indigo-500" />
          <span>Report Parameters</span>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-xs font-medium">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Report Scope / Type</label>
            <select 
              value={reportType} 
              onChange={(e) => { setReportType(e.target.value); setPreviewLoaded(false); }} 
              className="glass-input mt-1.5"
            >
              <option value="daily">Daily Attendance Summary</option>
              <option value="weekly">Weekly Course Averages</option>
              <option value="student">Student Audit Roster</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Academic Term</label>
            <select 
              value={semester} 
              onChange={(e) => { setSemester(e.target.value); setPreviewLoaded(false); }} 
              className="glass-input mt-1.5"
            >
              <option value="Spring 2026">Spring 2026</option>
              <option value="Fall 2025">Fall 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Department</label>
            <select 
              value={department} 
              onChange={(e) => { setDepartment(e.target.value); setPreviewLoaded(false); }} 
              className="glass-input mt-1.5"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow shadow-indigo-500/10 active:scale-[0.98] transition-all"
            >
              <BarChart3 className="h-4.5 w-4.5" />
              <span>Compile Report</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Preview Section */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent"></div>
            <p className="text-xs text-slate-400 font-semibold">Compiling statistical dataset...</p>
          </div>
        </div>
      )}

      {/* For students: always auto-show their own report without needing to click Compile */}
      {isStudent && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">Your Personal Attendance Report</span>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all">
                <FileDown className="h-4 w-4" /><span>CSV</span>
              </button>
              <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all">
                <FileSpreadsheet className="h-4 w-4" /><span>Excel</span>
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all">
                <Printer className="h-4 w-4" /><span>Print PDF</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/60">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40 text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                  {Object.keys(getStudentOwnData()[0]).map((h, idx) => (
                    <th key={idx} className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-650 dark:text-slate-300">
                {getStudentOwnData().map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    {Object.keys(row).map((colName, cIdx) => (
                      <td key={cIdx} className="px-5 py-3.5 whitespace-nowrap font-medium">
                        {colName === 'WarningStatus' && row[colName] !== 'None' ? (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold text-rose-550 uppercase">{row[colName]}</span>
                        ) : ( row[colName] )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isStudent && previewLoaded && !loading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">Compiled Report Preview</span>
            
            {/* Export Toolbar */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all"
              >
                <FileDown className="h-4 w-4" />
                <span>CSV</span>
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Table Preview Display */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/60">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40 text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                  {Object.keys(getActiveDataset()[0]).map((h, idx) => (
                    <th key={idx} className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-650 dark:text-slate-300">
                {getActiveDataset().map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    {Object.keys(row).map((colName, cIdx) => (
                      <td key={cIdx} className="px-5 py-3.5 whitespace-nowrap font-medium">
                        {colName === 'WarningStatus' && row[colName] !== 'None' ? (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold text-rose-550 uppercase">
                            {row[colName]}
                          </span>
                        ) : (
                          row[colName]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
