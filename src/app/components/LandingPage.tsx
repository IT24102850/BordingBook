import React from 'react';
import { Typewriter } from './ui/Typewriter';
import { AuthDropdown } from './AuthDropdown';
import { BoardingSlideshow } from './ui/BoardingSlideshow';
import { Menu, X, Home, Search, Users, Building, Settings, User, LogIn } from 'lucide-react';

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  // Helper to get current hash for active nav
  const [activeHash, setActiveHash] = React.useState(window.location.hash || '#home');
  
  React.useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || '#home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Close mobile menu when clicking a link
  const handleMobileLinkClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181f36] w-full max-w-full overflow-x-hidden">
      {/* Global Styles */}
      <style>{`
        html, body {
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #181f36;
        }
        
        /* Mobile styles (all screens below 768px) */
        @media (max-width: 768px) {
          /* Navbar */
          .navbar {
            height: 60px !important;
            min-height: 60px !important;
            padding: 0 16px !important;
            background: #232b47 !important;
            border-bottom: 2px solid rgba(129, 140, 248, 0.2) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 10000 !important;
          }
          
          .navbar-logo {
            font-size: 1.6rem !important;
          }
          
          /* Hide desktop elements on mobile */
          .desktop-nav {
            display: none !important;
          }
          
          .desktop-profile {
            display: none !important;
          }
          
          /* Show mobile nav */
          .mobile-nav {
            display: flex !important;
          }
          
          /* Hamburger button */
          .hamburger-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 44px !important;
            height: 44px !important;
            background: rgba(129, 140, 248, 0.15) !important;
            border: 1px solid rgba(129, 140, 248, 0.3) !important;
            border-radius: 12px !important;
            color: #a5b4fc !important;
            transition: all 0.2s;
            cursor: pointer;
          }
          
          .hamburger-btn:hover {
            background: rgba(129, 140, 248, 0.25) !important;
          }
          
          .hamburger-btn svg {
            width: 24px;
            height: 24px;
          }
          
          /* Mobile Menu Overlay */
          .mobile-menu-overlay {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            z-index: 9999;
            animation: fadeIn 0.2s ease;
          }
          
          .mobile-menu-drawer {
            position: fixed;
            top: 60px;
            left: 0;
            width: 85%;
            max-width: 320px;
            height: calc(100vh - 60px);
            background: #1e2436;
            border-right: 1px solid rgba(129, 140, 248, 0.2);
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            overflow-y: auto;
          }
          
          .mobile-menu-header {
            padding: 24px 20px;
            border-bottom: 1px solid rgba(129, 140, 248, 0.2);
            background: #232b47;
          }
          
          .mobile-menu-user {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .mobile-menu-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #818cf8, #22d3ee);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.4rem;
            box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
          }
          
          .mobile-menu-user-info h4 {
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .mobile-menu-user-info p {
            color: #94a3b8;
            font-size: 0.9rem;
          }
          
          .mobile-menu-items {
            padding: 20px 16px;
          }
          
          .mobile-menu-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 20px;
            color: #e2e8f0;
            font-size: 1.1rem;
            font-weight: 500;
            border-radius: 16px;
            margin-bottom: 8px;
            transition: all 0.2s;
            cursor: pointer;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.02);
          }
          
          .mobile-menu-item:hover {
            background: rgba(129, 140, 248, 0.15);
          }
          
          .mobile-menu-item.active {
            background: linear-gradient(135deg, #818cf8, #22d3ee);
            color: white;
            box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
          }
          
          .mobile-menu-item svg {
            width: 22px;
            height: 22px;
            color: #a5b4fc;
          }
          
          .mobile-menu-item.active svg {
            color: white;
          }
          
          .mobile-menu-divider {
            height: 1px;
            background: rgba(129, 140, 248, 0.15);
            margin: 20px 0;
          }
          
          .mobile-menu-cta {
            background: linear-gradient(135deg, #818cf8, #22d3ee);
            color: white !important;
            margin-top: 20px;
            text-align: center;
            font-weight: 600;
            justify-content: center;
            border: none;
            box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
          }
          
          .mobile-menu-cta svg {
            color: white !important;
          }
          
          /* Main content container for mobile */
          .mobile-container {
            padding: 0 16px !important;
            width: 100% !important;
            margin-top: 80px !important;
            margin-bottom: 40px !important;
          }
          
          /* Hero section */
          .hero-section {
            width: 100% !important;
            margin-bottom: 32px !important;
          }
          
          .hero-card {
            padding: 28px 20px !important;
            border-radius: 28px !important;
            background: rgba(35, 43, 71, 0.9) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(129, 140, 248, 0.2) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
            width: 100% !important;
          }
          
          .tag-pill {
            font-size: 0.85rem !important;
            padding: 8px 16px !important;
            background: rgba(34, 211, 238, 0.15) !important;
            border-radius: 40px !important;
            display: inline-block !important;
            margin-bottom: 20px !important;
            color: #22d3ee !important;
            font-weight: 600 !important;
            letter-spacing: 0.5px !important;
            border: 1px solid rgba(34, 211, 238, 0.3) !important;
          }
          
          h1 {
            font-size: 2.2rem !important;
            line-height: 1.2 !important;
            margin-bottom: 24px !important;
            background: linear-gradient(135deg, #818cf8, #22d3ee) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            font-weight: 800 !important;
            letter-spacing: -0.5px !important;
          }
          
          /* CTA Buttons */
          .hero-cta-row {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
            margin: 28px 0 24px 0;
          }
          
          .hero-cta-btn {
            width: 100%;
            padding: 18px !important;
            border-radius: 18px !important;
            font-size: 1.1rem !important;
            font-weight: 700 !important;
            text-align: center;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }
          
          .hero-cta-btn-primary {
            background: linear-gradient(135deg, #818cf8, #22d3ee) !important;
            color: white !important;
            box-shadow: 0 8px 20px rgba(129, 140, 248, 0.3) !important;
          }
          
          .hero-cta-btn-primary:active {
            transform: scale(0.98);
          }
          
          .hero-cta-btn-secondary {
            background: transparent !important;
            color: #a5b4fc !important;
            border: 2px solid rgba(129, 140, 248, 0.3) !important;
          }
          
          .hero-cta-btn-secondary:active {
            background: rgba(129, 140, 248, 0.1);
          }
          
          /* Benefits Row */
          .hero-benefits-row {
            display: flex !important;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin: 24px 0 20px 0;
          }
          
          .hero-benefit {
            background: rgba(129, 140, 248, 0.12) !important;
            color: #a5b4fc !important;
            padding: 10px 18px !important;
            border-radius: 40px !important;
            font-size: 0.95rem !important;
            font-weight: 600 !important;
            border: 1px solid rgba(129, 140, 248, 0.2) !important;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(4px);
          }
          
          .hero-benefit::before {
            content: "✓";
            color: #22d3ee;
            font-weight: bold;
            font-size: 1.1rem;
          }
          
          /* Hero Description */
          .hero-description {
            color: #94a3b8 !important;
            font-size: 1rem !important;
            text-align: center;
            margin: 20px 0 8px 0 !important;
            line-height: 1.5 !important;
            max-width: 90% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          /* Mobile Hero Image */
          .hero-image-mobile {
            display: block !important;
            width: 100%;
            height: 220px !important;
            object-fit: cover !important;
            border-radius: 28px !important;
            margin: 24px 0 32px 0 !important;
            border: 2px solid rgba(129, 140, 248, 0.2) !important;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3) !important;
          }
          
          /* Features Grid */
          .features-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 !important;
            margin: 40px 0 !important;
            width: 100% !important;
          }
          
          .feature-card {
            padding: 24px !important;
            border-radius: 24px !important;
            background: rgba(35, 43, 71, 0.8) !important;
            border: 1px solid rgba(129, 140, 248, 0.15) !important;
            backdrop-filter: blur(10px);
            min-height: auto !important;
            transition: transform 0.2s;
            width: 100% !important;
          }
          
          .feature-card:active {
            transform: scale(0.98);
          }
          
          .feature-card h3 {
            font-size: 1.3rem !important;
            color: white !important;
            margin-bottom: 10px !important;
            font-weight: 700 !important;
            background: linear-gradient(135deg, #818cf8, #22d3ee) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            display: inline-block !important;
          }
          
          .feature-card p {
            color: #cbd5e1 !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
            display: block !important;
            -webkit-line-clamp: unset !important;
            max-height: none !important;
            margin: 0 !important;
          }
          
          /* Contact Section */
          .contact-section {
            margin: 40px 0 20px !important;
            padding: 40px 24px !important;
            border-radius: 32px !important;
            background: rgba(35, 43, 71, 0.9) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            width: 100% !important;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
          }
          
          .contact-section h2 {
            font-size: 2rem !important;
            color: white !important;
            margin-bottom: 16px !important;
            font-weight: 700 !important;
            text-align: center !important;
          }
          
          .contact-section p {
            color: #cbd5e1 !important;
            font-size: 1.1rem !important;
            margin-bottom: 32px !important;
            line-height: 1.6 !important;
            text-align: center !important;
            max-width: 90% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .contact-section a {
            display: inline-block;
            padding: 18px 40px !important;
            background: linear-gradient(135deg, #818cf8, #22d3ee) !important;
            color: white !important;
            border-radius: 40px !important;
            font-weight: 700 !important;
            font-size: 1.2rem !important;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(129, 140, 248, 0.3) !important;
            width: 100% !important;
            text-align: center !important;
            border: none !important;
          }
          
          .contact-section a:active {
            transform: scale(0.98);
          }
          
          /* Hide desktop elements on mobile */
          .hero-image-desktop {
            display: none !important;
          }
          
          .hero-stats-row {
            display: none !important;
          }
          
          .desktop-features-grid {
            display: none !important;
          }
        }
        
        /* Desktop styles - EXACTLY AS ORIGINAL */
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
          
          .hamburger-btn {
            display: none !important;
          }
          
          .mobile-menu-overlay {
            display: none !important;
          }
          
          .hero-image-mobile {
            display: none !important;
          }
          
          .hero-cta-row {
            display: none !important;
          }
          
          .hero-benefits-row {
            display: none !important;
          }
          
          .contact-section {
            display: none !important;
          }
          
          .features-grid {
            display: none !important;
          }
          
          /* Restore original desktop layout */
          .desktop-nav {
            display: flex !important;
          }
          
          .desktop-profile {
            display: flex !important;
          }
          
          .hero-stats-row {
            display: flex !important;
          }
          
          .hero-image-desktop {
            display: flex !important;
          }
          
          .desktop-features-grid {
            display: grid !important;
          }
          
          .original-contact-section {
            display: flex !important;
          }
        }
        
        /* Original desktop navbar styles */
        .nav-link-active {
          background: linear-gradient(90deg, #818cf8 0%, #a5b4fc 100%);
          color: #232b47 !important;
          font-weight: bold;
          box-shadow: 0 2px 12px 0 rgba(129,140,248,0.18);
        }
        
        .nav-link {
          transition: background 0.2s, color 0.2s;
        }
        
        .profile-icon {
          width: 44px !important;
          height: 44px !important;
        }
        
        .profile-icon:hover {
          box-shadow: 0 0 0 2px #818cf8;
        }
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up {
          animation: fade-up 0.7s cubic-bezier(.4,0,.2,1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Navbar */}
      <nav
        className="w-full fixed top-0 left-0 flex items-center justify-between h-12 md:h-13 px-4 md:px-16 bg-[#232b47] backdrop-blur-xl border-b-2 border-zinc-700/15 shadow-xl z-[10000] transition-all duration-300 navbar"
        style={{height: '52px',minHeight: '52px',borderBottomWidth: '2px',borderBottomColor: 'rgba(113,113,122,0.15)',borderImage: 'linear-gradient(to right, rgba(99,102,241,.18), rgba(34,211,238,.18)) 1',borderBottomStyle: 'solid'}}>
        
        {/* Logo */}
        <div className="flex items-center gap-1 md:gap-2 min-w-max h-full">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-100 drop-shadow-lg select-none flex items-center h-full navbar-logo">Boarding<span className="text-indigo-300">Book</span></span>
        </div>

        {/* Desktop Nav - perfectly centered, improved labels and CTAs */}
        <div className="desktop-nav hidden md:flex flex-1 justify-center">
          <div className="flex gap-6 items-center bg-zinc-800/60 px-6 py-2 rounded-full shadow border border-zinc-700/40">
            <a href="#home" className={`text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition nav-link${activeHash==='#home'?' nav-link-active':''}`}>Home</a>
            <a href="#features" className={`text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition nav-link${activeHash==='#features'?' nav-link-active':''}`}>Find Rooms</a>
            <a href="#roommate" className={`text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition nav-link${activeHash==='#roommate'?' nav-link-active':''}`}>Roommate Finder</a>
            {/* Owner dropdown */}
            <div className="relative group">
              <button className={`text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition nav-link${activeHash==='#owner'?' nav-link-active':''}`}>List Your Property</button>
              <div className="absolute left-0 mt-2 min-w-[180px] bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <a href="#owner" className="block px-4 py-2 text-zinc-200 hover:bg-zinc-700/40 rounded-xl transition">For Owners (Info)</a>
              </div>
            </div>
            <a
              href="#features"
              className="px-4 py-2 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 border border-indigo-400 nav-link-cta"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Find Rooms
            </a>
          </div>
        </div>

        {/* Desktop Profile */}
        <div className="desktop-profile hidden md:flex items-center min-w-max ml-6 profile-area">
          <span className="text-zinc-200 text-sm font-medium mr-2">Profile</span>
          <div className="profile-icon relative group" tabIndex={0} style={{display:'flex',alignItems:'center',justifyContent:'center'}} title="Account">
            <AuthDropdown />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-100 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">Account</span>
          </div>
        </div>

        {/* Hamburger Button - Mobile Only */}
        <div className="mobile-nav hidden">
          <button 
            className="hamburger-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileNavOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileNavOpen(false)}>
          <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
            {/* Mobile Menu Header */}
            <div className="mobile-menu-header">
              <div className="mobile-menu-user">
                <div className="mobile-menu-avatar">
                  👤
                </div>
                <div className="mobile-menu-user-info">
                  <h4>Guest User</h4>
                  <p>Sign in to access your account</p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="mobile-menu-items">
              <a 
                href="#home" 
                className={`mobile-menu-item ${activeHash === '#home' ? 'active' : ''}`}
                onClick={handleMobileLinkClick}
              >
                <Home size={22} />
                Home
              </a>
              
              <a 
                href="#features" 
                className={`mobile-menu-item ${activeHash === '#features' ? 'active' : ''}`}
                onClick={handleMobileLinkClick}
              >
                <Search size={22} />
                Find Rooms
              </a>
              
              <a 
                href="#roommate" 
                className={`mobile-menu-item ${activeHash === '#roommate' ? 'active' : ''}`}
                onClick={handleMobileLinkClick}
              >
                <Users size={22} />
                Roommate Finder
              </a>
              
              <a 
                href="#owner" 
                className={`mobile-menu-item ${activeHash === '#owner' ? 'active' : ''}`}
                onClick={handleMobileLinkClick}
              >
                <Building size={22} />
                List Your Property
              </a>
              
              <div className="mobile-menu-divider"></div>
              
              <a 
                href="#profile" 
                className="mobile-menu-item"
                onClick={handleMobileLinkClick}
              >
                <User size={22} />
                Profile
              </a>
              
              <a 
                href="#settings" 
                className="mobile-menu-item"
                onClick={handleMobileLinkClick}
              >
                <Settings size={22} />
                Settings
              </a>
              
              <a 
                href="#login" 
                className="mobile-menu-item"
                onClick={handleMobileLinkClick}
              >
                <LogIn size={22} />
                Sign In
              </a>
              
              <div className="mobile-menu-divider"></div>
              
              <a 
                href="#features" 
                className="mobile-menu-item mobile-menu-cta"
                onClick={handleMobileLinkClick}
              >
                <Search size={22} />
                Find Rooms Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content - Only visible on mobile */}
      <div className="mobile-container w-full max-w-6xl mx-auto px-4 md:px-0 pt-24 md:pt-28">
        {/* Mobile Hero Section */}
        <div className="hero-section animate-fade-up">
          <div className="hero-card">
            <span className="tag-pill">✨ All-in-One Student Boarding Platform</span>
            <h1>Find Verified Rooms Near Your Campus</h1>
            
            {/* Mobile CTAs */}
            <div className="hero-cta-row">
              <button className="hero-cta-btn hero-cta-btn-primary">Find Verified Rooms Near Me</button>
              <button className="hero-cta-btn hero-cta-btn-secondary">I'm a Property Owner</button>
            </div>

            {/* Mobile Benefits */}
            <div className="hero-benefits-row">
              <span className="hero-benefit">No Scams</span>
              <span className="hero-benefit">Verified</span>
              <span className="hero-benefit">Near Campus</span>
            </div>

            <div className="hero-description">
              Only verified student housing. Find your place before the semester starts.
            </div>
          </div>

          {/* Mobile Hero Image */}
          <img 
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Student housing" 
            className="hero-image-mobile"
          />
        </div>

        {/* Mobile Features Grid */}
        <section id="features" className="features-grid w-full">
          <FeatureCard title="Find Verified Rooms Fast" desc="Browse and book student rooms near your campus in seconds. Only verified listings with photos and details." />
          <FeatureCard title="Pay Rent Securely" desc="No cash, no awkward transfers. Pay rent and deposits online with full security and transaction tracking." />
          <FeatureCard title="Roommate Matchmaking" desc="Match with roommates who fit your lifestyle and preferences. Answer a few questions and find your perfect match." />
          <FeatureCard title="Digital Agreements" desc="Sign rental agreements online. Track your booking status and documents easily in one place." />
          <FeatureCard title="Owner Tools" desc="List your property, manage tenants, and collect payments—all in one place with powerful analytics." />
        </section>

        {/* Mobile Contact Section */}
        <section id="contact" className="contact-section">
          <h2>Contact & Support</h2>
          <p>
            Have questions or need help? Reach out to our support team for assistance with your boarding experience.
          </p>
          <a href="mailto:support@boardingbookingsystem.com">Email Support</a>
        </section>
      </div>

      {/* ORIGINAL DESKTOP CONTENT - EXACTLY AS IT WAS */}
      <main className="hidden md:flex flex-col md:flex-row items-center gap-8 pt-32 md:pt-28 w-full max-w-6xl overflow-visible px-0 md:px-0">
        {/* Left: Hero content */}
        <div className="flex-1 min-w-[320px] animate-fade-up">
          <div className="surface-card p-7 md:p-8 mb-6 shadow-luxe hero-card">
            <span className="tag-pill mb-3 inline-block bg-cyan-900/20 text-cyan-200 text-base font-semibold">All-in-One Student Boarding Platform</span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3 leading-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              Find Verified Rooms Near Your Campus
            </h1>
            {/* Desktop Stats Section */}
            <div className="flex flex-wrap gap-4 justify-center items-center my-6 hero-stats-row">
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
                <span className="text-2xl font-extrabold text-cyan-300">6+</span>
                <span className="muted text-xs mt-1">Core Modules</span>
              </div>
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
                <span className="text-2xl font-extrabold text-cyan-300">1000+</span>
                <span className="muted text-xs mt-1">Students Served</span>
              </div>
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
                <span className="text-2xl font-extrabold text-cyan-300">24/7</span>
                <span className="muted text-xs mt-1">Support</span>
              </div>
            </div>
            <div className="mt-5 text-zinc-400 text-sm">Only verified student housing. Find your place before the semester starts.</div>
          </div>
        </div>
        {/* Right: Desktop Hero image */}
        <div className="flex-1 flex flex-col items-center relative max-w-xl hero-image-desktop">
          <div className="surface-glass shadow-luxe p-2 rounded-3xl relative scale-90 md:scale-95">
            <BoardingSlideshow />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 px-6 py-2 rounded-full shadow-lift text-indigo-900 font-semibold text-sm mt-4">
              Trusted by 1000+ Students
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
            <div className="surface-card flex items-center gap-3 p-3 shadow-lift">
              <span className="tag-pill bg-green-500/20 text-green-300">Verified</span>
              <span className="muted text-xs">University Only</span>
            </div>
            <div className="surface-card flex items-center gap-3 p-3 shadow-lift">
              <span className="tag-pill bg-cyan-500/20 text-cyan-300">Secure</span>
              <span className="muted text-xs">Payments & Agreements</span>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Features Section */}
      <section id="features" className="hidden md:grid w-full max-w-6xl mx-auto grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mb-20 mt-16 z-10 desktop-features-grid">
        <FeatureCardDesktop title="Find Verified Rooms Fast" desc="Browse and book student rooms near your campus in seconds. Only verified listings." />
        <FeatureCardDesktop title="Pay Rent Securely" desc="No cash, no awkward transfers. Pay rent and deposits online with full security." />
        <FeatureCardDesktop title="Roommate Matchmaking" desc="Match with roommates who fit your lifestyle and preferences. No more random pairings." />
        <FeatureCardDesktop title="Digital Agreements" desc="Sign rental agreements online. Track your booking status and documents easily." />
        <FeatureCardDesktop title="Owner Tools" desc="List your property, manage tenants, and collect payments—all in one place." />
      </section>

      {/* Desktop Contact Section */}
      <section id="contact" className="hidden md:flex surface-glass border border-white/10 py-12 px-4 md:px-0 flex-col items-center rounded-3xl shadow-lift mb-12 w-full max-w-2xl backdrop-blur-xl original-contact-section">
        <h2 className="text-2xl xs:text-3xl font-bold text-white mb-4 drop-shadow-lg">Contact & Support</h2>
        <p className="text-zinc-200 mb-8 text-center max-w-xl text-base xs:text-lg drop-shadow">
          Have questions or need help? <br className="hidden md:block" />Reach out to our support team for assistance with your boarding experience.
        </p>
        <a href="mailto:support@boardingbookingsystem.com" className="cta-primary px-6 py-2 text-lg font-bold shadow-lift bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white">Email Support</a>
      </section>
    </div>
  );
}

// Desktop Feature Card (original)
function FeatureCardDesktop({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="surface-card rounded-2xl p-6 flex flex-col items-center shadow-xl border border-indigo-200 min-h-[180px] hover:scale-105 hover:shadow-2xl transition feature-card">
      <h3 className="font-bold text-lg text-white mb-1 text-center drop-shadow-lg">{title}</h3>
      <p className="text-zinc-200 text-center text-sm drop-shadow">{desc}</p>
    </div>
  );
}

// Mobile Feature Card
function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}