import React from 'react';
import { Typewriter } from './ui/Typewriter';
import { AuthDropdown } from './AuthDropdown';
import { BoardingSlideshow } from './ui/BoardingSlideshow';
import { Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181f36] px-4 overflow-visible w-full max-w-full">
      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 flex items-center justify-between h-14 px-4 md:px-16 bg-[#232b47] backdrop-blur-xl border-b border-zinc-700/30 shadow-xl z-[10000] transition-all duration-300 navbar">
        {/* Logo and mobile nav button */}
        <div className="flex items-center gap-1 md:gap-2 min-w-max h-full">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-100 drop-shadow-lg select-none flex items-center h-full">Boarding<span className="text-indigo-300">Book</span></span>
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 ml-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 shadow-lg nav-icon"
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X className="w-7 h-7 text-indigo-300" /> : <Menu className="w-7 h-7 text-indigo-300" />}
          </button>
        </div>
        {/* Desktop Nav - perfectly centered, improved labels and CTAs */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex gap-6 items-center bg-zinc-800/60 px-6 py-2 rounded-full shadow border border-zinc-700/40">
            <a href="#home" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Home</a>
            <a href="#features" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Find Rooms</a>
            <a href="#owner" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">List Your Property</a>
            <a href="#roommate" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Roommate Finder</a>
            <a
              href="#get-started"
              className="px-4 py-2 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 border border-indigo-400"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Get Started
            </a>
          </div>
        </div>
        {/* Auth Dropdown - right aligned, with label */}
        <div className="hidden md:flex items-center min-w-max ml-6">
          <span className="text-zinc-200 text-sm font-medium mr-2">Profile</span>
          <AuthDropdown />
        </div>
      </nav>
      {/* Hero */}
      <main className="flex flex-col md:flex-row items-center gap-8 pt-32 md:pt-28 w-full max-w-6xl overflow-visible px-0 md:px-0">
        {/* Left: Hero content */}
        <div className="flex-1 min-w-[320px] animate-fade-up">
          <div className="surface-card p-7 md:p-8 mb-6 shadow-luxe">
            <span className="tag-pill mb-3 inline-block bg-cyan-900/20 text-cyan-200 text-base font-semibold">All-in-One Student Boarding Platform</span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3 leading-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              Find Verified Rooms Near Your Campus
            </h1>
            <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
              <span className="text-2xl font-extrabold text-cyan-300">6+</span>
              <span className="muted text-xs mt-1">Core Modules</span>
            </div>
            <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
              <span className="text-2xl font-extrabold text-cyan-300">1000+</span>
              <span className="muted text-xs mt-1">Students Served</span>
            </div>
            <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-32">
              return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#181f36] px-4 overflow-visible w-full max-w-full">
                  {/* Navbar */}
                  <nav className="w-full fixed top-0 left-0 flex items-center justify-between h-14 px-4 md:px-16 bg-[#232b47] backdrop-blur-xl border-b border-zinc-700/30 shadow-xl z-[10000] transition-all duration-300 navbar">
                    {/* Logo and mobile nav button */}
                    <div className="flex items-center gap-1 md:gap-2 min-w-max h-full">
                      <span className="text-3xl font-extrabold tracking-tight text-zinc-100 drop-shadow-lg select-none flex items-center h-full">Boarding<span className="text-indigo-300">Book</span></span>
                      <button
                        className="md:hidden flex items-center justify-center w-10 h-10 ml-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 shadow-lg nav-icon"
                        onClick={() => setMobileNavOpen(v => !v)}
                        aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                      >
                        {mobileNavOpen ? <X className="w-7 h-7 text-indigo-300" /> : <Menu className="w-7 h-7 text-indigo-300" />}
                      </button>
                    </div>
                    {/* Desktop Nav - perfectly centered, improved labels and CTAs */}
                    <div className="hidden md:flex flex-1 justify-center">
                      <div className="flex gap-6 items-center bg-zinc-800/60 px-6 py-2 rounded-full shadow border border-zinc-700/40">
                        <a href="#home" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Home</a>
                        <a href="#features" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Find Rooms</a>
                        <a href="#owner" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">List Your Property</a>
                        <a href="#roommate" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Roommate Finder</a>
                        <a
                          href="#get-started"
                          className="px-4 py-2 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 border border-indigo-400"
                          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                        >
                          Get Started
                        </a>
                      </div>
                    </div>
                    {/* Auth Dropdown - right aligned, with label */}
                    <div className="hidden md:flex items-center min-w-max ml-6">
                      <span className="text-zinc-200 text-sm font-medium mr-2">Profile</span>
                      <AuthDropdown />
                    </div>
                  </nav>
                  {/* Hero */}
                  <main className="flex flex-col md:flex-row items-center gap-8 pt-32 md:pt-28 w-full max-w-6xl overflow-visible px-0 md:px-0">
                    {/* Left: Hero content */}
                    <div className="flex-1 min-w-[320px] animate-fade-up">
                      <div className="surface-card p-7 md:p-8 mb-6 shadow-luxe">
                        <span className="tag-pill mb-3 inline-block bg-cyan-900/20 text-cyan-200 text-base font-semibold">All-in-One Student Boarding Platform</span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-3 leading-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                          Find Verified Rooms Near Your Campus
                        </h1>
                        <p className="text-zinc-300 text-lg md:text-xl mb-4">Book verified student rooms in minutes. No scams. No agents. No stress.</p>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                          <a href="#features" className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white font-bold shadow-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 hover:scale-[1.02] transition">Find Rooms Near Me</a>
                          <a href="#owner" className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold border border-cyan-300 text-cyan-200 hover:bg-cyan-300/10 transition">I’m a Property Owner</a>
                        </div>
                        <div className="flex gap-4 justify-center mb-6">
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
                    {/* Right: Hero image, smaller and less empty space */}
                    <div className="flex-1 flex flex-col items-center relative max-w-xl">
                      <div className="surface-glass shadow-luxe p-2 rounded-3xl relative scale-90 md:scale-95">
                        <BoardingSlideshow />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full shadow-lift text-indigo-900 font-semibold text-sm mb-4 border border-indigo-100">Trusted by 1000+ Students</div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 px-6 py-2 rounded-full shadow-lift text-indigo-900 font-semibold text-sm mt-4 opacity-90">Safe, Secure, Verified</div>
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
                  {/* Features Section */}
                  <section id="features" className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mb-20 mt-16 z-10">
                    <FeatureCard title="Find Verified Rooms Fast" desc="Browse and book student rooms near your campus in seconds. Only verified listings." />
                    <FeatureCard title="Pay Rent Securely" desc="No cash, no awkward transfers. Pay rent and deposits online with full security." />
                    <FeatureCard title="Roommate Matchmaking" desc="Match with roommates who fit your lifestyle and preferences. No more random pairings." />
                    <FeatureCard title="Digital Agreements" desc="Sign rental agreements online. Track your booking status and documents easily." />
                    <FeatureCard title="Owner Tools" desc="List your property, manage tenants, and collect payments—all in one place." />
                  </section>
                  {/* Testimonial Section */}
                  <section className="w-full max-w-3xl mx-auto my-10 px-4">
                    <div className="bg-zinc-800/80 rounded-2xl p-8 shadow-xl flex flex-col items-center">
                      <blockquote className="text-lg md:text-xl text-zinc-200 italic text-center mb-4">“BoardingBook made finding a safe, affordable room near my university effortless. The process was smooth, and I felt supported every step of the way.”</blockquote>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold">A</span>
                        <span className="text-zinc-300 font-medium">Aarav S., Student</span>
                      </div>
                    </div>
                  </section>
                  {/* Contact Section */}
                  <section id="contact" className="surface-glass border border-white/10 py-12 px-4 md:px-0 flex flex-col items-center rounded-3xl shadow-lift mb-12 w-full max-w-2xl backdrop-blur-xl">
                    <h2 className="text-2xl xs:text-3xl font-bold text-white mb-4 drop-shadow-lg">Contact & Support</h2>
                    <p className="text-zinc-200 mb-8 text-center max-w-xl text-base xs:text-lg drop-shadow">
                      Have questions or need help? <br className="hidden md:block" />Reach out to our support team for assistance with your boarding experience.
                    </p>
                    <a href="mailto:support@boardingbookingsystem.com" className="cta-primary px-6 py-2 text-lg font-bold shadow-lift">Email Support</a>
                  </section>
                  {/* Global and Mobile Styles */}
                  <style>{`
                    html, body {
                      overflow-x: hidden;
                      width: 100%;
                    }
                    @keyframes fade-up {
                      0% { opacity: 0; transform: translateY(24px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-up {
                      animation: fade-up 0.7s cubic-bezier(.4,0,.2,1);
                    }
                    .hover\:shadow-cyan-400\/40:hover {
                      box-shadow: 0 0 16px 0 rgba(34,211,238,0.4), 0 8px 32px 0 rgba(31,38,135,0.17);
                    }
                    @media (max-width: 768px) {
                      html, body {
                        overflow-x: hidden;
                        width: 100vw;
                      }
                      .navbar {
                        height: 56px !important;
                        min-height: 56px !important;
                        padding-left: 0.75rem !important;
                        padding-right: 0.75rem !important;
                      }
                      body { padding-top: 56px !important; padding-bottom: 80px !important; }
                      .nav-icon, .profile-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px !important;
                        height: 40px !important;
                        padding: 0 !important;
                      }
                      .hero, .surface-card, .surface-glass {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                        max-width: 100vw !important;
                        width: 100% !important;
                        overflow: visible !important;
                      }
                      .hero-image {
                        height: 180px !important;
                        max-width: 100vw !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                      }
                      h1 {
                        font-size: 2.1rem !important;
                        line-height: 1.15 !important;
                        word-break: break-word;
                      }
                      .stats-row, .image-badge {
                        display: none !important;
                      }
                      .feature-card {
                        padding: 14px !important;
                        font-size: 0.9rem !important;
                        max-width: 100vw !important;
                      }
                      .feature-card p {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      }
                      .floating-chat, .floating-btn, .floating-icon {
                        position: fixed !important;
                        bottom: 16px !important;
                        right: 16px !important;
                        z-index: 50 !important;
                      }
                    }
                  `}</style>
                </div>
              );
