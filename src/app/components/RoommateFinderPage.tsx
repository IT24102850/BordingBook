import React from 'react';

export default function RoommateFinderPage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="surface-card w-full max-w-4xl p-8 mb-8 shadow-luxe">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">Roommate Finder & Group Formation</h1>
        <p className="muted mb-6">Create your roommate profile, browse others, and form groups for bookings.</p>
        {/* TODO: Add roommate profile, browse, requests, group booking UI */}
      </div>
    </div>
  );
}
