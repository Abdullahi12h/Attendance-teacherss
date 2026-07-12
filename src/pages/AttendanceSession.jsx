import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { 
  Play, Pause, RotateCcw, Check, Users, Clock, AlertCircle, Wifi, 
  Cpu, Power, QrCode, RefreshCw, ShieldCheck
} from 'lucide-react';
import apiClient from '../api/client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const AttendanceSession = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pick up class data if navigated from Teacher Dashboard schedule
  const activeClassData = location.state?.activeClass;

  // --- INITIAL STATES ---
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  
  // Form Selection Configuration - Dynamically Loaded metadata lists
  const [departmentsList, setDepartmentsList] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [classroomsList, setClassroomsList] = useState([]);
  const [semestersList, setSemestersList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);

  // Selected values (store IDs/keys)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [section, setSection] = useState(activeClassData?.section || 'A');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Fallbacks for display names before dynamic lists load or in edge cases
  const course = activeClassData?.name || 'Software Architecture';
  const classroom = activeClassData?.classroom || 'Lecture Hall 04';
  const selectedDevice = 'Lecture Hall ESP-01';

  // Session Statistics
  const [sessionStats, setSessionStats] = useState({ present: 0, late: 0, absent: 40 });
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  
  // Simulator offset configuration
  const [simLateArrival, setSimLateArrival] = useState(false);
  const [scannedLogs, setScannedLogs] = useState([]); // Raw log tracker

  // QR Code rotating state
  const [qrToken, setQrToken] = useState('');
  const [qrCountdown, setQrCountdown] = useState(30);
  const [qrLoading, setQrLoading] = useState(false);
  const qrIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const [teacherCoords, setTeacherCoords] = useState(null);

  // Socket.IO real-time connection
  const socketRef = useRef(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionUuid, setActiveSessionUuid] = useState('');
  const [liveConnectionStatus, setLiveConnectionStatus] = useState('disconnected'); // disconnected | connected | error

  // Fetch a fresh QR token from the backend
  const fetchQRToken = useCallback(async () => {
    if (!sessionActive) return;
    setQrLoading(true);
    try {
      const params = {};
      if (teacherCoords) {
        params.lat = teacherCoords.lat;
        params.lng = teacherCoords.lng;
      }
      const res = await apiClient.get('/qr/token', { params });
      setQrToken(res.data.token);
      setQrCountdown(res.data.expiresIn || 30);

      // Join the socket room for this session (once we have sessionId)
      if (res.data.sessionId && socketRef.current) {
        setActiveSessionId(res.data.sessionId);
        socketRef.current.emit('join_session', { sessionId: res.data.sessionId });
      }
    } catch (err) {
      // If no active session on server yet, use a placeholder
      setQrToken('NO_ACTIVE_SESSION');
    } finally {
      setQrLoading(false);
    }
  }, [sessionActive, teacherCoords]);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, programsRes, coursesRes, subjectsRes, classroomsRes, semestersRes, devicesRes] = await Promise.all([
          apiClient.get('/academics/departments'),
          apiClient.get('/academics/programs'),
          apiClient.get('/academics/courses'),
          apiClient.get('/academics/subjects'),
          apiClient.get('/academics/classrooms'),
          apiClient.get('/academics/semesters'),
          apiClient.get('/devices')
        ]);

        const depts = deptsRes.data;
        const progs = programsRes.data;
        const crs = coursesRes.data;
        const subs = subjectsRes.data;
        const rooms = classroomsRes.data;
        const sems = semestersRes.data;
        const devs = devicesRes.data;

        setDepartmentsList(depts);
        setProgramsList(progs);
        setCoursesList(crs);
        setSubjectsList(subs);
        setClassroomsList(rooms);
        setSemestersList(sems);
        setDevicesList(devs);

        // Auto-select defaults
        let deptId = '';
        let progId = '';
        let courseId = '';
        let subId = '';
        let roomId = '';
        let semId = '';
        let devId = '';

        if (activeClassData) {
          // Match Department
          const d = depts.find(x => x.name === activeClassData.dept);
          if (d) deptId = d.id;
          else if (depts.length > 0) deptId = depts[0].id;

          // Match Program (Software Engineering etc)
          const p = progs.find(x => x.name === activeClassData.program || (deptId && x.departmentId === deptId));
          if (p) progId = p.id;
          else {
            const related = progs.filter(x => x.departmentId === deptId);
            progId = related.length > 0 ? related[0].id : (progs.length > 0 ? progs[0].id : '');
          }

          // Match Course
          const c = crs.find(x => x.name === activeClassData.name || x.code === activeClassData.code);
          if (c) courseId = c.id;
          else {
            const related = crs.filter(x => x.programId === progId);
            courseId = related.length > 0 ? related[0].id : (crs.length > 0 ? crs[0].id : '');
          }

          // Match Subject
          const s = subs.find(x => x.courseId === courseId || x.code.startsWith(activeClassData.code));
          if (s) subId = s.id;
          else {
            const related = subs.filter(x => x.courseId === courseId);
            subId = related.length > 0 ? related[0].id : (subs.length > 0 ? subs[0].id : '');
          }

          // Match Classroom
          const r = rooms.find(x => x.room_number === activeClassData.classroom);
          if (r) roomId = r.id;
          else if (rooms.length > 0) roomId = rooms[0].id;

          // Match Semester
          const semTerm = activeClassData.sem?.replace('Sem', 'Semester');
          const sem = sems.find(x => x.term === semTerm || x.term.startsWith(activeClassData.sem));
          if (sem) semId = sem.id;
          else if (sems.length > 0) semId = sems[0].id;
        } else {
          // Set first items as defaults
          if (depts.length > 0) deptId = depts[0].id;
          
          const relatedProgs = progs.filter(x => x.departmentId === deptId);
          if (relatedProgs.length > 0) progId = relatedProgs[0].id;
          else if (progs.length > 0) progId = progs[0].id;

          const relatedCourses = crs.filter(x => x.programId === progId);
          if (relatedCourses.length > 0) courseId = relatedCourses[0].id;
          else if (crs.length > 0) courseId = crs[0].id;

          const relatedSubjects = subs.filter(x => x.courseId === courseId);
          if (relatedSubjects.length > 0) subId = relatedSubjects[0].id;
          else if (subs.length > 0) subId = subs[0].id;

          if (rooms.length > 0) roomId = rooms[0].id;
          if (sems.length > 0) semId = sems[0].id;
        }

        // Match Device (e.g. Main Seminar Reader or matching the classroom device UUID)
        const matchingRoom = rooms.find(x => x.id === roomId);
        const dev = devs.find(x => x.device_id === matchingRoom?.device_uuid) || devs[0];
        if (dev) devId = dev.id;

        setSelectedDepartmentId(deptId);
        setSelectedProgramId(progId);
        setSelectedCourseId(courseId);
        setSelectedSubjectId(subId);
        setSelectedClassroomId(roomId);
        setSelectedSemesterId(semId);
        setSelectedDeviceId(devId);

      } catch (err) {
        console.error('Error fetching academic setup metadata:', err);
        toast.error('Failed to load session configuration options.');
      }
    };

    fetchData();
  }, [activeClassData]);

  // Check active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await apiClient.get('/attendance/sessions?status=Active');
        if (res.data.sessions && res.data.sessions.length > 0) {
          const activeSession = res.data.sessions[0];
          setActiveSessionId(activeSession.id);
          setActiveSessionUuid(activeSession.session_id);
          setSessionActive(true);
          setSessionPaused(activeSession.status === 'Paused');
          
          // Pre-populate selections with the active session fields
          setSelectedDepartmentId(activeSession.course?.program?.departmentId || '');
          setSelectedProgramId(activeSession.course?.programId || '');
          setSelectedCourseId(activeSession.courseId || '');
          setSelectedSubjectId(activeSession.subjectId || '');
          setSelectedClassroomId(activeSession.classroomId || '');
          setSelectedSemesterId(activeSession.semesterId || '');
          setSelectedDeviceId(activeSession.deviceId || '');
          setSection(activeSession.section || 'A');

          // Re-fetch records for this session
          const recordsRes = await apiClient.get(`/attendance/sessions/${activeSession.id}/records`);
          const loadedStudents = recordsRes.data.map(rec => {
            const firstName = rec.student?.user?.first_name || '';
            const lastName = rec.student?.user?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || rec.student?.student_id;
            const photo = rec.student?.user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            return {
              id: `rec-${rec.id}`,
              studentId: rec.student?.student_id,
              name: fullName,
              photo,
              department: rec.student?.department || '',
              time: new Date(rec.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: rec.status,
              verification: rec.verification_method,
            };
          });
          setCheckedInStudents(loadedStudents);
          
          // Calculate stats
          const presentCount = loadedStudents.filter(s => s.status === 'Present').length;
          const lateCount = loadedStudents.filter(s => s.status === 'Late').length;
          setSessionStats({
            present: presentCount,
            late: lateCount,
            absent: Math.max(40 - presentCount - lateCount, 0)
          });
        }
      } catch (err) {
        console.error('Error checking active session:', err);
      }
    };
    checkActiveSession();
  }, []);

  const handleDepartmentChange = (e) => {
    const deptId = parseInt(e.target.value);
    setSelectedDepartmentId(deptId);
    // Find first program in that department
    const relatedProgs = programsList.filter(p => p.departmentId === deptId);
    if (relatedProgs.length > 0) {
      const nextProgId = relatedProgs[0].id;
      setSelectedProgramId(nextProgId);
      updateProgramCascade(nextProgId);
    }
  };

  const updateProgramCascade = (progId) => {
    const relatedCourses = coursesList.filter(c => c.programId === progId);
    if (relatedCourses.length > 0) {
      const nextCourseId = relatedCourses[0].id;
      setSelectedCourseId(nextCourseId);
      updateCourseCascade(nextCourseId);
    }
  };

  const handleProgramChange = (e) => {
    const progId = parseInt(e.target.value);
    setSelectedProgramId(progId);
    updateProgramCascade(progId);
  };

  const updateCourseCascade = (courseId) => {
    const relatedSubjects = subjectsList.filter(s => s.courseId === courseId);
    if (relatedSubjects.length > 0) {
      setSelectedSubjectId(relatedSubjects[0].id);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    setSelectedCourseId(courseId);
    updateCourseCascade(courseId);
  };

  const handleClassroomChange = (e) => {
    const roomId = parseInt(e.target.value);
    setSelectedClassroomId(roomId);
    
    // Auto-select device associated with the classroom
    const room = classroomsList.find(r => r.id === roomId);
    if (room && room.device_uuid) {
      const dev = devicesList.find(d => d.device_id === room.device_uuid);
      if (dev) {
        setSelectedDeviceId(dev.id);
      }
    }
  };

  // Auto-rotate QR every 30 seconds when session is active
  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      fetchQRToken();

      // Countdown timer
      countdownRef.current = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) return 30;
          return prev - 1;
        });
      }, 1000);

      // Refresh token every 30 seconds
      qrIntervalRef.current = setInterval(() => {
        fetchQRToken();
      }, 30000);
    } else {
      clearInterval(qrIntervalRef.current);
      clearInterval(countdownRef.current);
      if (!sessionActive) setQrToken('');
    }

    return () => {
      clearInterval(qrIntervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [sessionActive, sessionPaused, fetchQRToken]);

  // Mock student pool for simulation
  const studentPool = [
    { id: 1, studentId: 'CS-2026-089', name: 'Alexander Wright', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', department: 'Computer Science', fingerprintId: 'FP-8802' },
    { id: 2, studentId: 'SE-2026-042', name: 'Marcus Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', department: 'Software Engineering', fingerprintId: 'FP-8104' },
    { id: 3, studentId: 'CS-2026-015', name: 'Amina Barre', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', department: 'Computer Science', fingerprintId: 'FP-8201' },
    { id: 4, studentId: 'BA-2025-102', name: 'Eleanor Vance', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', department: 'Business', fingerprintId: 'FP-7901' },
    { id: 5, studentId: 'CS-2026-054', name: 'Tyler Durden', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', department: 'Computer Science', fingerprintId: 'FP-8930' }
  ];

  // --- SOCKET.IO REAL-TIME CONNECTION ---
  useEffect(() => {
    if (sessionActive) {
      // Create socket connection
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setLiveConnectionStatus('connected');
        console.log('[Socket] Connected:', socket.id);
        // Re-join session room if we already have sessionId
        if (activeSessionId) {
          socket.emit('join_session', { sessionId: activeSessionId });
        }
      });

      socket.on('disconnect', () => {
        setLiveConnectionStatus('disconnected');
        console.log('[Socket] Disconnected');
      });

      socket.on('connect_error', () => {
        setLiveConnectionStatus('error');
      });

      // 🔴 REAL-TIME: Listen for student QR scan events
      socket.on('scan', (data) => {
        const { student, status, time, method } = data;
        if (!student) return;

        const firstName = student.user?.first_name || '';
        const lastName = student.user?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || student.student_id;
        const photo = student.user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
        const scanTime = time
          ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newStudent = {
          id: `qr-${student.id || Date.now()}`,
          studentId: student.student_id || student.studentId || '—',
          name: fullName,
          photo,
          department: student.department || '',
          time: scanTime,
          status: status || 'Present',
          verification: method || 'QR',
        };

        // Avoid duplicates on teacher screen
        setCheckedInStudents(prev => {
          const alreadyIn = prev.some(s => s.studentId === newStudent.studentId);
          if (alreadyIn) return prev;
          return [newStudent, ...prev];
        });

        setSessionStats(prev => {
          const isLate = status === 'Late';
          return {
            present: isLate ? prev.present : prev.present + 1,
            late: isLate ? prev.late + 1 : prev.late,
            absent: Math.max(prev.absent - 1, 0)
          };
        });

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold text-xs">{status} ✓ QR Scan</span>
            <span className="text-[10px] text-slate-500">{fullName} via QR code</span>
          </div>,
          { id: `qr-ok-${newStudent.studentId}`, duration: 4000 }
        );
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setLiveConnectionStatus('disconnected');
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive]);

  // --- CONTROLS ACTION HANDLERS ---
  const handleStartSession = async () => {
    if (!selectedSubjectId || !selectedCourseId || !selectedClassroomId || !selectedSemesterId || !selectedDeviceId) {
      toast.error('Please configure all session fields.');
      return;
    }

    try {
      const payload = {
        subjectId: selectedSubjectId,
        courseId: selectedCourseId,
        classroomId: selectedClassroomId,
        semesterId: selectedSemesterId,
        deviceId: selectedDeviceId,
        section,
        late_threshold_minutes: 15
      };

      const res = await apiClient.post('/attendance/sessions', payload);
      
      setActiveSessionId(res.data.id);
      setActiveSessionUuid(res.data.session_id);
      setSessionActive(true);
      setSessionPaused(false);
      setCheckedInStudents([]);
      setSessionStats({ present: 0, late: 0, absent: 40 });
      setQrToken('');
      setTeacherCoords(null);
      
      const courseName = coursesList.find(c => c.id === selectedCourseId)?.name || course;
      toast.success(`Attendance session started for ${courseName}`);
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error(err.response?.data?.message || 'Failed to start session on the server.');
    }
  };

  useEffect(() => {
    if (sessionActive && !teacherCoords) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setTeacherCoords(coords);
            toast.success("✅ Classroom GPS coordinates acquired.");
          },
          (error) => {
            console.warn("Could not get teacher geolocation:", error);
            toast.error("⚠️ Location access denied. GPS geofencing disabled for this session.");
          },
          { enableHighAccuracy: true }
        );
      } else {
        toast.error("GPS not supported on this browser.");
      }
    }
  }, [sessionActive, teacherCoords]);

  const handlePauseSession = async () => {
    try {
      const nextPaused = !sessionPaused;
      await apiClient.put(`/attendance/sessions/${activeSessionId}`, {
        status: nextPaused ? 'Paused' : 'Active'
      });
      setSessionPaused(nextPaused);
      toast(nextPaused ? 'Session Paused' : 'Session Resumed', {
        icon: nextPaused ? '⏸️' : '▶️',
      });
    } catch (err) {
      console.error('Error toggling session pause status:', err);
      toast.error('Failed to update session status.');
    }
  };

  const handleRestartSession = () => {
    Swal.fire({
      title: 'Reset Session?',
      text: 'This will erase all active fingerprint scan records for this session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, reset'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/attendance/sessions/${activeSessionId}/records`);
          setCheckedInStudents([]);
          setSessionStats({ present: 0, late: 0, absent: 40 });
          setTeacherCoords(null);
          toast.success('Session reset completed');
        } catch (err) {
          console.error('Error resetting session records:', err);
          toast.error('Failed to clear session records on server.');
        }
      }
    });
  };

  const handleFinishSession = () => {
    const courseName = coursesList.find(c => c.id === selectedCourseId)?.name || course;
    Swal.fire({
      title: 'Finish Session?',
      text: `You have registered ${sessionStats.present + sessionStats.late} check-ins. Unregistered students will be marked absent.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, submit logs'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.put(`/attendance/sessions/${activeSessionId}`, {
            status: 'Finished'
          });
          setSessionActive(false);
          setTeacherCoords(null);
          Swal.fire({
            title: 'Session Archived',
            html: `<b>Course:</b> ${courseName}<br/><b>Present:</b> ${sessionStats.present}<br/><b>Late:</b> ${sessionStats.late}<br/><b>Absent:</b> ${sessionStats.absent}`,
            icon: 'success',
            confirmButtonColor: '#4f46e5'
          }).then(() => {
            navigate('/');
          });
        } catch (err) {
          console.error('Error finishing session:', err);
          toast.error('Failed to finish session on server.');
        }
      }
    });
  };

  // --- HARDWARE SCANS SIMULATOR ---
  const triggerSimulatedScan = async (student) => {
    if (!sessionActive) {
      toast.error('Cannot simulate: Session is not started.', { id: 'sim-err' });
      return;
    }
    if (sessionPaused) {
      toast.error('Cannot simulate: Session is currently paused.', { id: 'sim-err' });
      return;
    }

    try {
      const res = await apiClient.post('/attendance/scan', {
        session_id: activeSessionUuid,
        fingerprint_id: student.fingerprintId,
        verification_method: 'Fingerprint',
        status: simLateArrival ? 'Late' : 'Present'
      });

      if (res.data.duplicate) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-bold text-xs">Verification Failed</span>
            <span className="text-[10px] text-slate-500">Duplicate scan: {student.name} is already logged.</span>
          </div>,
          { id: `dup-${student.studentId}` }
        );
        
        setScannedLogs(prev => [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), name: student.name, fp: student.fingerprintId, status: 'Duplicate Scan Rejected', success: false },
          ...prev
        ]);
      } else {
        setScannedLogs(prev => [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), name: student.name, fp: student.fingerprintId, status: `Verified (${res.data.status})`, success: true },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error simulating scan:', err);
      toast.error(err.response?.data?.message || 'Simulation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          Biometric Session Manager
        </h2>
        <p className="text-xs font-medium text-slate-400">
          Spawn attendance sessions, sync with Wi-Fi terminals, and watch real-time check-ins.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Side: Setup Panel OR Active Controls */}
        <div className="lg:col-span-2 space-y-6">
          {!sessionActive ? (
            // 1. SESSION CONFIGURATION PANEL
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">Session Configurations</span>
              
              <div className="grid gap-4 grid-cols-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Department</label>
                  <select 
                    value={selectedDepartmentId} 
                    onChange={handleDepartmentChange} 
                    className="glass-input mt-1.5"
                  >
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Program</label>
                  <select 
                    value={selectedProgramId} 
                    onChange={handleProgramChange} 
                    className="glass-input mt-1.5"
                  >
                    {programsList
                      .filter(p => p.departmentId === selectedDepartmentId)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Course</label>
                  <select 
                    value={selectedCourseId} 
                    onChange={handleCourseChange} 
                    className="glass-input mt-1.5"
                  >
                    {coursesList
                      .filter(c => c.programId === selectedProgramId)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                  <select 
                    value={selectedSubjectId} 
                    onChange={e => setSelectedSubjectId(parseInt(e.target.value))} 
                    className="glass-input mt-1.5"
                  >
                    {subjectsList
                      .filter(s => s.courseId === selectedCourseId)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Classroom</label>
                  <select 
                    value={selectedClassroomId} 
                    onChange={handleClassroomChange} 
                    className="glass-input mt-1.5"
                  >
                    {classroomsList.map(c => (
                      <option key={c.id} value={c.id}>{c.room_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Section</label>
                  <select 
                    value={section} 
                    onChange={e => setSection(e.target.value)} 
                    className="glass-input mt-1.5"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Term Semester</label>
                  <select 
                    value={selectedSemesterId} 
                    onChange={e => setSelectedSemesterId(parseInt(e.target.value))} 
                    className="glass-input mt-1.5"
                  >
                    {semestersList.map(s => (
                      <option key={s.id} value={s.id}>{s.term}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Biometric Reader</label>
                  <select 
                    value={selectedDeviceId} 
                    onChange={e => setSelectedDeviceId(parseInt(e.target.value))} 
                    className="glass-input mt-1.5 font-semibold text-indigo-500"
                  >
                    {devicesList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} &bull; ({d.status})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleStartSession}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 py-3.5 text-xs font-semibold text-white shadow shadow-indigo-500/10 active:scale-[0.98] transition-all"
              >
                <Play className="h-4.5 w-4.5" />
                <span>START ATTENDANCE SESSION</span>
              </button>
            </div>
          ) : (
            // 2. ACTIVE SESSION STATUS AND CONTROLS
            <div className="space-y-6">
              {/* Session Core info */}
              <div className="glass-panel rounded-3xl p-5 border border-slate-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
                    <Wifi className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {coursesList.find(c => c.id === selectedCourseId)?.name || course}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {classroomsList.find(c => c.id === selectedClassroomId)?.room_number || classroom} &bull; Sec {section} &bull; Device: {devicesList.find(d => d.id === selectedDeviceId)?.name || selectedDevice}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 mt-1">
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                        liveConnectionStatus === 'connected' ? 'bg-emerald-500 animate-ping' :
                        liveConnectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
                      }`}></span>
                      <span className={`${
                        liveConnectionStatus === 'connected' ? 'text-emerald-500' :
                        liveConnectionStatus === 'error' ? 'text-rose-500' : 'text-amber-400'
                      }`}>
                        {sessionPaused ? 'PAUSED' : liveConnectionStatus === 'connected' ? 'LIVE · Students Can Scan' : liveConnectionStatus === 'error' ? 'SOCKET ERROR' : 'CONNECTING...'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Session controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePauseSession}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    {sessionPaused ? <Play className="h-4 w-4 text-emerald-500" /> : <Pause className="h-4 w-4" />}
                    <span>{sessionPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button 
                    onClick={handleRestartSession}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4 text-amber-500" />
                    <span>Reset</span>
                  </button>
                  <button 
                    onClick={handleFinishSession}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 text-white px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700"
                  >
                    <Check className="h-4 w-4" />
                    <span>Finish</span>
                  </button>
                </div>
              </div>

              {/* Statistics Panel */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Checked In</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-white md:text-2xl mt-1 block">
                    {sessionStats.present + sessionStats.late}
                  </span>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Present</span>
                  <span className="text-xl font-bold text-emerald-500 md:text-2xl mt-1 block">{sessionStats.present}</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Late</span>
                  <span className="text-xl font-bold text-amber-500 md:text-2xl mt-1 block">{sessionStats.late}</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Absent</span>
                  <span className="text-xl font-bold text-rose-500 md:text-2xl mt-1 block">{sessionStats.absent}</span>
                </div>
              </div>

              {/* Live Attendance List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Live Check-ins</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${
                      liveConnectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                      liveConnectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400'
                    }`} />
                    <span className="text-[9px] font-semibold text-slate-400">
                      {liveConnectionStatus === 'connected' ? 'Real-time · Students scanning now' :
                      liveConnectionStatus === 'error' ? 'Socket disconnected' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-4 dark:border-slate-800/40 dark:bg-slate-900/60 max-h-[380px] overflow-y-auto pr-2 min-h-[150px] flex flex-col">
                  {checkedInStudents.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-650">
                      <QrCode className="h-8 w-8 animate-pulse text-indigo-400/80 mb-2" />
                      <span className="text-[11px] font-semibold">Awaiting student QR scans...</span>
                      <span className="text-[9px] mt-1 text-slate-400">Show the QR code on the projector — students scan with their phones.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {checkedInStudents.map((student) => (
                          <motion.div 
                            key={student.id}
                            initial={{ opacity: 0, y: -15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/40 dark:bg-slate-950/40"
                          >
                            <div className="flex items-center gap-3">
                              <img src={student.photo} alt={student.name} className="h-9 w-9 rounded-xl object-cover" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{student.name}</span>
                                <span className="text-[9px] font-semibold text-slate-400">
                                  {student.studentId}
                                  {student.verification === 'QR' ? ' · QR Scan' : student.fingerprintId ? ` · FP: ${student.fingerprintId}` : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-semibold text-slate-400">{student.time}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                student.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {student.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Biometric Hardware Simulator Widget */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 dark:border-indigo-500/5 bg-indigo-550/5 dark:bg-indigo-950/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 mb-3">
                <Cpu className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider font-sans">ESP32 scanner simulator</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed mb-4">
                Simulate biometric check-ins locally. Useful for testing automated late flags, duplicate scanning rejections, and dashboards.
              </p>

              {/* Late Arrival config */}
              <div className="mb-5 flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5">
                <span className="text-[10px] font-bold text-slate-400">Class Time Offset (Simulate Late)</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={simLateArrival} 
                    onChange={() => setSimLateArrival(!simLateArrival)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-700 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Student trigger buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Simulate Fingerprint Scan for:</span>
                {studentPool.map((student) => (
                  <button 
                    key={student.id}
                    onClick={() => triggerSimulatedScan(student)}
                    disabled={!sessionActive || sessionPaused}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <img src={student.photo} alt={student.name} className="h-6 w-6 rounded-md object-cover" />
                      <div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">{student.name}</p>
                        <p className="text-[8px] text-slate-400 font-semibold">{student.fingerprintId}</p>
                      </div>
                    </div>
                    <span className="rounded bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 text-[8px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase">Scan FP</span>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Rotating Display Panel */}
          {sessionActive && (
            <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 dark:border-indigo-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400">
                  <QrCode className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">QR Attendance Code</span>
                </div>
                <button
                  onClick={fetchQRToken}
                  disabled={qrLoading || sessionPaused}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 transition-all"
                >
                  <RefreshCw className={`h-3 w-3 ${qrLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  Code refreshes every <b>30s</b> — single-use only. Screenshots shared on WhatsApp will not work.
                </p>
              </div>

              {/* QR Display */}
              <div className="flex flex-col items-center gap-3">
                {qrToken && qrToken !== 'NO_ACTIVE_SESSION' ? (
                  <div className="relative">
                    <div className="rounded-2xl border-2 border-indigo-500/20 bg-white p-4 shadow-sm">
                      <QRCodeSVG
                        value={qrToken}
                        size={160}
                        level="M"
                        includeMargin={false}
                        fgColor="#1e1b4b"
                      />
                    </div>
                    {/* Countdown ring overlay */}
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-extrabold text-white">{qrCountdown}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                    <QrCode className="h-8 w-8 opacity-30" />
                    <span className="text-[10px] font-semibold">
                      {sessionPaused ? 'Session paused — QR disabled' : 'Starting QR...'}
                    </span>
                  </div>
                )}

                {/* Expiry Progress Bar */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                    <span>Expires in</span>
                    <span className={qrCountdown <= 10 ? 'text-rose-500' : 'text-slate-400'}>{qrCountdown}s</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${(qrCountdown / 30) * 100}%` }}
                      className={`h-full rounded-full transition-all ${
                        qrCountdown <= 10 ? 'bg-rose-500' : qrCountdown <= 20 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <p className="text-[9px] text-center text-slate-400 font-medium max-w-[180px] leading-relaxed">
                  Show this QR on the projector. Students scan it with their phone camera using the Student Portal.
                </p>
              </div>
            </div>
          )}

          {/* Raw Simulator log tracker */}
            {scannedLogs.length > 0 && (
              <div className="mt-5 border-t border-slate-250/20 pt-4 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Simulator Debug Logs:</span>
                <div className="rounded-xl bg-slate-950 p-2 text-[9px] text-slate-400 font-mono space-y-1 max-h-[120px] overflow-y-auto">
                  {scannedLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between gap-1 leading-normal truncate">
                      <span>[{log.time}] {log.name}:</span>
                      <span className={log.success ? 'text-emerald-400' : 'text-rose-400'}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceSession;
