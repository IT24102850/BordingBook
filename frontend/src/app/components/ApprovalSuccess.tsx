import React from 'react';

export default function ApprovalSuccess() {
  // TODO: Booking approved animation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="max-w-md w-full bg-white/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <span className="text-4xl font-extrabold text-green-400 mb-4">Booking Approved! 🎉</span>
        <div className="text-cyan-900">Your group booking has been approved. Agreement will be generated soon.</div>
      </div>
    </div>
  );
}
