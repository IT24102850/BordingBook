import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5001')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

export const MobileLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Invalid email or password');
      }

      const user = result?.data?.user || {};
      localStorage.setItem('bb_access_token', result?.data?.token || '');
      localStorage.setItem('userRole', user.role || 'student');
      localStorage.setItem('userName', user.fullName || (user.email ? String(user.email).split('@')[0] : 'User'));
      localStorage.setItem('bb_current_user', JSON.stringify(user));

      const isNewStudent = user?.isNewStudent === true;

      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (isNewStudent) {
        navigate('/profile-setup');
      } else {
        navigate('/search');
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white">
      <div className="w-16 h-16 bg-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <User className="text-white w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold mb-8">Smart Boarding</h1>
      <div className="w-full space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-indigo-300 w-5 h-5" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none transition-colors bg-white text-indigo-900"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-indigo-300 w-5 h-5" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isLoading) {
                void handleLogin();
              }
            }}
            className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none transition-colors bg-white text-indigo-900"
          />
        </div>
        <div className="text-right">
          <button className="text-xs text-indigo-200 hover:text-white font-medium">Forgot Password?</button>
        </div>
        {error && <p className="text-xs text-red-200 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">{error}</p>}
        <button
          onClick={() => void handleLogin()}
          disabled={isLoading}
          className="w-full bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-800 transition shadow-lg active:scale-95 transform disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/mobile/signup')}
            className="text-sm font-medium text-indigo-200 hover:text-white"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export const MobileSignUp = () => {
  return (
    <div className="flex flex-col h-full p-8 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white pt-20">
      <h1 className="text-3xl font-extrabold mb-8">Create Account</h1>
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-indigo-200 tracking-wider">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-indigo-300 w-5 h-5" />
            <input type="text" className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none bg-white text-indigo-900" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-indigo-200 tracking-wider">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-indigo-300 w-5 h-5" />
            <input type="email" className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none bg-white text-indigo-900" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-indigo-200 tracking-wider">Phone Number</label>
          <input type="tel" className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none bg-white text-indigo-900" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-indigo-200 tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-indigo-300 w-5 h-5" />
            <input type="password" className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-700 outline-none bg-white text-indigo-900" />
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <button className="w-full bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-800 transition shadow-lg active:scale-95 transform">Sign Up</button>
        <div className="text-center">
          <button className="text-sm font-medium text-indigo-200 hover:text-white">Already have an account? Login</button>
        </div>
      </div>
    </div>
  );
};
