import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, ShieldCheck, UserCheck } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+1 (555) 018-9921',
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors } } = useForm();

  const handleUpdateContact = (data) => {
    setLoading(true);
    setTimeout(() => {
      updateProfile(data);
      toast.success('Contact information updated');
      setLoading(false);
    }, 800);
  };

  const handleChangePassword = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      toast.success('Password updated successfully');
      resetPassword();
      setPassLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          My Profile Card
        </h2>
        <p className="text-xs font-medium text-slate-400">
          Manage your personal details, email configurations, and login credential.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Profile Avatar and Scope */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 flex flex-col items-center justify-center text-center">
          <img 
            src={user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
            alt={user?.name} 
            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-indigo-500/10 mb-4"
          />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <span className="text-xs font-semibold text-slate-400 mt-1 block uppercase tracking-wider">{user?.role} portal</span>
          
          <div className="mt-6 w-full space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-semibold text-slate-500 text-left">
            {user?.role === 'student' && (
              <>
                <div className="flex justify-between"><span className="text-slate-450">ID:</span><span className="text-slate-700 dark:text-slate-200">{user.studentId}</span></div>
                <div className="flex justify-between"><span className="text-slate-450">Program:</span><span className="text-slate-700 dark:text-slate-200">{user.program}</span></div>
                <div className="flex justify-between"><span className="text-slate-450">Semester:</span><span className="text-slate-700 dark:text-slate-200">{user.semester}</span></div>
                <div className="flex justify-between"><span className="text-slate-450">Attendance:</span><span className="text-indigo-500">{user.attendancePercentage}%</span></div>
              </>
            )}
            {user?.role !== 'student' && (
              <>
                <div className="flex justify-between"><span className="text-slate-455">Department:</span><span className="text-slate-700 dark:text-slate-200">{user.department}</span></div>
                <div className="flex justify-between"><span className="text-slate-455">Email:</span><span className="text-slate-700 dark:text-slate-200">{user.email}</span></div>
              </>
            )}
          </div>
        </div>

        {/* Right Tab panels: Edit Details & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Contact details card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-white">
              <UserCheck className="h-4.5 w-4.5 text-indigo-500" />
              <span>Contact Particulars</span>
            </div>

            <form onSubmit={handleSubmit(handleUpdateContact)} className="space-y-4 text-xs">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input type="text" {...register('name')} className="glass-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input type="email" {...register('email')} className="glass-input pl-9" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input type="text" {...register('phone')} className="glass-input pl-9" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 font-semibold text-white shadow shadow-indigo-500/10 transition-colors"
                >
                  {loading ? 'Updating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-white">
              <Lock className="h-4.5 w-4.5 text-indigo-500" />
              <span>Change Account Password</span>
            </div>

            <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="space-y-4 text-xs">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    {...registerPassword('oldPassword', { required: 'Old password is required' })} 
                    className="glass-input mt-1.5" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min length is 6' } })} 
                    className="glass-input mt-1.5" 
                  />
                  {errors.newPassword && <span className="text-[9px] text-rose-500">{errors.newPassword.message}</span>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    {...registerPassword('confirmPassword', { required: 'Please confirm new password' })} 
                    className="glass-input mt-1.5" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={passLoading}
                  className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 font-semibold text-white shadow shadow-indigo-500/10 transition-colors"
                >
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
