import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, KeyRound, MailCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../api/config';

type Status = 'idle' | 'loading' | 'success' | 'error';

function Shell({ status, title, children }: { status: Status; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181f36]/90 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          {status === 'loading' ? (
            <Loader2 className="w-10 h-10 text-cyan-300 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          ) : status === 'error' ? (
            <AlertCircle className="w-10 h-10 text-rose-400" />
          ) : (
            <KeyRound className="w-10 h-10 text-cyan-300" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-cyan-300 text-center mb-4">{title}</h1>
        {children}
        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/signin" className="text-indigo-300 hover:text-indigo-200">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400';
const buttonClass =
  'w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 font-semibold text-white disabled:opacity-60';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send reset email');
      setStatus('success');
      setMessage(data.message || 'If an account exists, a reset email has been sent.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <Shell status={status} title="Forgot your password?">
      {status === 'success' ? (
        <div className="flex items-start gap-3 text-emerald-100">
          <MailCheck className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{message} The link is valid for a limited time.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-slate-300 text-sm text-center">
            Enter your account email and we’ll send you a link to choose a new password.
          </p>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {status === 'error' && <p className="text-rose-300 text-sm">{message}</p>}
          <button type="submit" className={buttonClass} disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </Shell>
  );
}

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>(token ? 'idle' : 'error');
  const [message, setMessage] = useState(token ? '' : 'This reset link is missing its token. Request a new one.');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not reset password');
      setStatus('success');
      setMessage(data.message || 'Password updated. You can now sign in.');
      setTimeout(() => navigate('/signin'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <Shell status={status} title="Choose a new password">
      {status === 'success' ? (
        <p className="text-emerald-100 text-center">{message}</p>
      ) : !token ? (
        <p className="text-rose-100 text-center">
          {message} <Link to="/forgot-password" className="underline">Request a new link</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="New password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm new password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {status === 'error' && <p className="text-rose-300 text-sm">{message}</p>}
          <button type="submit" className={buttonClass} disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </Shell>
  );
}
