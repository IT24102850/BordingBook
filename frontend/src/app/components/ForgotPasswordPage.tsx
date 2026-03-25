import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0f1425] to-[#0a0f1e] px-4">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/signin')}
        className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full text-cyan-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/50 transition-all text-sm"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </button>

      <div className="relative w-full max-w-md">
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-15" />

        <div className="relative bg-gradient-to-br from-[#181f36]/95 via-[#1e253f]/95 to-[#131a30]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">

          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-3">
              <KeyRound className="text-cyan-400" size={26} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="text-sm text-slate-400 mt-1 text-center">
              {sent
                ? 'Check your inbox for the reset link'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 w-full">
                <CheckCircle2 className="text-green-400 flex-shrink-0" size={18} />
                <span className="text-green-300 text-sm">
                  If <span className="font-medium text-green-200">{email}</span> has an account, a reset link was sent. Check your spam folder too.
                </span>
              </div>
              <button
                onClick={() => navigate('/signin')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="absolute -top-2 left-4 px-1 text-xs font-medium text-gray-400 bg-[#1e253f] z-10">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-sm placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-cyan-400/5 transition-all"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={15} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 rounded-xl" />
                <div className="relative flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </div>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
