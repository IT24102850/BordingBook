import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Users, ShieldCheck } from 'lucide-react';

export default function SearchDiscovery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#111c39] to-[#0b132b] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-200 text-sm">
            <Search size={14} />
            Discovery
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
            Search rooms and find your next stay
          </h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Use the student booking dashboard for live booking requests and agreement responses.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate('/student-booking')}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:border-cyan-400/40 hover:bg-white/10 transition-all"
          >
            <Home className="text-cyan-300" size={22} />
            <h2 className="mt-3 text-lg font-semibold">Student Booking</h2>
            <p className="mt-2 text-sm text-gray-400">Submit requests and manage agreements.</p>
          </button>

          <button
            onClick={() => navigate('/roommate-finder')}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:border-cyan-400/40 hover:bg-white/10 transition-all"
          >
            <Users className="text-cyan-300" size={22} />
            <h2 className="mt-3 text-lg font-semibold">Roommate Finder</h2>
            <p className="mt-2 text-sm text-gray-400">Match with compatible roommates.</p>
          </button>

          <button
            onClick={() => navigate('/owner/dashboard')}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:border-cyan-400/40 hover:bg-white/10 transition-all"
          >
            <ShieldCheck className="text-cyan-300" size={22} />
            <h2 className="mt-3 text-lg font-semibold">Owner Approvals</h2>
            <p className="mt-2 text-sm text-gray-400">Approve bookings and send agreement templates.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
