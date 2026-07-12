import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, ClipboardList, 
  BookOpen, Library, CalendarCheck, Cpu, BarChart3, Bell, Settings, 
  User, LogOut, Moon, Sun, Monitor, QrCode
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isSandboxMode } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const getAdminLinks = () => [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/teachers', label: 'Teachers', icon: GraduationCap },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/programs', label: 'Programs', icon: ClipboardList },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/subjects', label: 'Subjects', icon: Library },
    { to: '/attendance', label: 'Attendance logs', icon: CalendarCheck },
    { to: '/devices', label: 'Devices', icon: Cpu },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getTeacherLinks = () => [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance-session', label: 'Start Attendance', icon: Cpu },
    { to: '/attendance', label: 'Attendance logs', icon: CalendarCheck },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getStudentLinks = () => [
    { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/qr-scan', label: 'Scan QR Code', icon: QrCode },
    { to: '/reports', label: 'Reports & Download', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = user?.role === 'admin' 
    ? getAdminLinks() 
    : user?.role === 'teacher' 
    ? getTeacherLinks() 
    : getStudentLinks();

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white/80 p-5 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800/80 dark:bg-slate-950/80 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-white font-sans text-sm tracking-tight leading-tight">University Attendance</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">FINGERPRINT BIOMETRIC</span>
        </div>
      </div>

      {/* User profile brief */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
        <img 
          src={user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
          alt={user?.name} 
          className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-550/30"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-xs font-semibold text-slate-800 dark:text-white leading-normal">{user?.name}</span>
          <span className="text-[10px] capitalize text-slate-400 font-medium tracking-wide">{user?.role} Portal</span>
        </div>
      </div>

      {/* Sandbox indicator if running on mock */}
      {isSandboxMode && (
        <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-center">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Demo / Sandbox Mode</span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="mt-6 space-y-1 flex-1 overflow-y-auto max-h-[calc(100vh-270px)]">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) => `flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/15' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="absolute bottom-5 left-5 right-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <span className="flex items-center gap-3">
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className="text-[10px] rounded bg-slate-100 dark:bg-slate-900 px-1 text-slate-400">
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Logout */}
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
