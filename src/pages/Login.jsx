import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Calculate redirect route
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await login(data.username, data.password);
      if (res.success) {
        if (res.sandbox) {
          toast.success(`Logged in to sandbox as ${res.user.name}`, { id: 'login-success' });
        } else {
          toast.success(`Welcome back, ${res.user.name}!`, { id: 'login-success' });
        }
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid username or password', { id: 'login-error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Dynamic Glowing Radial Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-purple-500/10 blur-[130px]" />
      <div className="absolute top-[30%] right-[20%] h-[30%] w-[30%] rounded-full bg-blue-500/5 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Banner */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h2 className="mt-4 font-sans text-2xl font-extrabold tracking-tight text-white">Smart Attendance System</h2>
          <p className="mt-1.5 text-xs font-medium text-slate-400">Fingerprint Biometric Authentication Portal</p>
        </div>

        {/* Credentials Card (Glassmorphic) */}
        <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Username / ID</label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter your username or ID" 
                  {...register('username', { required: 'Username is required' })}
                  className={`w-full rounded-xl bg-white/5 border border-white/10 px-11 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${errors.username ? 'border-rose-500/50 focus:ring-rose-500/30' : ''}`}
                />
              </div>
              {errors.username && <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.username.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <a href="/forgot-password" className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300">Forgot Password?</a>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••" 
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full rounded-xl bg-white/5 border border-white/10 px-11 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${errors.password ? 'border-rose-500/50 focus:ring-rose-500/30' : ''}`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3.5 text-xs font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/15 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-8 border-t border-white/5 pt-5 text-center">
            <p className="text-[10px] font-medium text-slate-500">Quick Testing Credentials:</p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2 text-[9px] font-semibold text-slate-400">
              <span className="rounded bg-white/5 px-2 py-1"><b className="text-white">Admin</b>: admin / admin123</span>
              <span className="rounded bg-white/5 px-2 py-1"><b className="text-white">Teacher</b>: teacher / teacher123</span>
              <span className="rounded bg-white/5 px-2 py-1"><b className="text-white">Student</b>: student / student123</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-medium text-slate-600">
          &copy; {new Date().getFullYear()} University Systems. Secure Biometric Framework.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
