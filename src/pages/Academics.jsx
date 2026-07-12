import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building, BookOpen, Layers, Milestone, School, CalendarRange } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Academics = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);

  // --- LOCAL STATES FOR ACADEMIC ENTITIES ---
  const [departments, setDepartments] = useState([
    { id: 1, code: 'CS', name: 'Computer Science', hod: 'Professor Sarah Jenkins', room: 'Building A, R-202' },
    { id: 2, code: 'SE', name: 'Software Engineering', hod: 'Dr. Michael Chang', room: 'Building A, R-205' },
    { id: 3, code: 'BA', name: 'Business Administration', hod: 'Professor Elizabeth Stone', room: 'Building B, R-101' },
  ]);

  const [programs, setPrograms] = useState([
    { id: 1, code: 'BSc-CS', name: 'Bachelor of Science in Computer Science', department: 'Computer Science', duration: '4 Years' },
    { id: 2, code: 'BSc-SE', name: 'Bachelor of Science in Software Engineering', department: 'Software Engineering', duration: '4 Years' },
    { id: 3, code: 'BBA', name: 'Bachelor of Business Administration', department: 'Business Administration', duration: '3 Years' },
  ]);

  const [courses, setCourses] = useState([
    { id: 1, code: 'CS-402', name: 'Artificial Intelligence', program: 'Bachelor of Science in Computer Science', credits: 4 },
    { id: 2, code: 'SWE-312', name: 'Software Architecture', program: 'Bachelor of Science in Software Engineering', credits: 3 },
    { id: 3, code: 'SWE-320', name: 'Web Programming', program: 'Bachelor of Science in Software Engineering', credits: 3 },
    { id: 4, code: 'MGT-101', name: 'Principles of Management', program: 'Bachelor of Business Administration', credits: 3 },
  ]);

  const [subjects, setSubjects] = useState([
    { id: 1, code: 'CS-402-L', name: 'AI Machine Learning Lab', course: 'Artificial Intelligence', hours: 2 },
    { id: 2, code: 'SWE-312-T', name: 'Software Design Patterns', course: 'Software Architecture', hours: 3 },
    { id: 3, code: 'SWE-320-L', name: 'React Development Lab', course: 'Web Programming', hours: 2 },
  ]);

  const [classrooms, setClassrooms] = useState([
    { id: 1, roomNumber: 'Lecture Hall 04', building: 'Engineering Wing', capacity: 120, device: 'Lecture Hall ESP-01' },
    { id: 2, roomNumber: 'CS Lab 02', building: 'Building A', capacity: 40, device: 'CS Lab 2 Scanner' },
    { id: 3, roomNumber: 'Seminar Hall B', building: 'Building B', capacity: 80, device: 'Main Seminar Reader' },
  ]);

  const [semesters, setSemesters] = useState([
    { id: 1, term: 'Fall 2026', start: '2026-09-01', end: '2026-12-20', status: 'Upcoming' },
    { id: 2, term: 'Spring 2026', start: '2026-02-01', end: '2026-06-15', status: 'Active' },
    { id: 3, term: 'Fall 2025', start: '2025-09-01', end: '2025-12-18', status: 'Completed' },
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // --- CRUD ACTIONS ROUTER ---
  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setIsModalOpen(true);

    if (mode === 'add') {
      reset({}); // Empty form
    } else if (item) {
      reset(item); // Populate edit values
    }
  };

  const onSubmit = (data) => {
    setTimeout(() => {
      const isAdd = modalMode === 'add';
      const recordId = isAdd ? Date.now() : selectedItem.id;

      if (activeTab === 'departments') {
        if (isAdd) setDepartments(prev => [...prev, { ...data, id: recordId }]);
        else setDepartments(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      } else if (activeTab === 'programs') {
        if (isAdd) setPrograms(prev => [...prev, { ...data, id: recordId }]);
        else setPrograms(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      } else if (activeTab === 'courses') {
        if (isAdd) setCourses(prev => [...prev, { ...data, id: recordId }]);
        else setCourses(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      } else if (activeTab === 'subjects') {
        if (isAdd) setSubjects(prev => [...prev, { ...data, id: recordId }]);
        else setSubjects(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      } else if (activeTab === 'classrooms') {
        if (isAdd) setClassrooms(prev => [...prev, { ...data, id: recordId }]);
        else setClassrooms(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      } else if (activeTab === 'semesters') {
        if (isAdd) setSemesters(prev => [...prev, { ...data, id: recordId }]);
        else setSemesters(prev => prev.map(item => item.id === recordId ? { ...item, ...data } : item));
      }

      toast.success(`${activeTab.slice(0, -1)} registry saved successfully`);
      setIsModalOpen(false);
    }, 500);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Deleting this ${activeTab.slice(0, -1)} record will affect linked entities.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (activeTab === 'departments') setDepartments(prev => prev.filter(i => i.id !== item.id));
        else if (activeTab === 'programs') setPrograms(prev => prev.filter(i => i.id !== item.id));
        else if (activeTab === 'courses') setCourses(prev => prev.filter(i => i.id !== item.id));
        else if (activeTab === 'subjects') setSubjects(prev => prev.filter(i => i.id !== item.id));
        else if (activeTab === 'classrooms') setClassrooms(prev => prev.filter(i => i.id !== item.id));
        else if (activeTab === 'semesters') setSemesters(prev => prev.filter(i => i.id !== item.id));
        
        toast.success(`${activeTab.slice(0, -1)} record deleted`);
      }
    });
  };

  // --- ACTIONS RENDERER ---
  const tableActions = (row) => (
    <>
      <button 
        onClick={() => handleOpenModal('edit', row)}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-indigo-650 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button 
        onClick={() => handleDelete(row)}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </>
  );

  // --- DYNAMIC TABS CONFIGURATION ---
  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building, list: departments, searchKeys: ['code', 'name', 'hod'], columns: [
      { label: 'Code', key: 'code', sortable: true },
      { label: 'Name', key: 'name', sortable: true },
      { label: 'H.O.D (Head of Dept)', key: 'hod', sortable: true },
      { label: 'Office/Room', key: 'room' }
    ]},
    { id: 'programs', label: 'Programs', icon: Layers, list: programs, searchKeys: ['code', 'name', 'department'], columns: [
      { label: 'Program Code', key: 'code', sortable: true },
      { label: 'Program Name', key: 'name', sortable: true },
      { label: 'Department', key: 'department', sortable: true },
      { label: 'Duration', key: 'duration' }
    ]},
    { id: 'courses', label: 'Courses', icon: BookOpen, list: courses, searchKeys: ['code', 'name', 'program'], columns: [
      { label: 'Course Code', key: 'code', sortable: true },
      { label: 'Course Title', key: 'name', sortable: true },
      { label: 'Program', key: 'program', sortable: true },
      { label: 'Credits', key: 'credits', sortable: true }
    ]},
    { id: 'subjects', label: 'Subjects', icon: Milestone, list: subjects, searchKeys: ['code', 'name', 'course'], columns: [
      { label: 'Subject Code', key: 'code', sortable: true },
      { label: 'Subject Name', key: 'name', sortable: true },
      { label: 'Associated Course', key: 'course', sortable: true },
      { label: 'Weekly Hours', key: 'hours', sortable: true }
    ]},
    { id: 'classrooms', label: 'Classrooms', icon: School, list: classrooms, searchKeys: ['roomNumber', 'building', 'device'], columns: [
      { label: 'Room Number', key: 'roomNumber', sortable: true },
      { label: 'Building Wing', key: 'building', sortable: true },
      { label: 'Seating Capacity', key: 'capacity', sortable: true },
      { label: 'Scanner Sync', key: 'device' }
    ]},
    { id: 'semesters', label: 'Academic Semesters', icon: CalendarRange, list: semesters, searchKeys: ['term', 'status'], columns: [
      { label: 'Semester Term', key: 'term', sortable: true },
      { label: 'Start Date', key: 'start', sortable: true },
      { label: 'End Date', key: 'end', sortable: true },
      { 
        label: 'Status', 
        key: 'status', 
        sortable: true,
        render: (row) => (
          <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : row.status === 'Completed' ? 'bg-slate-500/10 text-slate-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            {row.status}
          </span>
        )
      }
    ]}
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
            Academic Configurations
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Configure administrative nodes, programs, subjects, classrooms, and term slots.
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal('add')}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New {currentTabConfig.label.slice(0, -1)}</span>
        </button>
      </div>

      {/* Dynamic Tab Navigation buttons (Glassmorphic scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200/50 dark:border-slate-800/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/10'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Table display */}
      <div className="mt-4">
        <Table 
          columns={currentTabConfig.columns}
          data={currentTabConfig.list}
          searchKeys={currentTabConfig.searchKeys}
          searchPlaceholder={`Search ${currentTabConfig.label.toLowerCase()}...`}
          exportFilename={`academics_${currentTabConfig.id}`}
          printTitle={`${currentTabConfig.label} Directory Report`}
          actions={tableActions}
        />
      </div>

      {/* Dynamic Modal Form (Adapts based on active tab) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? `Add ${currentTabConfig.label.slice(0, -1)}` : `Edit ${currentTabConfig.label.slice(0, -1)}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {activeTab === 'departments' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Department Code</label>
                <input type="text" placeholder="CS" {...register('code', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Department Name</label>
                <input type="text" placeholder="Computer Science" {...register('name', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Head of Department (H.O.D)</label>
                <input type="text" placeholder="Professor Sarah Jenkins" {...register('hod')} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Office Location</label>
                <input type="text" placeholder="Building A, Room 202" {...register('room')} className="glass-input mt-1.5" />
              </div>
            </>
          )}

          {activeTab === 'programs' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Program Code</label>
                <input type="text" placeholder="BSc-CS" {...register('code', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Program Name</label>
                <input type="text" placeholder="Bachelor of Science in Computer Science" {...register('name', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Associated Department</label>
                <select {...register('department')} className="glass-input mt-1.5">
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                <input type="text" placeholder="4 Years" {...register('duration')} className="glass-input mt-1.5" />
              </div>
            </>
          )}

          {activeTab === 'courses' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Course Code</label>
                <input type="text" placeholder="CS-402" {...register('code', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Course Title</label>
                <input type="text" placeholder="Artificial Intelligence" {...register('name', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Linked Program</label>
                <select {...register('program')} className="glass-input mt-1.5">
                  {programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Credit Hours</label>
                <input type="number" placeholder="4" {...register('credits')} className="glass-input mt-1.5" />
              </div>
            </>
          )}

          {activeTab === 'subjects' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Subject Code</label>
                <input type="text" placeholder="CS-402-L" {...register('code', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Subject Title</label>
                <input type="text" placeholder="AI Machine Learning Lab" {...register('name', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Linked Course</label>
                <select {...register('course')} className="glass-input mt-1.5">
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Weekly Hours</label>
                <input type="number" placeholder="2" {...register('hours')} className="glass-input mt-1.5" />
              </div>
            </>
          )}

          {activeTab === 'classrooms' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Room Number</label>
                <input type="text" placeholder="Lecture Hall 04" {...register('roomNumber', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Building Wing</label>
                <input type="text" placeholder="Engineering Wing" {...register('building', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Seating Capacity</label>
                <input type="number" placeholder="120" {...register('capacity')} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Linked Sync Device</label>
                <input type="text" placeholder="Lecture Hall ESP-01" {...register('device')} className="glass-input mt-1.5" />
              </div>
            </>
          )}

          {activeTab === 'semesters' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Semester Term</label>
                <input type="text" placeholder="Fall 2026" {...register('term', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                <input type="date" {...register('start', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                <input type="date" {...register('end', { required: true })} className="glass-input mt-1.5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Term Status</label>
                <select {...register('status')} className="glass-input mt-1.5">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </>
          )}

          {/* Modal Actions */}
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
              className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow shadow-indigo-500/10 transition-colors"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Academics;
