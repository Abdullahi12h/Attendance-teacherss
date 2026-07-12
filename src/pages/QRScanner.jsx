import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

/**
 * QR Attendance Scanner Page
 * 
 * How it works:
 *  1. Student opens this page.
 *  2. Camera opens automatically.
 *  3. Student points camera at the QR displayed on the teacher's screen.
 *  4. The app sends the token to /api/qr/verify with the student's JWT.
 *  5. Server validates token expiry, signature, active session, and duplicate check.
 *  6. If valid → attendance marked. If expired → rejected.
 * 
 * SECURITY: Because the token expires in 30 seconds, screenshots/WhatsApp sharing is useless.
 */
const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | success | error | duplicate | expired | input_credentials
  const [message, setMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const html5QrCodeRef = useRef(null);
  const [scannedToken, setScannedToken] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && scannerStarted) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        // already stopped
      }
      setScannerStarted(false);
    }
  }, [scannerStarted]);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    html5QrCodeRef.current = new Html5Qrcode('qr-reader');

    try {
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 }
        },
        onScanSuccess,
        () => {} // ignore scan errors (no QR in view yet)
      );
      setScannerStarted(true);
    } catch (err) {
      setScanState('error');
      setMessage('Camera access denied. Please allow camera permission and try again.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScanSuccess = async (decodedText) => {
    // Stop scanner immediately to prevent duplicate reads
    await stopScanner();
    setScannedToken(decodedText);
    setScanState('input_credentials');
    setMessage('Please enter your Student ID and Password to check-in.');
  };

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      toast.error('Please enter both Student ID and Password.');
      return;
    }

    setScanState('verifying');
    setMessage('Acquiring location coordinates...');

    if (!navigator.geolocation) {
      setScanState('error');
      setMessage('Your device does not support geolocation. Location-restricted check-in failed.');
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setMessage('Verifying with server...');
        try {
          const res = await apiClient.post('/qr/verify', {
            token: scannedToken,
            latitude,
            longitude,
            studentId: studentIdInput.trim(),
            password: passwordInput.trim()
          });
          setScanState('success');
          setStudentInfo(res.data.student);
          setMessage(res.data.message);
          toast.success(`✅ ${res.data.message}`);
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Verification failed.';
          if (errMsg.toLowerCase().includes('expired')) {
            setScanState('expired');
            setMessage('QR code has expired. Please scan the latest QR on the screen.');
          } else if (errMsg.toLowerCase().includes('already been recorded') || errMsg.toLowerCase().includes('already recorded') || errMsg.toLowerCase().includes('already')) {
            setScanState('duplicate');
            setMessage('Your attendance has already been recorded for this session.');
          } else {
            setScanState('error');
            setMessage(errMsg);
          }
          toast.error(errMsg, { id: 'qr-error' });
        }
      },
      (error) => {
        console.error("Error acquiring student location:", error);
        setScanState('error');
        setMessage('Fadlan daar GPS/Location si aad isu xaadiriso. Location access is required to check in.');
        toast.error('Location access denied. Check-in aborted.', { id: 'qr-error' });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleRetry = async () => {
    setScanState('idle');
    setMessage('');
    setStudentInfo(null);
    setStudentIdInput('');
    setPasswordInput('');
    setScannedToken('');
    await startScanner();
  };

  const statusConfig = {
    idle: { icon: QrCode, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Scan QR Code' },
    input_credentials: { icon: QrCode, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Verify Credentials' },
    verifying: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Verifying...' },
    success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Attendance Recorded!' },
    expired: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'QR Code Expired' },
    duplicate: { icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Already Recorded' },
    error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Scan Failed' },
  };

  const cfg = statusConfig[scanState] || statusConfig.idle;
  const StatusIcon = cfg.icon;
  const showCamera = scanState === 'idle';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
          QR Attendance Check-in
        </h2>
        <p className="text-xs font-medium text-slate-400">
          Scan the QR code displayed on the board to mark your attendance.
        </p>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-3.5">
        <ShieldAlert className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 leading-relaxed">
          QR codes refresh every <b>30 seconds</b> and can only be used <b>once</b>. 
          Screenshots or QR codes shared via WhatsApp will not work.
        </p>
      </div>

      {/* Camera / Status Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4 flex flex-col items-center">

        {/* Camera Viewfinder */}
        {showCamera && (
          <div className="w-full overflow-hidden rounded-2xl border-2 border-indigo-500/20 bg-slate-950">
            <div id="qr-reader" ref={scannerRef} className="w-full" style={{ minHeight: '300px' }} />
          </div>
        )}

        {/* Result Status */}
        {!showCamera && scanState !== 'input_credentials' && (
          <div className={`flex flex-col items-center gap-3 py-8 px-4 w-full rounded-2xl ${cfg.bg}`}>
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${cfg.bg}`}>
              <StatusIcon className={`h-8 w-8 ${cfg.color}`} />
            </div>

            <h3 className={`text-sm font-extrabold ${cfg.color}`}>{cfg.label}</h3>
            <p className="text-xs font-semibold text-slate-500 text-center max-w-[240px] leading-relaxed">{message}</p>

            {/* Show student info on success */}
            {scanState === 'success' && studentInfo && (
              <div className="flex items-center gap-3 mt-3 rounded-2xl border border-slate-200/60 bg-white/80 dark:bg-slate-900/60 dark:border-slate-800/40 p-3.5 w-full">
                <img
                  src={studentInfo.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={studentInfo.name}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{studentInfo.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{studentInfo.studentId}</p>
                </div>
                <span className="ml-auto rounded-lg bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-500 uppercase">
                  ✓ Verified
                </span>
              </div>
            )}
          </div>
        )}

        {/* Credentials Form */}
        {scanState === 'input_credentials' && (
          <form onSubmit={handleSubmitCredentials} className="w-full space-y-4">
            <div className="text-center pb-2">
              <h3 className="text-sm font-bold text-indigo-500">QR Code Scanned!</h3>
              <p className="text-[10px] text-slate-400 mt-1">Please enter your Student ID and Password to verify your attendance.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Student ID</label>
              <input
                type="text"
                placeholder="e.g. CS-2026-089"
                value={studentIdInput}
                onChange={e => setStudentIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3.5 text-xs font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3.5 text-xs font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-750 py-3 text-xs font-bold text-white shadow shadow-indigo-550/10 active:scale-[0.98] transition-all"
            >
              Verify & Check In
            </button>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 w-full pt-1">
          {(scanState === 'expired' || scanState === 'error') && (
            <button
              onClick={handleRetry}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white transition-all active:scale-[0.98]"
            >
              Try Again
            </button>
          )}
          {scanState === 'success' && (
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition-all"
            >
              Back to Dashboard
            </button>
          )}
          {scanState === 'duplicate' && (
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-xs font-bold text-white transition-all"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Help text */}
      <p className="text-center text-[10px] text-slate-400 font-medium">
        Having trouble? Make sure your camera is facing the QR code clearly and the screen isn't too bright or dark.
      </p>
    </div>
  );
};

export default QRScanner;
