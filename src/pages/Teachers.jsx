import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Teachers = () => {
  const [teachers, setTeachers] = useState([
    { id: 1, employeeId: 'T-88021', name: 'Dr. Michael Chang', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', gender: 'Male', department: 'Software Engineering', email: 'michael.chang@university.edu', phone: '+1 (555) 018-9921', status: 'Active' },
    { id: 2, employeeId: 'T-88034', name: 'Professor Sarah Jenkins', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', gender: 'Female', department: 'Computer Science', email: 'sarah.jenkins@university.edu', phone: '+1 (555) 015-8832', status: 'Active' },
    { id: 3, employeeId: 'T-89012', name: 'Dr. Alan Turing', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', gender: 'Male', department: 'Computer Science', email: 'alan.turing@university.edu', phone: '+1 (555) 021-0089', status: 'Active' },
    { id: 4, employeeId: 'T-84091', name: 'Professor Elizabeth Stone', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', gender: 'Female', department: 'Business', email: 'elizabeth.stone@university.edu', phone: '+1 (555) 041-3329', status: 'Active' },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [deptFilter, setDeptFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openModal = (mode, teacher = null) => {
    setModalMode(mode);
    setSelectedTeacher(teacher);
    setIsModalOpen(true);

    if (mode === 'add') {
      reset({
        employeeId: '',
        name: '',
        gender: 'Male',
        department: 'Computer Science',
        email: '',
        phone: '',
        status: 'Active',
      });
    } else if (teacher) {
      reset(teacher);
    }
  };

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      if (modalMode === 'add') {
        const newTeacher = {
          ...data,
          id: Date.now(),
          photo: data.gender === 'Male' 
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        };
        setTeachers(prev => [newTeacher, ...prev]);
        toast.success('Teacher record added successfully');
      } else {
        setTeachers(prev => prev.map(t => t.id === selectedTeacher.id ? { ...t, ...data } : t));
        toast.success('Teacher details updated');
      }
      setIsModalOpen(false);
      setLoading(false);
    }, 800);
  };

  const handleDelete = (teacher) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Deleting teacher ${teacher.name} will unassign them from their active courses.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-3xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white',
        title: 'text-lg font-bold text-slate-800 dark:text-white',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
        toast.success('Teacher record deleted');
      }
    });
  };

  const filteredTeachers = React.useMemo(() => {
    if (!deptFilter) return teachers;
    return teachers.filter(t => t.department === deptFilter);
  }, [teachers, deptFilter]);

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
    { label: 'Employee ID', key: 'employeeId', sortable: true },
    { label: 'Full Name', key: 'name', sortable: true },
    { label: 'Department', key: 'department', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Phone', key: 'phone' },
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
            Manage Teachers
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Configure employee profiles and link instructors to departments.
          </p>
        </div>

        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      <Table 
        columns={columns}
        data={filteredTeachers}
        loading={loading}
        searchPlaceholder="Search instructors..."
        searchKeys={['name', 'employeeId', 'email', 'department']}
        filterElement={customFilters}
        exportFilename="teachers_list"
        printTitle="Teachers Directory Report"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Register New Instructor' : modalMode === 'edit' ? 'Modify Instructor Record' : 'Instructor Information Card'}
        maxWidth="max-w-lg"
      >
        {modalMode === 'view' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/80">
              <img 
                src={selectedTeacher?.photo} 
                alt={selectedTeacher?.name} 
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-indigo-500/10"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{selectedTeacher?.name}</h3>
                <span className="text-xs font-semibold text-slate-400 mt-1 block">Employee ID: {selectedTeacher?.employeeId}</span>
                <span className={`inline-block mt-2 rounded px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                  selectedTeacher?.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                }`}>
                  {selectedTeacher?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Gender</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedTeacher?.gender}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Department</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedTeacher?.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Email</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedTeacher?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Contact Phone</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedTeacher?.phone}</p>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Employee ID</label>
                <input 
                  type="text" 
                  placeholder="T-88021"
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  className="glass-input mt-1.5"
                />
                {errors.employeeId && <span className="text-[10px] text-rose-500">{errors.employeeId.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Dr. Michael Chang"
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

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  placeholder="michael.chang@university.edu"
                  {...register('email', { required: 'Email is required' })}
                  className="glass-input mt-1.5"
                />
                {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+1 (555) 018-9921"
                  {...register('phone')}
                  className="glass-input mt-1.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Status</label>
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
                className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow shadow-indigo-500/10 transition-colors"
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

export default Teachers;
