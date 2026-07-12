import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-md">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The requested URL path was not discovered on this system. It might have been migrated, deleted, or entered incorrectly.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 flex inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
