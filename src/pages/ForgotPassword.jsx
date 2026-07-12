import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Reset instructions sent to your email.');
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-purple-500/10 blur-[130px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-2xl">
          <button 
            onClick={() => navigate('/login')}
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </button>

          {!submitted ? (
            <>
              <h2 className="font-sans text-xl font-extrabold text-white">Reset Password</h2>
              <p className="mt-1.5 text-xs text-slate-400">Enter your registered email address and we'll send you instructions to recover your credential.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="alex.wright@student.edu" 
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full rounded-xl bg-white/5 border border-white/10 px-11 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${errors.email ? 'border-rose-500/50 focus:ring-rose-500/30' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.email.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3.5 text-xs font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/15 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>Send Recovery Instructions</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Send className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-sans text-xl font-extrabold text-white">Check Your Inbox</h2>
              <p className="mt-2.5 text-xs text-slate-400">We have dispatched password reset guidelines to your address. Please verify your spam folder if it doesn't appear shortly.</p>
              
              <button 
                onClick={() => navigate('/login')}
                className="mt-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-2.5 text-xs font-semibold text-white transition-all w-full"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
