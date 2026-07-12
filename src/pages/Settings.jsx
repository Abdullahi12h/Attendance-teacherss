import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Settings as SettingsIcon, ShieldCheck, Database, HardDriveDownload, HardDriveUpload, RefreshCw } from 'lucide-react';

const Settings = () => {
  const [univName, setUnivName] = useState('Global Tech University');
  const [univLogo, setUnivLogo] = useState('https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150');
  const [timezone, setTimezone] = useState('GMT+3');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('System settings saved successfully');
    }, 800);
  };

  const handleBackupDatabase = () => {
    setBackupLoading(true);
    toast.loading('Compiling database tables and assets...', { id: 'db-backup' });
    
    setTimeout(() => {
      setBackupLoading(false);
      toast.dismiss('db-backup');
      
      // Simulate file download
      const backupText = `-- Smart Fingerprint Attendance System Backup\n-- Date: ${new Date().toISOString()}\n-- Tables: Users, Students, Sessions, Records, Devices\n\nINSERT INTO SystemSettings VALUES ('${univName}', '${univLogo}');\n`;
      const blob = new Blob([backupText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_backup_${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Database backup SQL generated');
    }, 1500);
  };

  const handleRestoreDatabase = () => {
    Swal.fire({
      title: 'Restore Database?',
      text: 'This operation will overwrite current active databases with default schema entries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, restore schema'
    }).then((result) => {
      if (result.isConfirmed) {
        setRestoreLoading(true);
        toast.loading('Flushing tables and executing seed queries...', { id: 'db-restore' });
        
        setTimeout(() => {
          setRestoreLoading(false);
          toast.dismiss('db-restore');
          Swal.fire({
            title: 'Database Restored',
            text: 'System metrics and user registries restored to master state.',
            icon: 'success',
            confirmButtonColor: '#4f46e5'
          });
        }, 2000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          University System Settings
        </h2>
        <p className="text-xs font-medium text-slate-400">
          Configure server configurations, branding logos, and perform database dumps.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns: Branding & Configuration */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-white">
              <SettingsIcon className="h-4.5 w-4.5 text-indigo-500" />
              <span>General Configurations</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">University Name</label>
                  <input 
                    type="text" 
                    value={univName} 
                    onChange={e => setUnivName(e.target.value)} 
                    className="glass-input mt-1.5" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">University Logo URL</label>
                  <input 
                    type="text" 
                    value={univLogo} 
                    onChange={e => setUnivLogo(e.target.value)} 
                    className="glass-input mt-1.5" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Server Timezone</label>
                  <select 
                    value={timezone} 
                    onChange={e => setTimezone(e.target.value)} 
                    className="glass-input mt-1.5"
                  >
                    <option value="GMT+3">East Africa Time (GMT+3)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="GMT+1">Central European Time (GMT+1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Primary Language</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)} 
                    className="glass-input mt-1.5"
                  >
                    <option value="English">English</option>
                    <option value="Somali">Somali</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 font-semibold text-white shadow shadow-indigo-500/10 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Columns: DB maintenance Operations */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-5 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-white">
              <Database className="h-4.5 w-4.5 text-indigo-500" />
              <span>Database Operations</span>
            </div>
            
            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
              Perform SQL backups or database schema rollbacks. Ensure all live sessions are completed.
            </p>

            <div className="space-y-2.5">
              <button 
                onClick={handleBackupDatabase}
                disabled={backupLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {backupLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                ) : (
                  <HardDriveDownload className="h-4 w-4 text-indigo-500" />
                )}
                <span>Backup Database SQL</span>
              </button>

              <button 
                onClick={handleRestoreDatabase}
                disabled={restoreLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all disabled:opacity-50 text-rose-600 hover:text-rose-700"
              >
                {restoreLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-rose-500" />
                ) : (
                  <HardDriveUpload className="h-4 w-4 text-rose-500" />
                )}
                <span>Restore Default Schema</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
