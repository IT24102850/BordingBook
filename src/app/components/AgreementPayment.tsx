import React from 'react';

export default function AgreementPayment() {
  // TODO: Agreement signing, payment progress bar
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="max-w-md w-full bg-white/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-cyan-700 mb-4">Agreement & Payment</h2>
        <div className="w-full mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Agreement Signed</span>
            <span className="text-purple-400 font-bold">→ Payment Pending</span>
            <span className="text-green-400 font-bold">→ Booking Confirmed</span>
          </div>
        </div>
        <div className="text-cyan-900">Agreement and payment features coming soon...</div>
      </div>
    </div>
  );
}
