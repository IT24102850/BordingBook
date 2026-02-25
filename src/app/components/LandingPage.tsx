import React from 'react';
import { Typewriter } from './ui/Typewriter';
import { AuthDropdown } from './AuthDropdown';
import { BoardingSlideshow } from './ui/BoardingSlideshow';
import { Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181f36] px-4 overflow-visible">
      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 flex justify-between items-center py-4 px-4 md:px-16 bg-[#232b47] backdrop-blur-xl border-b border-zinc-700/30 shadow-xl z-[10000] transition-all duration-300">
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-100 drop-shadow-lg select-none">
            Boarding<span className="text-indigo-300">Book</span>
          </span>
          {/* Mobile Nav Button - now immediately next to logo */}
          <button
            className="md:hidden p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 shadow-lg"
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X className="w-7 h-7 text-indigo-300" /> : <Menu className="w-7 h-7 text-indigo-300" />}
          </button>
          {/* Desktop Nav - Moved closer to logo */}
          <div className="hidden md:flex gap-4 items-center ml-2">
            <a href="#home" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Home</a>
            <a href="#features" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Explore</a>
            <a href="#owner" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Owner Portal</a>
            <a href="#roommate" className="text-zinc-200 font-semibold text-sm px-2 py-1.5 rounded-xl hover:bg-zinc-700/30 transition">Roommate Finder</a>
            <a
              href="#contact"
              className="px-2 py-1.5 rounded-xl text-indigo-300 font-semibold text-sm shadow hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 border border-zinc-600 bg-zinc-900"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Contact
            </a>
            <AuthDropdown />
          </div>
        </div>
        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="absolute top-full left-0 w-full px-0 z-[9999] animate-fade-in">
            <div className="bg-zinc-900 backdrop-blur-xl rounded-b-2xl shadow-xl border-x border-b border-zinc-700 flex flex-col items-stretch py-4 px-0 min-h-[320px] max-h-[80vh] overflow-y-auto">
              <nav className="flex flex-col gap-4 px-4">
                <a href="#home" className="w-full text-center py-3 text-lg font-semibold text-zinc-100 rounded-xl hover:bg-zinc-700/30 hover:text-white shadow-sm transition-all duration-200 border border-transparent hover:border-zinc-300/40">Home</a>
                <a href="#features" className="w-full text-center py-3 text-lg font-semibold text-zinc-100 rounded-xl hover:bg-zinc-700/30 hover:text-white shadow-sm transition-all duration-200 border border-transparent hover:border-zinc-300/40">Explore</a>
                <a href="#owner" className="w-full text-center py-3 text-lg font-semibold text-zinc-100 rounded-xl hover:bg-zinc-700/30 hover:text-white shadow-sm transition-all duration-200 border border-transparent hover:border-zinc-300/40">Owner Portal</a>
                <a href="#roommate" className="w-full text-center py-3 text-lg font-semibold text-zinc-100 rounded-xl hover:bg-zinc-700/30 hover:text-white shadow-sm transition-all duration-200 border border-transparent hover:border-zinc-300/40">Roommate Finder</a>
                <div className="my-2 border-t border-zinc-800/60"></div>
                <a
                  href="#contact"
                  className="w-full text-center py-3 text-lg font-semibold text-indigo-300 rounded-xl shadow hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 border border-zinc-600 bg-zinc-900"
                  style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                >
                  Contact
                </a>
              </nav>
              <div className="w-full flex justify-center mt-6"><AuthDropdown /></div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero */}
      <main className="flex flex-col md:flex-row items-center gap-12 pt-32 md:pt-28 w-full max-w-6xl">
        <div className="flex-1">
          <div className="surface-card p-10 mb-6 shadow-luxe">
            <span className="tag-pill mb-4 inline-block bg-cyan-900/20 text-cyan-200">SLIIT EXCLUSIVE · STUDENT PLATFORM</span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              <Typewriter
                words={["Find Your Perfect Boarding", "Discover, Book, and Settle In", "Student Housing Made Simple"]}
                speed={60}
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
              />
            </h1>
            <p className="muted text-lg mb-8">University-exclusive platform for students and boarding owners. Discover, book, pay, and manage boarding houses with ease and trust.</p>
            <a href="#features" className="cta-primary px-8 py-4 text-lg font-bold">Start Exploring</a>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-40">
                <span className="text-3xl font-extrabold text-cyan-300">6+</span>
                <span className="muted text-xs mt-1">Core Modules</span>
              </div>
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-40">
                <span className="text-3xl font-extrabold text-cyan-300">1000+</span>
                <span className="muted text-xs mt-1">Students Served</span>
              </div>
              <div className="surface-subtle p-4 rounded-2xl flex flex-col items-center shadow-lift w-40">
                <span className="text-3xl font-extrabold text-cyan-300">24/7</span>
                <span className="muted text-xs mt-1">Support</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center relative">
          <div className="surface-glass shadow-luxe p-2 rounded-3xl relative">
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
      {/* Features Section */}
      <section id="features" className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mb-20 mt-16 z-10">
        <FeatureCard title="Boarding & Room Management" desc="Owners manage houses, rooms, tenants, and payments." />
        <FeatureCard title="Search & Discovery" desc="Students search, filter, and explore listings with ease." />
        <FeatureCard title="Roommate Finder" desc="Find and form groups with compatible roommates." />
        <FeatureCard title="Booking & Agreements" desc="Digital booking, status tracking, and rental agreements." />
        <FeatureCard title="Payments" desc="Pay rent, deposits, and track receipts securely." />
      </section>
      {/* Contact Section */}
      <section id="contact" className="surface-glass border border-white/10 py-12 px-4 md:px-0 flex flex-col items-center rounded-3xl shadow-lift mb-12 w-full max-w-2xl backdrop-blur-xl">
        <h2 className="text-2xl xs:text-3xl font-bold text-white mb-4 drop-shadow-lg">Contact & Support</h2>
        <p className="text-zinc-200 mb-8 text-center max-w-xl text-base xs:text-lg drop-shadow">
          Have questions or need help? <br className="hidden md:block" />Reach out to our support team for assistance with your boarding experience.
        </p>
        <a href="mailto:support@boardingbookingsystem.com" className="cta-primary px-6 py-2 text-lg font-bold shadow-lift">Email Support</a>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="surface-card rounded-2xl p-6 flex flex-col items-center shadow-xl border border-indigo-200 min-h-[180px] hover:scale-105 hover:shadow-2xl transition">
      <h3 className="font-bold text-lg text-white mb-1 text-center drop-shadow-lg">{title}</h3>
      <p className="text-zinc-200 text-center text-sm drop-shadow">{desc}</p>
    </div>
  );
}
