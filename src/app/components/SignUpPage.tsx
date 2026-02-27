import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, 
  Shield, Mail, Lock, CheckCircle, XCircle, FileText, 
  Building, Phone, User, Home, Briefcase, Sparkles,
  ChevronRight, Zap, Award, Clock
} from 'lucide-react';

// Professional online image for right panel
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
          {/* Professional student housing image */}
          <img 
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
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
            <h3 className="text-xl font-bold mb-1">Find Your Perfect Roommate</h3>
            <p className="text-sm text-white/80">Join thousands of students already connected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SignUpPage() {
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [currentStep, setCurrentStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  // Owner-specific fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [propertyCount, setPropertyCount] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    confirm: false,
    fullName: false,
    phoneNumber: false
  });
  
  const navigate = useNavigate();

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const strength = score === 4 ? 'Strong' : score >= 2 ? 'Medium' : 'Weak';
    const strengthColor = score === 4 ? 'bg-green-500' : score >= 2 ? 'bg-yellow-500' : 'bg-red-500';
    
    return { checks, strength, score, strengthColor };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    
    if (role === 'student') {
      if (!email.endsWith('@sliit.lk') && !email.endsWith('@my.sliit.lk')) {
        return 'Use @sliit.lk or @my.sliit.lk';
      }
    } else {
      if (email.endsWith('@sliit.lk') || email.endsWith('@my.sliit.lk')) {
        return 'Use business/personal email';
      }
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    
    if (role === 'student') {
      if (password.length < 8) return 'Minimum 8 characters';
      if (!/\d/.test(password)) return 'Include a number';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Include a symbol';
      if (!/[A-Z]/.test(password)) return 'Include uppercase letter';
    } else {
      if (password.length < 6) return 'Minimum 6 characters';
    }
    return '';
  };

  const validateConfirm = (confirm: string) => {
    if (!confirm) return 'Please confirm';
    if (confirm !== password) return 'Passwords do not match';
    return '';
  };

  const validateFullName = (name: string) => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Name too short';
    return '';
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return 'Phone is required';
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(phone)) return 'Invalid format';
    return '';
  };

  const emailError = touchedFields.email ? validateEmail(email) : '';
  const passwordError = touchedFields.password ? validatePassword(password) : '';
  const confirmError = touchedFields.confirm ? validateConfirm(confirm) : '';
  const fullNameError = role === 'owner' && touchedFields.fullName ? validateFullName(fullName) : '';
  const phoneNumberError = role === 'owner' && touchedFields.phoneNumber ? validatePhoneNumber(phoneNumber) : '';
  
  const passwordStrength = password && role === 'student' ? checkPasswordStrength(password) : null;

  // Update current step based on form completion
  useEffect(() => {
    if (role === 'student') {
      if (email && password && confirm) setCurrentStep(2);
      else setCurrentStep(1);
    } else {
      if (fullName && phoneNumber && email && password && confirm) setCurrentStep(2);
      else setCurrentStep(1);
    }
  }, [role, email, password, confirm, fullName, phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouchedFields({ 
      email: true, 
      password: true, 
      confirm: true,
      fullName: role === 'owner',
      phoneNumber: role === 'owner'
    });
    
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validateConfirm(confirm);
    const fullNameValidation = role === 'owner' ? validateFullName(fullName) : '';
    const phoneNumberValidation = role === 'owner' ? validatePhoneNumber(phoneNumber) : '';
    
    if (emailValidation || passwordValidation || confirmValidation || fullNameValidation || phoneNumberValidation) {
      setError('Please fix the errors below');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Account created! Verification email sent.');
      setTimeout(() => navigate('/verify-email'), 1500);
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleSocialSignUp = (provider: string) => {
    setIsLoading(true);
    // Simulate social signup
    setTimeout(() => {
      setSuccess(`Account created with ${provider}!`);
      setTimeout(() => navigate('/verify-email'), 1500);
      setIsLoading(false);
    }, 1500);
  };

  // Responsive sizing based on Redmi Note 13 (1080 x 2400)
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
        onClick={handleBack}
        className="absolute top-3 left-3 md:top-6 md:left-6 z-20 flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-xl rounded-full text-cyan-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/50 transition-all group"
      >
        <ArrowLeft size={isRedmiNote13 ? 16 : 18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs md:text-sm font-medium">Back</span>
      </button>

      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center items-center px-3 md:px-4 py-12 md:py-0 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md mx-auto mt-8 md:mt-0">
          {/* Progress Steps - Mobile optimized */}
          <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    step < currentStep 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                      : step === currentStep
                      ? 'bg-white text-cyan-600 border-2 border-cyan-400 shadow-lg'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircle size={isRedmiNote13 ? 14 : 16} />
                    ) : (
                      <span className="font-bold text-sm md:text-base">{step}</span>
                    )}
                  </div>
                  <span className={`absolute -bottom-5 text-[8px] md:text-[10px] font-medium whitespace-nowrap ${
                    step === currentStep ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Account'}
                    {step === 2 && 'Verify'}
                    {step === 3 && 'Setup profile'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-[1px] md:h-[2px] mx-1 md:mx-2 transition-all duration-500 ${
                    step < currentStep ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Main Card - Mobile optimized */}
          <div className="relative group">
            {/* Glow effect - reduced on mobile */}
            <div className="absolute -inset-0.5 md:-inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl md:rounded-3xl blur-md md:blur-xl opacity-10 md:opacity-20 group-hover:opacity-20 md:group-hover:opacity-30 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-[#181f36]/95 via-[#1e253f]/95 to-[#131a30]/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8 border border-white/10">
              
              {/* Header - Mobile optimized */}
              <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-2 md:mb-3">
                  <UserCheck className="text-cyan-400" size={isRedmiNote13 ? 20 : 24} />
                </div>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  BoardingBook
                </span>
                <span className="text-[9px] md:text-[11px] text-cyan-200/60 mt-0.5 md:mt-1 tracking-wider uppercase">
                  SLIIT Student Platform
                </span>
              </div>

              <h2 className="text-lg md:text-2xl font-bold text-center mb-1">
                <span className="bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  Create account
                </span>
              </h2>
              <p className="text-center text-xs md:text-sm text-cyan-200/50 mb-4 md:mb-6">
                Join thousands finding their perfect housing
              </p>

              {/* Role Toggle - Mobile optimized */}
              <div className="relative bg-white/5 p-0.5 md:p-1 rounded-xl md:rounded-2xl mb-4 md:mb-6 border border-white/10">
                <div className={`absolute top-0.5 bottom-0.5 w-1/2 rounded-lg md:rounded-xl transition-all duration-300 ${
                  role === 'student' 
                    ? 'left-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600' 
                    : 'left-[calc(50%-0.125rem)] md:left-[calc(50%-0.25rem)] bg-gradient-to-r from-purple-500 to-purple-600'
                }`} />
                <div className="relative flex">
                  <button
                    type="button"
                    className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 ${
                      role === 'student' ? 'text-white' : 'text-gray-400 hover:text-cyan-200'
                    }`}
                    onClick={() => {
                      setRole('student');
                      setError('');
                    }}
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <User size={isRedmiNote13 ? 14 : 16} />
                      Student
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 ${
                      role === 'owner' ? 'text-white' : 'text-gray-400 hover:text-purple-200'
                    }`}
                    onClick={() => {
                      setRole('owner');
                      setError('');
                    }}
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <Building size={isRedmiNote13 ? 14 : 16} />
                      Owner
                    </span>
                  </button>
                </div>
              </div>

              <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Owner Fields */}
                {role === 'owner' && (
                  <div className="space-y-2 md:space-y-3 animate-slideDown">
                    {/* Full Name */}
                    <div className="relative">
                      <label className={`absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] font-medium transition-all z-10 bg-[#1e253f] ${
                        fullNameError && touchedFields.fullName
                          ? 'text-red-400'
                          : focusedField === 'fullName'
                          ? 'text-purple-400'
                          : 'text-gray-400'
                      }`}>
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => {
                            setFocusedField(null);
                            setTouchedFields(prev => ({ ...prev, fullName: true }));
                          }}
                          className={`w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                            fullNameError && touchedFields.fullName
                              ? 'border-red-400 bg-red-400/5'
                              : fullName && !fullNameError
                              ? 'border-green-400 bg-green-400/5'
                              : focusedField === 'fullName'
                              ? 'border-purple-400 bg-purple-400/5'
                              : 'border-white/10 bg-white/5'
                          } text-white placeholder-transparent focus:outline-none`}
                          placeholder="John Doe"
                        />
                        <User className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedField === 'fullName' ? 'text-purple-400' : 'text-gray-400'
                        }`} size={isRedmiNote13 ? 14 : 16} />
                        {fullName && !fullNameError && touchedFields.fullName && (
                          <CheckCircle className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-green-400" size={isRedmiNote13 ? 14 : 16} />
                        )}
                      </div>
                      {fullNameError && touchedFields.fullName && (
                        <p className="text-red-400 text-[9px] md:text-xs mt-1 ml-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {fullNameError}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="relative">
                      <label className={`absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] font-medium transition-all z-10 bg-[#1e253f] ${
                        phoneNumberError && touchedFields.phoneNumber
                          ? 'text-red-400'
                          : focusedField === 'phoneNumber'
                          ? 'text-purple-400'
                          : 'text-gray-400'
                      }`}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          onFocus={() => setFocusedField('phoneNumber')}
                          onBlur={() => {
                            setFocusedField(null);
                            setTouchedFields(prev => ({ ...prev, phoneNumber: true }));
                          }}
                          className={`w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                            phoneNumberError && touchedFields.phoneNumber
                              ? 'border-red-400 bg-red-400/5'
                              : phoneNumber && !phoneNumberError
                              ? 'border-green-400 bg-green-400/5'
                              : focusedField === 'phoneNumber'
                              ? 'border-purple-400 bg-purple-400/5'
                              : 'border-white/10 bg-white/5'
                          } text-white placeholder-transparent focus:outline-none`}
                          placeholder="+94 77 123 4567"
                        />
                        <Phone className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedField === 'phoneNumber' ? 'text-purple-400' : 'text-gray-400'
                        }`} size={isRedmiNote13 ? 14 : 16} />
                        {phoneNumber && !phoneNumberError && touchedFields.phoneNumber && (
                          <CheckCircle className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-green-400" size={isRedmiNote13 ? 14 : 16} />
                        )}
                      </div>
                      {phoneNumberError && touchedFields.phoneNumber && (
                        <p className="text-red-400 text-[9px] md:text-xs mt-1 ml-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {phoneNumberError}
                        </p>
                      )}
                    </div>

                    {/* Company & Properties */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div className="relative">
                        <label className="absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] text-gray-400 bg-[#1e253f] z-10">
                          Company
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            className="w-full pl-7 md:pl-9 pr-2 py-2 md:py-3 rounded-lg md:rounded-xl border-2 border-white/10 bg-white/5 text-white text-sm md:text-base focus:border-purple-400 focus:outline-none transition-all"
                            placeholder="Your Co."
                          />
                          <Briefcase className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={isRedmiNote13 ? 12 : 14} />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] text-gray-400 bg-[#1e253f] z-10">
                          Properties
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={propertyCount}
                            onChange={e => setPropertyCount(e.target.value)}
                            className="w-full pl-7 md:pl-9 pr-2 py-2 md:py-3 rounded-lg md:rounded-xl border-2 border-white/10 bg-white/5 text-white text-sm md:text-base focus:border-purple-400 focus:outline-none transition-all"
                            placeholder="5"
                            min="0"
                          />
                          <Home className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={isRedmiNote13 ? 12 : 14} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="relative">
                  <label className={`absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] font-medium transition-all z-10 bg-[#1e253f] ${
                    emailError && touchedFields.email
                      ? 'text-red-400'
                      : focusedField === 'email'
                      ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                      : 'text-gray-400'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedFields(prev => ({ ...prev, email: true }));
                      }}
                      className={`w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                        emailError && touchedFields.email
                          ? 'border-red-400 bg-red-400/5'
                          : email && !emailError
                          ? 'border-green-400 bg-green-400/5'
                          : focusedField === 'email'
                          ? role === 'student' ? 'border-cyan-400 bg-cyan-400/5' : 'border-purple-400 bg-purple-400/5'
                          : 'border-white/10 bg-white/5'
                      } text-white placeholder-transparent focus:outline-none`}
                      placeholder={role === 'student' ? "student@sliit.lk" : "owner@company.com"}
                    />
                    <Mail className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'email' 
                        ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                        : 'text-gray-400'
                    }`} size={isRedmiNote13 ? 14 : 16} />
                    {email && !emailError && touchedFields.email && (
                      <CheckCircle className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-green-400" size={isRedmiNote13 ? 14 : 16} />
                    )}
                  </div>
                  {emailError && touchedFields.email ? (
                    <p className="text-red-400 text-[9px] md:text-xs mt-1 ml-1 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {emailError}
                    </p>
                  ) : (
                    <p className="text-[8px] md:text-[10px] text-cyan-400/40 mt-1 ml-1 flex items-center gap-1">
                      <Mail size={8} />
                      {role === 'student' ? '@sliit.lk or @my.sliit.lk' : 'Business or personal email'}
                    </p>
                  )}
                </div>

                {/* Password Fields Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {/* Password */}
                  <div className="relative">
                    <label className={`absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] font-medium transition-all z-10 bg-[#1e253f] ${
                      passwordError && touchedFields.password
                        ? 'text-red-400'
                        : focusedField === 'password'
                        ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                        : 'text-gray-400'
                    }`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => {
                          setFocusedField(null);
                          setTouchedFields(prev => ({ ...prev, password: true }));
                        }}
                        className={`w-full pl-7 md:pl-9 pr-7 md:pr-9 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                          passwordError && touchedFields.password
                            ? 'border-red-400 bg-red-400/5'
                            : password && !passwordError
                            ? 'border-green-400 bg-green-400/5'
                            : focusedField === 'password'
                            ? role === 'student' ? 'border-cyan-400 bg-cyan-400/5' : 'border-purple-400 bg-purple-400/5'
                            : 'border-white/10 bg-white/5'
                        } text-white placeholder-transparent focus:outline-none`}
                        placeholder="••••••••"
                      />
                      <Lock className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        focusedField === 'password'
                          ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                          : 'text-gray-400'
                      }`} size={isRedmiNote13 ? 12 : 14} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={isRedmiNote13 ? 12 : 14} /> : <Eye size={isRedmiNote13 ? 12 : 14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label className={`absolute -top-1.5 md:-top-2 left-2 md:left-3 px-1 text-[8px] md:text-[10px] font-medium transition-all z-10 bg-[#1e253f] ${
                      confirmError && touchedFields.confirm
                        ? 'text-red-400'
                        : focusedField === 'confirm'
                        ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                        : 'text-gray-400'
                    }`}>
                      Confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => {
                          setFocusedField(null);
                          setTouchedFields(prev => ({ ...prev, confirm: true }));
                        }}
                        className={`w-full pl-7 md:pl-9 pr-7 md:pr-9 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-sm md:text-base transition-all ${
                          confirmError && touchedFields.confirm
                            ? 'border-red-400 bg-red-400/5'
                            : confirm && !confirmError
                            ? 'border-green-400 bg-green-400/5'
                            : focusedField === 'confirm'
                            ? role === 'student' ? 'border-cyan-400 bg-cyan-400/5' : 'border-purple-400 bg-purple-400/5'
                            : 'border-white/10 bg-white/5'
                        } text-white placeholder-transparent focus:outline-none`}
                        placeholder="••••••••"
                      />
                      <Lock className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        focusedField === 'confirm'
                          ? role === 'student' ? 'text-cyan-400' : 'text-purple-400'
                          : 'text-gray-400'
                      }`} size={isRedmiNote13 ? 12 : 14} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={isRedmiNote13 ? 12 : 14} /> : <Eye size={isRedmiNote13 ? 12 : 14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements & Strength - Only for students */}
                {role === 'student' && password && (
                  <div className="space-y-1.5 md:space-y-2 animate-slideDown">
                    <div className="grid grid-cols-2 gap-1 md:gap-2">
                      {[
                        { label: '8+ chars', check: password?.length >= 8 },
                        { label: 'Number', check: /\d/.test(password) },
                        { label: 'Symbol', check: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                        { label: 'Uppercase', check: /[A-Z]/.test(password) },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center ${
                            req.check ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {req.check ? (
                              <CheckCircle size={8} />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-gray-400" />
                            )}
                          </div>
                          <span className={`text-[8px] md:text-[10px] ${req.check ? 'text-green-400' : 'text-gray-400'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Strength Meter */}
                    <div className="space-y-0.5 md:space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] md:text-[10px] text-gray-400">Strength</span>
                        <span className={`text-[8px] md:text-[10px] font-medium ${
                          passwordStrength?.strength === 'Strong' ? 'text-green-400' :
                          passwordStrength?.strength === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {passwordStrength?.strength}
                        </span>
                      </div>
                      <div className="h-1 md:h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            passwordStrength?.strengthColor
                          }`}
                          style={{ width: `${(passwordStrength?.score || 0) * 25}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-red-500/10 border border-red-500/30 rounded-lg md:rounded-xl p-2 md:p-3 animate-shake">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={isRedmiNote13 ? 14 : 16} />
                    <span className="text-red-400 text-xs md:text-sm">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-green-500/10 border border-green-500/30 rounded-lg md:rounded-xl p-2 md:p-3 animate-pulse">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={isRedmiNote13 ? 14 : 16} />
                    <span className="text-green-400 text-xs md:text-sm">{success}</span>
                  </div>
                )}

                {/* Submit Button - Mobile optimized */}
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
                        <span className="font-semibold text-sm md:text-base">Creating...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-sm md:text-base">Create Account</span>
                        <Sparkles size={isRedmiNote13 ? 14 : 16} className="group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Social Login - Role based */}
              <div className="mt-4 md:mt-6 space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                  <span className="text-[9px] md:text-[10px] text-gray-400">or continue with</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />
                </div>

                <div className="flex justify-center gap-2 md:gap-3">
                  {/* Google - Available for both */}
                  <button 
                    onClick={() => handleSocialSignUp('Google')}
                    className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all group flex-1 max-w-[120px] md:max-w-none"
                  >
                    <div className="flex items-center justify-center gap-1 md:gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-cyan-400" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-xs md:text-sm text-gray-400 group-hover:text-cyan-400">Google</span>
                    </div>
                  </button>

                  {/* Facebook - Only for owners */}
                  {role === 'owner' && (
                    <button 
                      onClick={() => handleSocialSignUp('Facebook')}
                      className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-purple-400/5 transition-all group flex-1 max-w-[120px] md:max-w-none"
                    >
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-purple-400">Facebook</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                  <span className="text-[10px] md:text-xs text-gray-400">
                    Already have an account?{' '}
                    <a href="/signin" className="text-cyan-400 hover:text-purple-400 font-medium transition-colors">
                      Sign in
                    </a>
                  </span>
                </div>

                {/* Terms Links */}
                <div className="flex justify-center gap-3 md:gap-4 pt-1 md:pt-2">
                  <a href="/terms" className="text-[8px] md:text-[9px] text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <FileText size={8} />
                    Terms
                  </a>
                  <span className="text-gray-600 text-[8px] md:text-[9px]">•</span>
                  <a href="/privacy" className="text-[8px] md:text-[9px] text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1">
                    <Shield size={8} />
                    Privacy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Professional Image */}
      <div className="hidden md:flex w-1/2 min-h-screen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-indigo-500/5" />
        <ProfessionalVisual />
      </div>

      {/* Mobile Visual - Optimized for Redmi Note 13 */}
      <div className="md:hidden w-full px-3 pb-4">
        <div className="relative h-24 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />
          <img 
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Modern student housing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white text-xs font-bold">Find Your Perfect Roommate</h3>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
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