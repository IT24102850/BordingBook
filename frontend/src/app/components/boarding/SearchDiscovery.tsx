import React from 'react';

export default function SearchDiscovery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 flex flex-col items-center py-12 px-4 text-white">
      <h2 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">Search, Filtering & Discovery</h2>
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-2xl text-indigo-900">
        <p className="mb-4 text-lg font-semibold">Student tools for searching and discovering boarding houses will appear here.</p>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>Search bar, filters, map view, listing cards</li>
          <li>Roommate hints, badges, saved searches</li>
        </ul>
      </div>
    </div>
  );
}
