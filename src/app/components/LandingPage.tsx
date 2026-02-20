import React from 'react';
import { Typewriter } from './ui/Typewriter';
import { AuthDropdown } from './AuthDropdown';
import { BoardingSlideshow } from './ui/BoardingSlideshow';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] px-4">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-6 px-4 md:px-16 bg-white/10 backdrop-blur-xl rounded-b-3xl shadow-luxe">
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">Boarding<span className="text-purple-400">Book</span></span>
        <div className="flex gap-8 items-center">
          <a href="#home" className="text-zinc-100 hover:text-cyan-300 border-b-2 border-cyan-400 pb-1">Home</a>
          <a href="#features" className="text-zinc-100 hover:text-cyan-300">Explore</a>
          <a href="#owner" className="text-zinc-100 hover:text-cyan-300">Owner Portal</a>
          <a href="#roommate" className="text-zinc-100 hover:text-cyan-300">Roommate Finder</a>
          <a
            href="#contact"
            className="glassmorphism ml-4 px-4 py-2 rounded-full text-cyan-400 font-bold text-lg shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 border border-cyan-200 backdrop-blur-xl"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            Contact
          </a>
          <AuthDropdown />
        </div>
      </nav>
      {/* Hero */}
      <main className="flex flex-col md:flex-row items-center gap-12 mt-16 w-full max-w-6xl">
        <div className="flex-1">
          <div className="surface-card p-10 mb-6 shadow-luxe">
            <span className="tag-pill mb-4 inline-block">UNIVERSITY BOARDING · PLATFORM</span>
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
        <FeatureCard title="Admin & Security" desc="Campus staff verify, moderate, and monitor the platform." />
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
