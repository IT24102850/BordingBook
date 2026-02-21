import React, { useState } from 'react';
import { BoardingSlideshow } from './ui/BoardingSlideshow';
import { Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
// Abstract illustration for right panel
const AbstractVisual = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="relative w-[90%] h-[80%] max-w-[420px] max-h-[520px] bg-gradient-to-br from-cyan-400 via-purple-400 to-indigo-400 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
      {/* Abstract SVG illustration */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 520" fill="none">
        <ellipse cx="200" cy="260" rx="180" ry="220" fill="#fff" fillOpacity="0.12"/>
        <ellipse cx="200" cy="260" rx="120" ry="140" fill="#fff" fillOpacity="0.10"/>
        <path d="M60,400 Q200,320 340,400 Q200,480 60,400 Z" fill="#fff" fillOpacity="0.13"/>
        <path d="M100,120 Q200,40 300,120 Q200,200 100,120 Z" fill="#fff" fillOpacity="0.10"/>
        <circle cx="320" cy="80" r="24" fill="#fff" fillOpacity="0.18"/>
        <circle cx="80" cy="440" r="18" fill="#fff" fillOpacity="0.15"/>
      </svg>
      {/* Floating card */}
      <div className="absolute top-10 left-10 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg px-5 py-3 flex flex-col items-center border border-cyan-200 z-10 min-w-[120px]">
        <ShieldCheck className="text-cyan-400 mb-1" size={22}/>
        <div className="text-cyan-700 font-bold text-sm">SLIIT Secure</div>
      </div>
      <div className="absolute bottom-10 right-10 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg px-5 py-3 flex flex-col items-center border border-purple-200 z-10 min-w-[120px]">
        <Mail className="text-purple-400 mb-1" size={20}/>
        <div className="text-purple-700 font-semibold text-sm">Inbox</div>
      </div>
    </div>
  </div>
);

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSuccess('Signed in successfully!');
    // Here you would handle actual sign in logic
  };
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] overflow-hidden">
      {/* Left: Form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 md:px-12 py-8 md:py-0">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 bg-gradient-to-br from-[#181f36]/90 via-[#232b47]/90 to-[#0b132b]/90 rounded-3xl shadow-2xl p-6 md:p-10 border border-cyan-300/30">
          <div className="flex flex-col items-center mb-2">
            <UserCheck className="text-cyan-300 mb-1" size={32} />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">BoardingBook</span>
            <span className="text-xs text-cyan-200 font-medium mt-1">SLIIT Student Boarding Platform</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-cyan-200 text-center tracking-tight mb-1">Welcome Back</h2>
          <p className="text-center text-cyan-300/80 text-sm mb-2">Sign in to your account to continue</p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="peer pl-12 pr-4 py-3 rounded-xl border border-cyan-300 bg-[#181f36] text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full text-base md:text-lg font-medium placeholder-transparent transition-all duration-300 shadow-sm"
                required
                autoComplete="email"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" size={22} />
              <label htmlFor="email" className="absolute left-12 top-1/2 -translate-y-1/2 text-cyan-200 bg-[#181f36] px-1 font-bold transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-cyan-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-cyan-400 drop-shadow z-10 peer-not-empty:-translate-y-7 peer-not-empty:scale-90 peer-not-empty:text-cyan-200">Email</label>
            </div>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="peer pl-12 pr-4 py-3 rounded-xl border border-cyan-300 bg-[#181f36] text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full text-base md:text-lg font-medium placeholder-transparent transition-all duration-300 shadow-sm"
                required
                autoComplete="current-password"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" size={22} />
              <label htmlFor="password" className="absolute left-12 top-1/2 -translate-y-1/2 text-cyan-200 bg-[#181f36] px-1 font-bold transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-cyan-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-placeholder-shown:text-cyan-400 drop-shadow z-10 peer-not-empty:-translate-y-7 peer-not-empty:scale-90 peer-not-empty:text-cyan-200">Password</label>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-cyan-300/80">Use your SLIIT email</span>
              <a href="#" className="text-xs text-cyan-400 hover:underline">Forgot password?</a>
            </div>
            {error && <div className="text-red-400 text-sm font-semibold mt-2">{error}</div>}
            {success && <div className="text-green-400 text-sm font-semibold mt-2">{success}</div>}
            <button type="submit" className="bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition text-lg w-full mt-2">Sign In</button>
          </form>
          {/* Social login divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-cyan-900/40" />
            <span className="mx-3 text-xs text-cyan-300/80">or sign in with</span>
            <div className="flex-1 h-px bg-cyan-900/40" />
          </div>
          <div className="flex gap-3 justify-center">
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#181f36] via-[#232b47] to-[#0b132b] border border-cyan-300/30 rounded-lg shadow-sm hover:bg-cyan-900/40 transition"><FcGoogle size={20}/> <span className="text-sm font-medium text-cyan-100">Google</span></button>
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#181f36] via-[#232b47] to-[#0b132b] border border-cyan-300/30 rounded-lg shadow-sm hover:bg-cyan-900/40 transition"><FaFacebook className="text-blue-400" size={18}/> <span className="text-sm font-medium text-cyan-100">Facebook</span></button>
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#181f36] via-[#232b47] to-[#0b132b] border border-cyan-300/30 rounded-lg shadow-sm hover:bg-cyan-900/40 transition"><FaApple className="text-cyan-100" size={18}/> <span className="text-sm font-medium text-cyan-100">Apple</span></button>
          </div>
          <div className="mt-3 text-center text-cyan-200 text-base">
            Don't have an account? <a href="/signup" className="underline text-purple-300 hover:text-cyan-300 font-semibold">Sign Up</a>
          </div>
        </div>
      </div>
      {/* Right: Visual panel */}
      <div className="hidden md:flex w-1/2 min-h-screen items-center justify-center bg-gradient-to-br from-[#181f36] via-[#232b47] to-[#0b132b]">
        <AbstractVisual />
      </div>
      {/* Mobile: stack form and visual panel */}
      <div className="md:hidden w-full flex flex-col items-center justify-center gap-4 mt-8 px-2">
        <div className="w-full flex flex-col items-center justify-center rounded-2xl shadow-xl bg-gradient-to-r from-[#181f36] via-[#232b47] to-[#0b132b] p-4">
          <AbstractVisual />
        </div>
      </div>
    </div>
  );
}
