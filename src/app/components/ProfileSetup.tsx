import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { 
  FaUserCheck, FaUsers, FaShieldAlt, FaRegSmile, 
  FaCamera, FaChevronLeft, FaChevronRight, FaCheckCircle,
  FaMoneyBillWave, FaMapMarkerAlt, FaUser, FaGraduationCap,
  FaHome, FaRegCommentDots, FaArrowLeft, FaBars,
  FaQuestionCircle, FaSignOutAlt, FaBell, FaSearch, FaTimes
} from 'react-icons/fa';
import { MdDashboard, MdSettings, MdHelp } from 'react-icons/md';
import './ProfileSetupAnimations.css';

const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const genders = ['Male', 'Female', 'Other'];
const roommatePrefs = ['Any', 'Same Gender', 'Different Gender', 'No Preference'];

// Step configuration with icons and colors
const steps = [
  { id: 1, icon: FaCamera, title: 'Photo', color: 'from-cyan-400 to-cyan-500', path: '/profile/photo' },
  { id: 2, icon: FaRegCommentDots, title: 'Bio', color: 'from-purple-400 to-purple-500', path: '/profile/bio' },
  { id: 3, icon: FaMoneyBillWave, title: 'Budget', color: 'from-indigo-400 to-indigo-500', path: '/profile/budget' },
  { id: 4, icon: FaUser, title: 'Details', color: 'from-pink-400 to-pink-500', path: '/profile/details' },
  { id: 5, icon: FaHome, title: 'Roommate', color: 'from-orange-400 to-orange-500', path: '/profile/roommate' },
];

// Navigation items for the top bar
const navItems = [
  { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FaSearch, label: 'Find', path: '/find' },
  { icon: FaBell, label: 'Notifications', path: '/notifications', badge: 3 },
  { icon: MdSettings, label: 'Settings', path: '/settings' },
  { icon: MdHelp, label: 'Help', path: '/help' },
];

