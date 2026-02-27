import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, ShieldCheck, UserCheck, ArrowLeft, Eye, EyeOff, 
  AlertCircle, Loader2, HelpCircle, FileText, Shield,
  Sparkles
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// Professional image for right panel
const ProfessionalVisual = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[90%] h-[80%] max-w-[420px] max-h-[520px]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-purple-400/20 to-indigo-400/20 rounded-3xl blur-3xl animate-pulse" />
        
        {/* Main image card */}
        <div className={`relative w-full h-full rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-1000 ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <img 
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Modern student housing with comfortable living space"
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Bottom overlay text */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h3 className="text-xl font-bold mb-1">Welcome Back!</h3>
            <p className="text-sm text-white/80">Continue your journey to find the perfect room</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });
  
  const navigate = useNavigate();

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Minimum 6 characters';
    return '';
  };

  const emailError = touchedFields.email ? validateEmail(email) : '';
  const passwordError = touchedFields.password ? validatePassword(password) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouchedFields({ email: true, password: true });
    
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation || passwordValidation) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Signed in successfully!');
      setTimeout(() => {
        navigate('/find');
      }, 1000);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccess('Signed in with Google!');
      setTimeout(() => navigate('/find'), 1000);
      setIsLoading(false);
    }, 1500);
  };

  // Responsive sizing based on Redmi Note 13
  const isRedmiNote13 = windowWidth >= 360 && windowWidth <= 400;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a0f1e] via-[#0f1425] to-[#0a0f1e] overflow-hidden">
      {/* Animated background - optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] md:w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse animation-delay-2000" />
      </div>

      {/* Back Button - Mobile optimized */}
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-3 left-3 md:top-6 md:left-6 z-20 flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-xl rounded-full text-cyan-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/50 transition-all group"
        aria-label="Back"
      >
        <ArrowLeft size={isRedmiNote13 ? 16 : 18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs md:text-sm font-medium">Back</span>
      </button>

      {/* Left: Form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center items-center px-3 md:px-4 py-12 md:py-0 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md mx-auto mt-8 md:mt-0">
          
          {/* Main Card - Mobile optimized */}
          <div className="relative group">
            {/* Glow effect - reduced on mobile */}
            <div className="absolute -inset-0.5 md:-inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl md:rounded-3xl blur-md md:blur-xl opacity-10 md:opacity-20 group-hover:opacity-20 md:group-hover:opacity-30 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-[#181f36]/95 via-[#1e253f]/95 to-[#131a30]/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl p-5 md:p-8 border border-white/10">
              
              {/* Header - Mobile optimized */}
              <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-2 md:mb-3">
                  <UserCheck className="text-cyan-400" size={isRedmiNote13 ? 24 : 28} />
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  BoardingBook
                </span>
                <span className="text-[10px] md:text-xs text-cyan-200/60 mt-0.5 md:mt-1 tracking-wider uppercase">
                  SLIIT Student Platform
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-center mb-1">
                <span className="bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </h2>
              <p className="text-center text-xs md:text-sm text-cyan-200/50 mb-4 md:mb-6">
                Sign in to continue your journey
              </p>

              {/* Form */}
              <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit} noValidate>
                
                {/* Email Field with Floating Label */}
                <div className="relative">
                  <label className={`absolute -top-1.5 md:-top-2 left-3 md:left-4 px-1 text-[9px] md:text-xs font-medium transition-all z-10 bg-[#1e253f] ${
                    emailError && touchedFields.email
                      ? 'text-red-400'
                      : focusedField === 'email'
                      ? 'text-cyan-400'
                      : 'text-gray-400'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedFields(prev => ({ ...prev, email: true }));
                      }}
                      className={`w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                        emailError && touchedFields.email 
                          ? 'border-red-400 bg-red-400/5' 
                          : email && !emailError
                          ? 'border-green-400 bg-green-400/5'
                          : focusedField === 'email'
                          ? 'border-cyan-400 bg-cyan-400/5'
                          : 'border-white/10 bg-white/5'
                      } text-white placeholder-transparent focus:outline-none`}
                      placeholder="student@sliit.lk"
                      autoComplete="email"
                    />
                    <Mail className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'email' 
                        ? 'text-cyan-400'
                        : 'text-gray-400'
                    }`} size={isRedmiNote13 ? 16 : 18} />
                    {email && !emailError && touchedFields.email && (
                      <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-green-400">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {emailError && touchedFields.email && (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] md:text-xs mt-1 ml-1">
                      <AlertCircle size={12} />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password Field with Floating Label */}
                <div className="relative">
                  <label className={`absolute -top-1.5 md:-top-2 left-3 md:left-4 px-1 text-[9px] md:text-xs font-medium transition-all z-10 bg-[#1e253f] ${
                    passwordError && touchedFields.password
                      ? 'text-red-400'
                      : focusedField === 'password'
                      ? 'text-cyan-400'
                      : 'text-gray-400'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedFields(prev => ({ ...prev, password: true }));
                      }}
                      className={`w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                        passwordError && touchedFields.password 
                          ? 'border-red-400 bg-red-400/5' 
                          : password && !passwordError
                          ? 'border-green-400 bg-green-400/5'
                          : focusedField === 'password'
                          ? 'border-cyan-400 bg-cyan-400/5'
                          : 'border-white/10 bg-white/5'
                      } text-white placeholder-transparent focus:outline-none`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <Lock className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'password' 
                        ? 'text-cyan-400'
                        : 'text-gray-400'
                    }`} size={isRedmiNote13 ? 16 : 18} />
                    <button
                      type="button"
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={isRedmiNote13 ? 16 : 18} /> : <Eye size={isRedmiNote13 ? 16 : 18} />}
                    </button>
                  </div>
                  {passwordError && touchedFields.password && (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] md:text-xs mt-1 ml-1">
                      <AlertCircle size={12} />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end items-center mt-1">
                  <a 
                    href="/forgot-password" 
                    className="text-[10px] md:text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle size={12} />
                    Forgot password?
                  </a>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2 md:p-3 animate-shake">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={isRedmiNote13 ? 14 : 16} />
                    <span className="text-red-400 text-xs md:text-sm">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2 md:p-3 animate-pulse">
                    <svg className="text-green-400 flex-shrink-0" width={isRedmiNote13 ? 14 : 16} height={isRedmiNote13 ? 14 : 16} viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-green-400 text-xs md:text-sm">{success}</span>
                  </div>
                )}

                {/* Sign In Button with Loading State */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative w-full group overflow-hidden mt-2 md:mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 rounded-lg md:rounded-xl opacity-100 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative flex items-center justify-center gap-1 md:gap-2 py-2.5 md:py-3.5 px-3 md:px-4">
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={isRedmiNote13 ? 16 : 18} />
                        <span className="font-semibold text-sm md:text-base">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-sm md:text-base">Sign In</span>
                        <Sparkles size={isRedmiNote13 ? 14 : 16} className="group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Google Sign In */}
              <div className="mt-4 md:mt-6 space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                  <span className="text-[9px] md:text-[10px] text-gray-400">or continue with</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full max-w-[200px] p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all group flex items-center justify-center gap-2"
                  >
                    <FcGoogle className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm text-gray-400 group-hover:text-cyan-400">Google</span>
                  </button>
                </div>
              </div>

              {/* Help Link */}
              <div className="text-center mt-3">
                <a href="/support" className="text-[9px] md:text-xs text-cyan-400/60 hover:text-cyan-300 underline transition-colors">
                  Trouble signing in? Contact support
                </a>
              </div>

              {/* Sign Up Link */}
              <div className="mt-3 text-center">
                <span className="text-[10px] md:text-xs text-gray-400">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-cyan-400 hover:text-purple-400 font-medium transition-colors">
                    Sign Up
                  </a>
                </span>
              </div>

              {/* Terms and Privacy */}
              <div className="flex justify-center gap-3 md:gap-4 mt-4 pt-1 md:pt-2">
                <a href="/privacy" className="text-[8px] md:text-[9px] text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <FileText size={8} />
                  Privacy
                </a>
                <span className="text-gray-600 text-[8px] md:text-[9px]">•</span>
                <a href="/terms" className="text-[8px] md:text-[9px] text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1">
                  <Shield size={8} />
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Visual panel */}
      <div className="hidden md:flex w-1/2 min-h-screen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-indigo-500/5" />
        <ProfessionalVisual />
      </div>

      {/* Mobile: Visual panel */}
      <div className="md:hidden w-full px-3 pb-4">
        <div className="relative h-24 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />
          <img 
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Modern student housing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white text-xs font-bold">Welcome Back!</h3>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        /* Redmi Note 13 specific optimizations */
        @media (max-width: 400px) {
          input, button {
            min-height: 44px;
          }
          .text-xs {
            font-size: 11px;
          }
          .gap-1 {
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}