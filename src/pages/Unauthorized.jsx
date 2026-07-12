import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-md">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your account role does not have authorization to view this resource. Please contact your system administrator if you believe this is an error.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 flex inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
