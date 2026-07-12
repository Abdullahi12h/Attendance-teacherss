import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, Search, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Topbar = ({ toggleSidebar, pageTitle }) => {
  const { user, isSandboxMode } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Device connected', desc: 'Portable Scanner ESP32-A is now online.', time: '2 mins ago', read: false, type: 'success' },
    { id: 2, title: 'Student marked late', desc: 'Marcus Vance marked LATE in Software Architecture.', time: '10 mins ago', read: false, type: 'warning' },
    { id: 3, title: 'Device offline', desc: 'Biometric Unit C-04 disconnected.', time: '1 hour ago', read: true, type: 'danger' }
  ]);

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate real-time logs in sandbox mode
  useEffect(() => {
    if (!isSandboxMode) return;

    const notificationTemplates = [
      { title: 'Fingerprint verified', desc: 'Johnathan Cole registered PRESENT.', type: 'success' },
      { title: 'Student marked late', desc: 'Amina Barre arrived 15m late for Web Programming.', type: 'warning' },
      { title: 'Scanner Battery Alert', desc: 'Device ESP32-A battery level is at 15%.', type: 'warning' },
      { title: 'New Device Registered', desc: 'Biometric Unit E-88 synced successfully.', type: 'success' }
    ];

    const interval = setInterval(() => {
      // 15% chance to trigger notification
      if (Math.random() < 0.15) {
        const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
        const newNotif = {
          id: Date.now(),
          title: template.title,
          desc: template.desc,
          time: 'Just now',
          read: false,
          type: template.type
        };
        
        setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);

        // Display real-time toast
        if (template.type === 'success') {
          toast.success(
            <div className="flex flex-col">
              <span className="font-semibold text-xs">{template.title}</span>
              <span className="text-[10px] text-slate-500">{template.desc}</span>
            </div>,
            { duration: 4000 }
          );
        } else {
          toast.custom(
            (t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-amber-500/30 p-3 pointer-events-auto ring-1 ring-black ring-opacity-5`}>
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{template.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{template.desc}</p>
                  </div>
                  <button onClick={() => toast.dismiss(t.id)} className="text-slate-400 hover:text-slate-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ),
            { duration: 4000 }
          );
        }
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [isSandboxMode]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read', { id: 'mark-read' });
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><Check className="h-4 w-4" /></div>;
      case 'warning':
        return <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"><AlertCircle className="h-4 w-4" /></div>;
      default:
        return <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500"><X className="h-4 w-4" /></div>;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/70 px-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/70">
      {/* Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-slate-800 dark:text-white md:text-base font-sans tracking-tight">
          {pageTitle || 'Dashboard'}
        </h1>
      </div>

      {/* Right Console: Search, Notifications, Profile Info */}
      <div className="flex items-center gap-4">
        {/* Search Input - Desktop */}
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records, devices..." 
            className="w-56 rounded-full bg-slate-100/80 pl-9 pr-4 py-1.5 text-xs text-slate-800 outline-none border border-transparent focus:bg-white focus:border-indigo-500/30 dark:bg-slate-900/80 dark:text-slate-200 dark:focus:bg-slate-900 dark:focus:border-slate-800 transition-all"
          />
        </div>

        {/* Real-time Indicator for Sandbox Mode */}
        {isSandboxMode && (
          <div className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 lg:flex">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Real-time Sync Sandbox</span>
          </div>
        )}

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 transition-all"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              
              {/* Notifications Card */}
              <div className="absolute right-0 mt-2.5 z-20 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Recent Activities</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">No new notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`flex gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{notif.title}</p>
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{notif.desc}</p>
                          <span className="mt-1 block text-[8px] font-medium text-slate-400">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Small Profile Avatar (Visual Only) */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-850 pl-3">
          <img 
            src={user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
            alt={user?.name} 
            className="h-8 w-8 rounded-xl object-cover ring-2 ring-indigo-500/10"
          />
          <div className="hidden flex-col items-start lg:flex">
            <span className="text-[11px] font-bold text-slate-800 dark:text-white leading-none">{user?.name}</span>
            <span className="mt-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
