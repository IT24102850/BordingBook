import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('We’ve sent a verification link to your email address. Please check your inbox and follow the instructions to activate your account.');

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get('token') || '';
  const email = query.get('email') || '';

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      setIsVerifying(true);
      setStatus('idle');

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Verification failed');
        }

        setStatus('success');
        setMessage('Email verified successfully. You can now sign in.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Invalid or expired verification link.');
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Missing email. Please sign up again to get a new verification link.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not resend verification email');
      }

      setStatus('idle');
      setMessage('A new verification link has been sent. Please check your inbox.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#181f36]/90 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          {isVerifying || isResending ? (
            <Loader2 className="w-10 h-10 text-cyan-300 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          ) : status === 'error' ? (
            <AlertCircle className="w-10 h-10 text-rose-400" />
          ) : (
            <MailCheck className="w-10 h-10 text-cyan-300" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-cyan-300 text-center mb-4">Verify Your Email</h1>
        <p className="text-cyan-100 text-center max-w-md mx-auto">{message}</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="flex-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 py-2.5 font-semibold hover:bg-cyan-500/30 transition"
          >
            Go to Sign In
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="flex-1 rounded-lg bg-white/10 border border-white/20 text-white py-2.5 font-semibold hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Resending...' : 'Resend Email'}
          </button>
        </div>

        {!token && !email && (
          <p className="text-xs text-cyan-200/70 text-center mt-4">
            Tip: after signup you will be redirected here with your email so you can resend verification.
          </p>
        )}
      </div>
    </div>
  );
}
