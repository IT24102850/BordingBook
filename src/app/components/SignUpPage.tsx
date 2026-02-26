import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardingSlideshow } from './ui/BoardingSlideshow';
import { UserCheck, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Shield, Mail, Lock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// Abstract illustration for right panel with helpful messaging
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
      
      {/* Security & benefit cards */}
      <div className="absolute top-10 left-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg px-5 py-3 flex flex-col items-center border border-cyan-200 z-10 min-w-[140px]">
        <Shield className="text-cyan-500 mb-1" size={24}/>
        <div className="text-cyan-800 font-bold text-sm">Verified Housing</div>
        <div className="text-cyan-600 text-xs">100% authentic</div>
      </div>
      
      <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg px-5 py-3 flex flex-col items-center border border-purple-200 z-10 min-w-[140px]">
        <Lock className="text-purple-500 mb-1" size={22}/>
        <div className="text-purple-800 font-bold text-sm">Secure Payments</div>
        <div className="text-purple-600 text-xs">End-to-end encrypted</div>
      </div>
      
      {/* Onboarding step indicator */}
      <div className="absolute bottom-10 left-10 bg-indigo-900/80 backdrop-blur-xl rounded-lg px-4 py-3 border border-indigo-400 z-10">
        <p className="text-indigo-200 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Step 1: Create account
        </p>
        <p className="text-indigo-300 text-xs mt-1 ml-4">→ Step 2: Verify email</p>
        <p className="text-indigo-300 text-xs ml-4">→ Step 3: Setup profile</p>
      </div>
    </div>
  </div>
);

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    confirm: false
  });
  
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      strength: strength === 4 ? 'strong' : strength >= 2 ? 'medium' : 'weak',
      score: strength
    };
  };

  // Validate email format and SLIIT domain
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    // For frontend-only testing, allow any email. Uncomment below for real validation:
    // if (!email.endsWith('@my.sliit.lk')) return 'Must be a @my.sliit.lk email address';
    return '';
  };

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(password)) return 'Password must include at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must include at least one symbol';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
    return '';
  };

  // Validate confirm password
  const validateConfirm = (confirm: string) => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== password) return 'Passwords do not match';
    return '';
  };

  const emailError = touchedFields.email ? validateEmail(email) : '';
  const passwordError = touchedFields.password ? validatePassword(password) : '';
  const confirmError = touchedFields.confirm ? validateConfirm(confirm) : '';
  
  const passwordStrength = password ? checkPasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    setTouchedFields({ email: true, password: true, confirm: true });
    
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validateConfirm(confirm);
    
    if (emailValidation || passwordValidation || confirmValidation) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate email already exists check
      if (email === 'existing@sliit.lk') {
        throw new Error('This email is already registered');
      }
      
      setSuccess('Account created successfully! A verification email has been sent to your inbox.');
      
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Get strength color
  const getStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-600';
    switch (passwordStrength.strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] overflow-hidden">
      {/* Back Button (all viewports) */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-cyan-200 hover:text-cyan-400 font-medium px-4 py-2 mt-4 ml-4 w-fit bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-md"
        aria-label="Back"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 20 }}
      >
        <ArrowLeft size={22} />
        <span>Back</span>
      </button>

      {/* Left: Form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 md:px-12 py-8 md:py-0">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 bg-gradient-to-br from-[#181f36]/90 via-[#232b47]/90 to-[#0b132b]/90 rounded-3xl shadow-2xl p-6 md:p-10 border border-cyan-300/30">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-2">
            <UserCheck className="text-cyan-300 mb-1" size={32} />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">BoardingBook</span>
            <span className="text-xs text-cyan-200 font-medium mt-1">SLIIT Student Boarding Platform</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-cyan-200 text-center tracking-tight mb-1">Create your account</h2>
          <p className="text-center text-cyan-300/80 text-sm mb-2">Sign up to get started</p>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            
            {/* Email Field with Label */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-cyan-200 font-semibold text-sm ml-1">
                Email address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                  className={`pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                    emailError && touchedFields.email 
                      ? 'border-red-400 focus:ring-red-400' 
                      : email && !emailError
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-cyan-300 focus:ring-cyan-400'
                  } bg-[#181f36] text-cyan-100 focus:outline-none focus:ring-2 w-full text-base md:text-lg font-medium transition-all duration-300 shadow-sm`}
                  placeholder="student@sliit.lk"
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" size={22} />
                {email && !emailError && touchedFields.email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" size={20} />
                )}
                {emailError && touchedFields.email && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {emailError && touchedFields.email && (
                <div id="email-error" className="flex items-center gap-1 text-red-400 text-sm mt-1 ml-1">
                  <AlertCircle size={14} />
                  <span>{emailError}</span>
                </div>
              )}
              {!emailError && email && touchedFields.email && (
                <div className="flex items-center gap-1 text-green-400 text-sm mt-1 ml-1">
                  <CheckCircle size={14} />
                  <span>Valid SLIIT email</span>
                </div>
              )}
            </div>

            {/* Password Field with Label and Strength Meter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-cyan-200 font-semibold text-sm ml-1">
                Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, password: true }))}
                  className={`pl-12 pr-12 py-3.5 rounded-xl border-2 ${
                    passwordError && touchedFields.password 
                      ? 'border-red-400 focus:ring-red-400' 
                      : password && !passwordError
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-cyan-300 focus:ring-cyan-400'
                  } bg-[#181f36] text-cyan-100 focus:outline-none focus:ring-2 w-full text-base md:text-lg font-medium transition-all duration-300 shadow-sm`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : "password-requirements"}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" size={22} />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>

              {/* Password requirements */}
              <div id="password-requirements" className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={password?.length >= 8 ? 'text-green-400' : 'text-cyan-300/60'}>
                    {password?.length >= 8 ? '✓' : '○'} At least 8 characters
                  </span>
                  <span className={/\d/.test(password) ? 'text-green-400' : 'text-cyan-300/60'}>
                    {/\d/.test(password) ? '✓' : '○'} One number
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-cyan-300/60'}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One symbol
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-cyan-300/60'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </span>
                </div>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                        style={{ width: `${(passwordStrength?.score || 0) * 25}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-cyan-300">
                      {passwordStrength?.strength === 'strong' ? 'Strong' : 
                       passwordStrength?.strength === 'medium' ? 'Medium' : 'Weak'} password
                    </span>
                  </div>
                </div>
              )}

              {passwordError && touchedFields.password && (
                <div id="password-error" className="flex items-center gap-1 text-red-400 text-sm mt-1 ml-1">
                  <AlertCircle size={14} />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-cyan-200 font-semibold text-sm ml-1">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, confirm: true }))}
                  className={`pl-12 pr-12 py-3.5 rounded-xl border-2 ${
                    confirmError && touchedFields.confirm 
                      ? 'border-red-400 focus:ring-red-400' 
                      : confirm && !confirmError
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-cyan-300 focus:ring-cyan-400'
                  } bg-[#181f36] text-cyan-100 focus:outline-none focus:ring-2 w-full text-base md:text-lg font-medium transition-all duration-300 shadow-sm`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!confirmError}
                  aria-describedby={confirmError ? "confirm-error" : undefined}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" size={22} />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1"
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {confirmError && touchedFields.confirm && (
                <div id="confirm-error" className="flex items-center gap-1 text-red-400 text-sm mt-1 ml-1">
                  <AlertCircle size={14} />
                  <span>{confirmError}</span>
                </div>
              )}
              {confirm && !confirmError && touchedFields.confirm && (
                <div className="flex items-center gap-1 text-green-400 text-sm mt-1 ml-1">
                  <CheckCircle size={14} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Email hint */}
            <div className="flex items-center gap-1 mt-1">
              <Mail size={12} className="text-cyan-400" />
              <span className="text-xs text-cyan-300/90">Use your @sliit.lk email address</span>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/30 rounded-lg p-3 mt-2">
                <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/30 rounded-lg p-3 mt-2">
                <CheckCircle className="text-green-400 flex-shrink-0" size={18} />
                <div className="flex flex-col">
                  <span className="text-green-400 text-sm font-medium">{success}</span>
                  <span className="text-green-400/80 text-xs mt-1">Please check your inbox and verify your email.</span>
                </div>
              </div>
            )}

            {/* Sign Up Button with Loading State */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 text-lg w-full mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Creating account...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Email verification notice */}
          <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-3">
            <p className="text-center text-cyan-200 text-xs font-medium flex items-center justify-center gap-2">
              <Mail size={16} className="text-cyan-400" />
              You'll receive a verification email to activate your account
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center text-cyan-300/70 text-xs">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-cyan-400 hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>
          </div>

          {/* Sign In Link */}
          <div className="mt-2 text-center text-cyan-200 text-base">
            Already have an account?{' '}
            <a href="/signin" className="underline text-purple-300 hover:text-cyan-300 font-semibold hover:no-underline transition">
              Sign In
            </a>
          </div>

          {/* Footer links */}
          <div className="flex justify-center gap-4 mt-2 text-xs text-cyan-400/60">
            <a href="/privacy" className="hover:text-cyan-300 transition flex items-center gap-1">
              <FileText size={12} />
              Privacy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-cyan-300 transition flex items-center gap-1">
              <Shield size={12} />
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Right: Visual panel with helpful messaging */}
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