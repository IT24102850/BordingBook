import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/* ── Envelope illustration (SVG) ── */
const EnvelopeIllustration = () => (
  <div className="relative flex items-center justify-center select-none">
    {/* Ambient glow */}
    <div className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/25 to-cyan-500/20 blur-3xl animate-pulse" />
    {/* Container disc */}
    <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#1c2240] to-[#1a2850] border border-indigo-400/20 flex items-center justify-center shadow-[0_0_48px_rgba(129,140,248,0.18)]">
      <svg viewBox="0 0 72 72" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="eg2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Envelope shadow */}
        <rect x="8" y="24" width="56" height="38" rx="6" fill="url(#eg2)" />
        {/* Envelope body */}
        <rect x="8" y="22" width="56" height="38" rx="6" stroke="url(#eg)" strokeWidth="1.6" fill="none" />
        {/* Flap fold lines */}
        <path d="M8 28 L36 46 L64 28" stroke="url(#eg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 60 L27 41" stroke="url(#eg)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M64 60 L45 41" stroke="url(#eg)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        {/* Letter lines */}
        <rect x="22" y="31" width="28" height="2.5" rx="1.25" fill="url(#eg)" opacity="0.5" />
        <rect x="26" y="36" width="20" height="2.5" rx="1.25" fill="url(#eg)" opacity="0.35" />
      </svg>

      {/* Floating check badge */}
      <div
        className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-[#818cf8] to-[#22d3ee] flex items-center justify-center shadow-[0_0_16px_rgba(129,140,248,0.6)]"
        style={{ animation: 'float-badge 3s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" fill="none">
          <path d="M4 9 L7.5 12.5 L14 5.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>

    <style>{`
      @keyframes float-badge {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50%       { transform: translateY(-5px) rotate(3deg); }
      }
      @keyframes fade-up-in {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ve-card { animation: fade-up-in 0.5s cubic-bezier(.22,.68,0,1.2) both; }
      .ve-delay-1 { animation-delay: 0.06s; }
      .ve-delay-2 { animation-delay: 0.12s; }
      .ve-delay-3 { animation-delay: 0.18s; }
      .ve-delay-4 { animation-delay: 0.24s; }
    `}</style>
  </div>
);

/* ── Success checkmark ── */
const SuccessIcon = () => (
  <div className="relative flex items-center justify-center">
    <div className="absolute w-32 h-32 rounded-full bg-emerald-500/15 blur-2xl animate-pulse" />
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center">
      <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
    </div>
  </div>
);

/* ── Error icon ── */
const ErrorIcon = () => (
  <div className="relative flex items-center justify-center">
    <div className="absolute w-32 h-32 rounded-full bg-rose-500/15 blur-2xl animate-pulse" />
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-400/30 flex items-center justify-center">
      <AlertCircle className="w-12 h-12 text-rose-400" strokeWidth={1.5} />
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────── */
export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status,  setStatus]  = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get('token') || '';
  const email = query.get('email') || '';

  /* Auto-verify when token is present */
  useEffect(() => {
    if (!token) return;
    (async () => {
      setIsVerifying(true);
      try {
        const res    = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || 'Verification failed');
        setStatus('success');
        setMessage('Your email has been verified and your account is now active.');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Invalid or expired verification link.');
      } finally {
        setIsVerifying(false);
      }
    })();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Missing email. Please sign up again to receive a new link.');
      return;
    }
    setIsResending(true);
    try {
      const res    = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Could not resend');
      setStatus('idle');
      setMessage('A new link has been sent — please check your inbox.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  /* ── Loading / verifying state ── */
  if (isVerifying) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
              <Loader2 size={20} className="text-indigo-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">Verifying your email…</p>
            <p className="text-sm text-slate-400 mt-1">Please wait a moment</p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-6 text-center ve-card">
          <SuccessIcon />
          <div className="ve-card ve-delay-1">
            <p className="text-2xl font-extrabold text-white tracking-tight">Email verified!</p>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">{message}</p>
          </div>
          <button
            onClick={() => navigate('/signin')}
            className="ve-card ve-delay-2 group flex items-center gap-2 bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white font-semibold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.35)] hover:shadow-[0_0_28px_rgba(129,140,248,0.5)] hover:opacity-95 transition-all"
          >
            Sign in now
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </Shell>
    );
  }

  /* ── Error state ── */
  if (status === 'error') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-6 text-center ve-card">
          <ErrorIcon />
          <div className="ve-card ve-delay-1">
            <p className="text-xl font-bold text-white">Verification failed</p>
            <p className="text-sm text-rose-300/80 mt-2 max-w-xs mx-auto">{message}</p>
          </div>
          <div className="ve-card ve-delay-2 flex flex-col sm:flex-row gap-3 w-full">
            {email && (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1e2a50] border border-indigo-500/25 text-indigo-300 font-semibold py-3 rounded-xl hover:bg-[#243060] transition-colors disabled:opacity-50"
              >
                {isResending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Resend link
              </button>
            )}
            <button
              onClick={() => navigate('/signin')}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Go to sign in
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── Default: "check your inbox" state ── */
  return (
    <Shell>
      <div className="flex flex-col items-center gap-7 text-center">

        {/* Illustration */}
        <div className="ve-card">
          <EnvelopeIllustration />
        </div>

        {/* Heading */}
        <div className="space-y-2 ve-card ve-delay-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            You're ready to go!
          </h1>
          <p className="text-lg font-semibold text-slate-300">
            Check your email to begin.
          </p>
        </div>

        {/* Instruction */}
        <div className="ve-card ve-delay-2 max-w-xs text-sm text-slate-400 leading-relaxed">
          {message
            ? <p>{message}</p>
            : (
              <p>
                Please check{' '}
                {email
                  ? <><span className="font-semibold text-indigo-300">'{email}'</span>{' '}</>
                  : 'your inbox '}
                and click the{' '}
                <span className="font-semibold text-white">'Verify Email Address'</span>{' '}
                button to complete your sign up.
              </p>
            )
          }
        </div>

        {/* Open Gmail button */}
        <div className="ve-card ve-delay-3 w-full space-y-3">
          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all hover:border-white/20 group"
          >
            {/* Google G */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Open Gmail
          </a>

          {/* Resend link */}
          <p className="text-xs text-slate-500">
            Didn't receive the email?{' '}
            <button
              onClick={handleResend}
              disabled={isResending || !email}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isResending
                ? <span className="flex items-center gap-1 inline-flex"><Loader2 size={11} className="animate-spin" /> Sending…</span>
                : 'Resend code'}
            </button>
          </p>
        </div>

        {/* Expiry note */}
        <p className="ve-card ve-delay-4 text-[11px] text-slate-600">
          Link expires in 24 hours · Unverified accounts are removed automatically
        </p>
      </div>
    </Shell>
  );
}

/* ── Shared shell ── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#080d1c] via-[#0e1530] to-[#080d1c] p-5 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="relative bg-[#111827]/80 backdrop-blur-2xl rounded-3xl border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-8 sm:p-10">
          {/* Subtle gradient border top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

          {/* BoardingBook wordmark */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#818cf8] to-[#22d3ee] flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.5)]">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <rect x="2" y="2" width="5" height="12" rx="1" fill="white" />
                  <rect x="9" y="2" width="5" height="7" rx="1" fill="white" opacity="0.7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white tracking-tight">BoardingBook</span>
            </div>
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-5">
          © {new Date().getFullYear()} BoardingBook · SLIIT Student Platform
        </p>
      </div>
    </div>
  );
}
