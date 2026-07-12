import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Eye, UserCheck, AlertTriangle } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Students = () => {
  const [students, setStudents] = useState([
    { id: 1, studentId: 'CS-2026-089', name: 'Alexander Wright', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', gender: 'Male', department: 'Computer Science', program: 'Computer Science & Eng', semester: '6th Semester', academicYear: '2025-2026', email: 'alex.wright@student.edu', phone: '+1 (555) 019-2834', guardian: 'Mary Wright (Mother)', fingerprintId: 'FP-8802', status: 'Active' },
    { id: 2, studentId: 'SE-2026-042', name: 'Marcus Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', gender: 'Male', department: 'Software Engineering', program: 'Software Engineering', semester: '6th Semester', academicYear: '2025-2026', email: 'marcus.vance@student.edu', phone: '+1 (555) 021-3928', guardian: 'Robert Vance (Father)', fingerprintId: 'FP-8104', status: 'Active' },
    { id: 3, studentId: 'CS-2026-015', name: 'Amina Barre', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', gender: 'Female', department: 'Computer Science', program: 'Computer Science & Eng', semester: '6th Semester', academicYear: '2025-2026', email: 'amina.barre@student.edu', phone: '+1 (555) 032-9021', guardian: 'Farah Barre (Father)', fingerprintId: 'FP-8201', status: 'Active' },
    { id: 4, studentId: 'BA-2025-102', name: 'Eleanor Vance', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', gender: 'Female', department: 'Business', program: 'Business Administration', semester: '8th Semester', academicYear: '2024-2025', email: 'eleanor.v@student.edu', phone: '+1 (555) 041-8931', guardian: 'Sarah Vance (Mother)', fingerprintId: 'FP-7901', status: 'Active' },
    { id: 5, studentId: 'CS-2026-054', name: 'Tyler Durden', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', gender: 'Male', department: 'Computer Science', program: 'Data Science', semester: '4th Semester', academicYear: '2025-2026', email: 'soap@student.edu', phone: '+1 (555) 089-2231', guardian: 'Unknown', fingerprintId: 'FP-8930', status: 'Inactive' },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [deptFilter, setDeptFilter] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Reset form helper
  const openModal = (mode, student = null) => {
    setModalMode(mode);
    setSelectedStudent(student);
    setIsModalOpen(true);

    if (mode === 'add') {
      reset({
        studentId: '',
        name: '',
        gender: 'Male',
        department: 'Computer Science',
        program: 'Computer Science & Eng',
        semester: '6th Semester',
        academicYear: '2025-2026',
        email: '',
        phone: '',
        guardian: '',
        fingerprintId: '',
        status: 'Active',
      });
    } else if (student) {
      reset(student);
    }
  };

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      if (modalMode === 'add') {
        const newStudent = {
          ...data,
          id: Date.now(),
          photo: data.gender === 'Male' 
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        setStudents(prev => [newStudent, ...prev]);
        toast.success('Student enrolled successfully');
      } else {
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...data } : s));
        toast.success('Student details updated');
      }
      setIsModalOpen(false);
      setLoading(false);
    }, 800);
  };

  const handleDelete = (student) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete student record ${student.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-3xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white',
        title: 'text-lg font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-xs text-slate-500 dark:text-slate-400',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setStudents(prev => prev.filter(s => s.id !== student.id));
        toast.success('Student record deleted');
      }
    });
  };

  // Filter students based on department
  const filteredStudents = React.useMemo(() => {
    if (!deptFilter) return students;
    return students.filter(s => s.department === deptFilter);
  }, [students, deptFilter]);

  const columns = [
    {
      label: 'Photo',
      key: 'photo',
      render: (row) => (
        <img 
          src={row.photo} 
          alt={row.name} 
          className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-550/15"
        />
      )
    },
    { label: 'Student ID', key: 'studentId', sortable: true },
    { label: 'Full Name', key: 'name', sortable: true },
    { label: 'Department', key: 'department', sortable: true },
    { label: 'Program', key: 'program', sortable: true },
    { label: 'Semester', key: 'semester' },
    { label: 'Fingerprint ID', key: 'fingerprintId', sortable: true },
    { 
      label: 'Status', 
      key: 'status',
      sortable: true,
      render: (row) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
          row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  const customFilters = (
    <select
      value={deptFilter}
      onChange={(e) => setDeptFilter(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-550/30 focus:border-indigo-550 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
    >
      <option value="">All Departments</option>
      <option value="Computer Science">Computer Science</option>
      <option value="Software Engineering">Software Engineering</option>
      <option value="Business">Business</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
            Manage Students
          </h2>
          <p className="text-xs font-medium text-slate-400">
            View, enroll, modify, or remove student biometric records.
          </p>
        </div>

        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns}
        data={filteredStudents}
        loading={loading}
        searchPlaceholder="Search students by name, ID..."
        searchKeys={['name', 'studentId', 'fingerprintId', 'email']}
        filterElement={customFilters}
        exportFilename="students_list"
        printTitle="Students Database Report"
        actions={(row) => (
          <>
            <button 
              onClick={() => openModal('view', row)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="View Profile"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={() => openModal('edit', row)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
              title="Edit Record"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDelete(row)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-450 transition-colors"
              title="Delete Record"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      />

      {/* CRUD / View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Enroll New Student' : modalMode === 'edit' ? 'Edit Student Details' : 'Student Biometric Card'}
        maxWidth="max-w-xl"
      >
        {modalMode === 'view' ? (
          // View Profile View
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/80">
              <img 
                src={selectedStudent?.photo} 
                alt={selectedStudent?.name} 
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-indigo-500/10"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{selectedStudent?.name}</h3>
                <span className="text-xs font-semibold text-slate-400 mt-1 block">Student ID: {selectedStudent?.studentId}</span>
                <span className={`inline-block mt-2 rounded px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                  selectedStudent?.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                }`}>
                  {selectedStudent?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Gender</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.gender}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Email</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Phone</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Guardian Contact</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.guardian}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Department & Program</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.department} &bull; {selectedStudent?.program}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Semester / Academic Year</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent?.semester} &bull; {selectedStudent?.academicYear}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Biometric fingerprint ID</span>
                <p className="font-bold text-indigo-500">{selectedStudent?.fingerprintId}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-semibold text-slate-700 transition-colors dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
            >
              Close Card
            </button>
          </div>
        ) : (
          // Form Edit/Add View
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Student ID</label>
                <input 
                  type="text" 
                  placeholder="CS-2026-089"
                  {...register('studentId', { required: 'Student ID is required' })}
                  className="glass-input mt-1.5"
                />
                {errors.studentId && <span className="text-[10px] text-rose-500">{errors.studentId.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Alexander Wright"
                  {...register('name', { required: 'Full Name is required' })}
                  className="glass-input mt-1.5"
                />
                {errors.name && <span className="text-[10px] text-rose-500">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <select 
                  {...register('gender')}
                  className="glass-input mt-1.5"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  placeholder="alex.wright@student.edu"
                  {...register('email', { required: 'Email is required' })}
                  className="glass-input mt-1.5"
                />
                {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+1 (555) 019-2834"
                  {...register('phone')}
                  className="glass-input mt-1.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Guardian Contact</label>
                <input 
                  type="text" 
                  placeholder="Mary Wright (Mother)"
                  {...register('guardian')}
                  className="glass-input mt-1.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Department</label>
                <select 
                  {...register('department')}
                  className="glass-input mt-1.5"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Program</label>
                <input 
                  type="text" 
                  placeholder="Computer Science & Eng"
                  {...register('program')}
                  className="glass-input mt-1.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Semester</label>
                <select 
                  {...register('semester')}
                  className="glass-input mt-1.5"
                >
                  {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Academic Year</label>
                <input 
                  type="text" 
                  placeholder="2025-2026"
                  {...register('academicYear')}
                  className="glass-input mt-1.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Fingerprint ID</label>
                <input 
                  type="text" 
                  placeholder="FP-8802"
                  {...register('fingerprintId', { required: 'Fingerprint ID is required' })}
                  className="glass-input mt-1.5 text-indigo-500 font-bold"
                />
                {errors.fingerprintId && <span className="text-[10px] text-rose-500">{errors.fingerprintId.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Record Status</label>
                <select 
                  {...register('status')}
                  className="glass-input mt-1.5"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow shadow-indigo-500/10 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Students;
