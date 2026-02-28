import React from 'react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <h1 className="text-3xl font-bold text-cyan-300 mb-4">Verify Your Email</h1>
      <p className="text-cyan-100 text-center max-w-md">
        We’ve sent a verification link to your email address.<br />
        Please check your inbox and follow the instructions to activate your account.
      </p>
    </div>
  );
}
