import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Redirect away if no token in URL
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const passwordOk = password.length >= 6;
  const confirmOk = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOk) { setError('Password must be at least 6 characters'); return; }
    if (!confirmOk)  { setError('Passwords do not match'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reset failed');
      setDone(true);
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
        Sign in
      </button>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-15" />

        <div className="relative bg-gradient-to-br from-[#181f36]/95 via-[#1e253f]/95 to-[#131a30]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">

          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-3">
              <KeyRound className="text-cyan-400" size={26} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Set New Password
            </h1>
            <p className="text-sm text-slate-400 mt-1 text-center">
              {done ? 'Your password has been updated' : 'Choose a strong new password'}
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 w-full">
                <CheckCircle2 className="text-green-400 flex-shrink-0" size={18} />
                <span className="text-green-300 text-sm">Password reset successfully. You can now sign in with your new password.</span>
              </div>
              <button
                onClick={() => navigate('/signin')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div className="relative">
                <label className="absolute -top-2 left-4 px-1 text-xs font-medium text-gray-400 bg-[#1e253f] z-10">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Min 6 characters"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-sm placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-cyan-400/5 transition-all"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {password && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${passwordOk ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle2 size={11} />
                    <span>At least 6 characters</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="relative">
                <label className="absolute -top-2 left-4 px-1 text-xs font-medium text-gray-400 bg-[#1e253f] z-10">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repeat your password"
                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border-2 text-white text-sm placeholder-transparent focus:outline-none transition-all ${
                      confirm && !confirmOk
                        ? 'border-red-400 bg-red-400/5'
                        : confirmOk
                        ? 'border-green-400 bg-green-400/5'
                        : 'border-white/10 bg-white/5 focus:border-cyan-400 focus:bg-cyan-400/5'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirm && !confirmOk && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={15} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !passwordOk || !confirmOk}
                className="relative w-full overflow-hidden mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 rounded-xl" />
                <div className="relative flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
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
