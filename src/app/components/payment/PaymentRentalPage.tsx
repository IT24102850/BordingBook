import React from 'react';
import PaymentManager from './PaymentManager';

export default function PaymentRentalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
          Payment & Rental Management
        </h1>
        <p className="text-gray-400 mb-8">Owner dashboard showing payment status for all boarding locations.</p>

        <PaymentManager />
      </div>
    </div>
  );
}