// Navigation Bar Component - Simplified and more compact
const NavigationBar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: { 
  isMobileMenuOpen: boolean, 
  setIsMobileMenuOpen: (open: boolean) => void 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation - More compact */}
      <nav className="hidden md:flex items-center justify-between bg-white/95 backdrop-blur-xl shadow-sm rounded-xl px-4 py-2 mb-3 border border-white/20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <FaArrowLeft className="text-gray-600 text-sm" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Home"
          >
            <FaHome className="text-gray-600 text-sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <Icon className="text-base" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 p-[2px]"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <FaUser className="text-cyan-500 text-xs" />
          </div>
        </button>
      </nav>

      {/* Mobile Navigation - Simplified */}
      <div className="md:hidden w-full mb-2">
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-xl rounded-xl p-2 border border-white/20">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600 text-base" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaHome className="text-gray-600 text-base" />
            </button>
          </div>

          <span className="text-sm font-semibold text-cyan-600">Profile Setup</span>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes className="text-gray-600 text-lg" /> : <FaBars className="text-gray-600 text-lg" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute left-2 right-2 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-2 z-50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <Icon className="text-base" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [budget, setBudget] = useState('');
  const [distance, setDistance] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [roommate, setRoommate] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const totalSteps = 5;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = ev => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return bio.trim().length > 0;
      case 3:
        return budget && distance;
      case 4:
        return gender && year;
      case 5:
        return roommate;
      default:
        return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess('Profile completed!');
      setTimeout(() => navigate('/dashboard'), 1500);
    }, 1200);
  };

  const getStepStatus = (stepNum: number) => {
    if (stepNum < step) return 'completed';
    if (stepNum === step) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1124] via-[#1a1f35] to-[#0f172a] overflow-auto py-2 px-1 md:py-6 md:px-4 flex flex-col">
      {/* Background Effects - Simplified */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-cyan-400/20 rounded-full blur-[80px] md:w-[320px] md:h-[320px] md:blur-[100px]" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[160px] h-[160px] bg-purple-400/20 rounded-full blur-[60px] md:w-[260px] md:h-[260px] md:blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 w-[120px] h-[120px] bg-indigo-400/20 rounded-full blur-[50px] md:w-[180px] md:h-[180px] md:blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Main Content - Fully Visible and Centered */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col">
        {/* Navigation Bar */}
        <NavigationBar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />

        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2 md:p-6 w-full max-w-full md:max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Join thousands of students finding their perfect roommates
            </p>
          </div>

          {/* Quick Actions - Scrollable on mobile */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { icon: <MdDashboard className="text-cyan-500" />, label: 'Dashboard', path: '/dashboard' },
              { icon: <FaSearch className="text-purple-500" />, label: 'Find', path: '/find' },
              { icon: <MdSettings className="text-indigo-500" />, label: 'Settings', path: '/settings' }
            ].map(({ icon, label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs md:text-sm whitespace-nowrap transition-colors"
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Step Progress */}
          <div className="mb-4">
            {/* Step Circles - Desktop */}
            <div className="hidden sm:flex items-center justify-between mb-2">
              {steps.map((s, idx) => {
                const status = getStepStatus(s.id);
                const Icon = s.icon;
                const isCurrent = status === 'current';
                const isCompleted = status === 'completed';
                
                return (
                  <div key={s.id} className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                        transition-all duration-300 cursor-pointer shadow-sm
                        ${isCompleted ? `bg-gradient-to-r ${s.color} text-white` : ''}
                        ${isCurrent ? 'bg-white border-2 border-cyan-400 text-cyan-500' : ''}
                        ${status === 'upcoming' ? 'bg-gray-100 text-gray-400' : ''}
                      `}
                    >
                      {isCompleted ? <FaCheckCircle className="text-white text-sm" /> : <Icon className="text-base md:text-lg" />}
                    </button>
                    <span className={`
                      text-xs mt-1 font-medium
                      ${isCompleted ? 'text-cyan-600' : ''}
                      ${isCurrent ? 'text-cyan-500' : ''}
                      ${status === 'upcoming' ? 'text-gray-400' : ''}
                    `}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Step Indicator */}
            <div className="sm:hidden flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-cyan-600">
                Step {step} of {totalSteps}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 transition-all duration-500 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <SwitchTransition mode="out-in">
              <CSSTransition key={step} timeout={300} classNames="step-fade">
                <div className="min-h-[180px] md:min-h-[220px]">
                  {/* Step 1: Photo */}
                  {step === 1 && (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div 
                        className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center overflow-hidden border-3 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => fileInput.current?.click()}
                      >
                        {photo ? (
                          <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-cyan-400">
                            <FaCamera className="text-2xl md:text-3xl mb-1" />
                            <span className="text-[10px]">Upload</span>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" ref={fileInput} className="hidden" onChange={handlePhotoChange} />
                      <p className="text-xs text-gray-500 text-center mt-3 max-w-xs">
                        Upload a clear photo to help others recognize you
                      </p>
                    </div>
                  )}

                  {/* Step 2: Bio */}
                  {step === 2 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none min-h-[100px]"
                        maxLength={180}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        required
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${bio.length >= 180 ? 'text-red-500' : 'text-gray-400'}`}>
                          {bio.length}/180
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Budget & Distance */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaMoneyBillWave className="inline mr-1 text-green-500 text-sm" />
                          Monthly Budget (₹)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                          placeholder="e.g., 20000"
                          min={0}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaMapMarkerAlt className="inline mr-1 text-purple-500 text-sm" />
                          Max Distance (km)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          value={distance}
                          onChange={e => setDistance(e.target.value)}
                          placeholder="e.g., 5"
                          min={0}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Gender & Year */}
                  {step === 4 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaUser className="inline mr-1 text-pink-500 text-sm" />
                          Gender
                        </label>
                        <select
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select gender</option>
                          {genders.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaGraduationCap className="inline mr-1 text-indigo-500 text-sm" />
                          Academic Year
                        </label>
                        <select
                          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          value={year}
                          onChange={e => setYear(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select year</option>
                          {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Roommate Preference */}
                  {step === 5 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaHome className="inline mr-1 text-orange-500 text-sm" />
                        Roommate Preference
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        value={roommate}
                        onChange={e => setRoommate(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select preference</option>
                        {roommatePrefs.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        This helps us match you with compatible roommates
                      </p>
                    </div>
                  )}
                </div>
              </CSSTransition>
            </SwitchTransition>

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-2 gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <FaChevronLeft className="text-xs" />
                  Back
                </button>
              ) : <div />}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep()}
                  className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !validateStep()}
                  className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Complete'}
                </button>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-2 bg-green-100 text-green-700 rounded-lg text-xs text-center animate-fade-in">
                {success} 🎉
              </div>
            )}
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Your information is secure and will only be used for matching
        </p>
      </div>
    </div>
  );
}

export default ProfileSetup;