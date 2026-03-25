import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Star, LifeBuoy, LogOut, X, Loader2,
  CheckCircle, AlertCircle, ChevronRight, Send
} from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001';

// ── Star rating picker ────────────────────────────────────────
const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`transition-colors ${n <= value ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-300'}`}>
        <Star size={22} fill={n <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

// ── Write a Review modal ──────────────────────────────────────
const ReviewModal = ({ onClose }: { onClose: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (rating === 0) { setError('Please select a rating'); return; }
    if (!comment.trim()) { setError('Please write a comment'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/user/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e2845] rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Write a Review</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={16} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <CheckCircle className="text-green-400" size={40} />
            <p className="text-white font-semibold">Review submitted!</p>
            <p className="text-sm text-slate-400">Thank you for your feedback.</p>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-xl">
              Close
            </button>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Your rating</p>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Your comment</p>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                rows={4} maxLength={1000} placeholder="Share your experience with BoardingBook…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none"
              />
              <p className="text-right text-[10px] text-slate-600 mt-1">{comment.length}/1000</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                <AlertCircle size={13} />{error}
              </div>
            )}
            <button onClick={submit} disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : 'Submit Review'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Create Ticket modal ───────────────────────────────────────
const TicketModal = ({ onClose }: { onClose: () => void }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!subject.trim()) { setError('Subject is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/user/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({ subject, category, description }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e2845] rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Create Support Ticket</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={16} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <CheckCircle className="text-green-400" size={40} />
            <p className="text-white font-semibold">Ticket submitted!</p>
            <p className="text-sm text-slate-400">Our team will get back to you shortly.</p>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-xl">
              Close
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120}
                placeholder="Brief description of your issue"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#131a30] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
                <option value="account">Account</option>
                <option value="payment">Payment</option>
                <option value="listing">Listing</option>
                <option value="booking">Booking</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={4} placeholder="Describe your issue in detail…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none" />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                <AlertCircle size={13} />{error}
              </div>
            )}
            <button onClick={submit} disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : <><Send size={14} />Submit Ticket</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main student dashboard ────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') ?? 'Student';
  const [showReview, setShowReview] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0f1425] to-[#0a0f1e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <GraduationCap className="text-cyan-400" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">BoardingBook</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Student Portal</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/5 rounded-lg">
          <LogOut size={14} /> Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {userName} 👋</h1>
          <p className="text-sm text-slate-400 mt-1">You're signed in as a student.</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setShowReview(true)}
            className="group bg-[#1e2845] border border-white/10 hover:border-yellow-400/40 rounded-2xl p-5 text-left transition-all hover:bg-[#232f55]">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-3">
              <Star className="text-yellow-400" size={20} />
            </div>
            <p className="font-semibold text-white text-sm">Write a Review</p>
            <p className="text-xs text-slate-500 mt-1">Share your experience with the platform</p>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-yellow-400 mt-3 transition-colors" />
          </button>

          <button onClick={() => setShowTicket(true)}
            className="group bg-[#1e2845] border border-white/10 hover:border-cyan-400/40 rounded-2xl p-5 text-left transition-all hover:bg-[#232f55]">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-3">
              <LifeBuoy className="text-cyan-400" size={20} />
            </div>
            <p className="font-semibold text-white text-sm">Get Support</p>
            <p className="text-xs text-slate-500 mt-1">Open a ticket for help or queries</p>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 mt-3 transition-colors" />
          </button>
        </div>
      </main>

      {showReview && <ReviewModal onClose={() => setShowReview(false)} />}
      {showTicket && <TicketModal onClose={() => setShowTicket(false)} />}
    </div>
  );
}
