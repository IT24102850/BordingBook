import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, CheckSquare, ShieldCheck, Star, Search,
  TrendingUp, AlertCircle, X, Check, Clock, Eye, Ban, RotateCcw,
  Flag, Trash2, Send, Filter, ChevronDown, LifeBuoy, MessageSquare
} from 'lucide-react';

// ─────────────────────────────────────────────
//  ADMIN LOGIN
// ─────────────────────────────────────────────
export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = 'admin@boardingbook.com';
  const ADMIN_PASSWORD = 'Admin@1234';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">BoardingBook</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@boardingbook.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors placeholder:text-gray-300"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />{error}
            </div>
          )}
          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Demo: <span className="font-medium text-gray-600">admin@boardingbook.com</span> / <span className="font-medium text-gray-600">Admin@1234</span>
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────────
export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Listings', value: '24', delta: '+3 this week', icon: <Building2 size={18} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Completed Bookings', value: '138', delta: '+12 this month', icon: <CheckSquare size={18} />, color: 'bg-green-50 text-green-600' },
    { label: 'Registered Users', value: '312', delta: '+28 this month', icon: <Users size={18} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending KYC', value: '7', delta: '2 urgent', icon: <ShieldCheck size={18} />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Open Tickets', value: '5', delta: '1 urgent', icon: <LifeBuoy size={18} />, color: 'bg-red-50 text-red-600' },
    { label: 'Avg. Rating', value: '4.6', delta: '↑ 0.2 from last mo.', icon: <Star size={18} />, color: 'bg-orange-50 text-orange-600' },
  ];

  const recentActivity = [
    { text: 'Lakmal Silva submitted KYC documents', time: '2m ago', dot: 'bg-amber-400' },
    { text: 'Booking #1038 marked as completed', time: '14m ago', dot: 'bg-green-400' },
    { text: 'New support ticket from Kavindu P.', time: '31m ago', dot: 'bg-red-400' },
    { text: 'New user registered: Nimasha R.', time: '1h ago', dot: 'bg-blue-400' },
    { text: 'New 5★ review on "Colombo Comfort Rooms"', time: '2h ago', dot: 'bg-purple-400' },
    { text: 'Pradeep N. KYC approved by admin', time: '3h ago', dot: 'bg-gray-400' },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Super Admin</p>
        </div>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1.5">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp size={11} />{s.delta}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Bookings This Month</h3>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">+12% ↑</span>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {[40,65,45,80,55,90,70,85,60,95,75,88,72,98,65,80,55,75,90,68,85,70,78,92,65,55,80,70,88,75].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 29 ? '#000' : '#e5e7eb' }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
            <span>1 Mar</span><span>Today</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────
export const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<number | null>(null);

  const [users, setUsers] = useState([
    { id: 1, name: 'Kavindu Perera', email: 'kavindu@email.com', role: 'Tenant', joined: 'Feb 12, 2026', status: 'Active', listings: 0, bookings: 3 },
    { id: 2, name: 'Lakmal Silva', email: 'lakmal@email.com', role: 'Owner', joined: 'Jan 5, 2026', status: 'Active', listings: 2, bookings: 0 },
    { id: 3, name: 'Nimasha Rajapaksha', email: 'nimasha@email.com', role: 'Tenant', joined: 'Mar 1, 2026', status: 'Active', listings: 0, bookings: 1 },
    { id: 4, name: 'Pradeep Nandana', email: 'pradeep@email.com', role: 'Owner', joined: 'Dec 20, 2025', status: 'Banned', listings: 1, bookings: 0 },
    { id: 5, name: 'Isuri Fernando', email: 'isuri@email.com', role: 'Tenant', joined: 'Feb 28, 2026', status: 'Active', listings: 0, bookings: 2 },
    { id: 6, name: 'Chamara Dias', email: 'chamara@email.com', role: 'Owner', joined: 'Feb 1, 2026', status: 'Active', listings: 3, bookings: 0 },
  ]);

  const toggleBan = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' } : u));
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || u.role === filter || u.status === filter;
    return matchSearch && matchFilter;
  });

  const detailUser = users.find(u => u.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} total registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {['All', 'Owner', 'Tenant', 'Banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Role', 'Joined', 'Listings / Bookings', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                        {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'Owner' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{u.joined}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <span className="font-semibold">{u.listings}</span> listings · <span className="font-semibold">{u.bookings}</span> bookings
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toggleBan(u.id)}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === 'Active' ? 'hover:bg-red-50 text-gray-400 hover:text-red-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}
                        title={u.status === 'Active' ? 'Ban user' : 'Unban user'}>
                        {u.status === 'Active' ? <Ban size={14} /> : <RotateCcw size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">User Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {detailUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{detailUser.name}</p>
                <p className="text-xs text-gray-500">{detailUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Role', detailUser.role], ['Status', detailUser.status], ['Joined', detailUser.joined], ['Listings', detailUser.listings], ['Bookings', detailUser.bookings]].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400 font-medium">{k}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{String(v)}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { toggleBan(detailUser.id); setSelected(null); }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${detailUser.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
              {detailUser.status === 'Active' ? 'Ban this user' : 'Unban this user'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  KYC VERIFICATION
// ─────────────────────────────────────────────
export const KYCVerification = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [kycs, setKycs] = useState([
    { id: 1, owner: 'Lakmal Silva', email: 'lakmal@email.com', submitted: 'Mar 3, 2026', status: 'pending', docs: ['NIC Front', 'NIC Back', 'Property Deed'], listing: 'Colombo Comfort Rooms' },
    { id: 2, owner: 'Chamara Dias', email: 'chamara@email.com', submitted: 'Mar 2, 2026', status: 'pending', docs: ['NIC Front', 'NIC Back', 'Utility Bill'], listing: 'Kandy Budget Stay' },
    { id: 3, owner: 'Sulan Perera', email: 'sulan@email.com', submitted: 'Feb 28, 2026', status: 'approved', docs: ['NIC Front', 'NIC Back', 'Property Deed'], listing: 'Galle Harbor View' },
    { id: 4, owner: 'Nimal Fernando', email: 'nimal@email.com', submitted: 'Feb 20, 2026', status: 'rejected', docs: ['NIC Front'], listing: 'Matara Sea Breeze' },
    { id: 5, owner: 'Pradeep Nandana', email: 'pradeep@email.com', submitted: 'Mar 4, 2026', status: 'pending', docs: ['NIC Front', 'NIC Back', 'Property Deed', 'Business Reg.'], listing: 'Nugegoda Twin Share' },
  ]);

  const take = (id: number, action: 'approved' | 'rejected') => {
    setKycs(k => k.map(e => e.id === id ? { ...e, status: action } : e));
    setExpanded(null);
  };

  const filtered = kycs.filter(k => k.status === activeTab);
  const pendingCount = kycs.filter(k => k.status === 'pending').length;

  const statusStyle: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review boarding owner identity and property documents</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['pending', 'approved', 'rejected'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}{tab === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">No {activeTab} submissions</div>
        )}
        {filtered.map(k => (
          <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpanded(expanded === k.id ? null : k.id)}>
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {k.owner.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{k.owner}</p>
                <p className="text-xs text-gray-400">{k.listing} · Submitted {k.submitted}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle[k.status]}`}>{k.status}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${expanded === k.id ? 'rotate-180' : ''}`} />
            </button>

            {expanded === k.id && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Submitted Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {k.docs.map(doc => (
                      <div key={doc} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">
                        <Check size={12} className="text-green-500" />{doc}
                        <button className="ml-1 text-blue-500 hover:text-blue-700 font-semibold text-[10px] underline">View</button>
                      </div>
                    ))}
                  </div>
                </div>
                {k.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => take(k.id, 'approved')}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors">
                      <Check size={13} />Approve
                    </button>
                    <button onClick={() => take(k.id, 'rejected')}
                      className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
                      <X size={13} />Reject
                    </button>
                  </div>
                )}
                {k.status !== 'pending' && (
                  <p className={`text-xs font-semibold ${k.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                    {k.status === 'approved' ? '✓ Approved — owner verified' : '✕ Rejected — awaiting resubmission'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SUPPORT TICKETS
// ─────────────────────────────────────────────
export const SupportTickets = () => {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState('');

  const [tickets, setTickets] = useState([
    { id: 1, user: 'Kavindu P.', email: 'kavindu@email.com', subject: 'Payment not reflecting', category: 'Payment', status: 'Open', priority: 'High', created: 'Mar 4, 2026', messages: [{ from: 'user', text: 'I made a payment 2 hours ago but my booking still shows pending.', time: '10:30 AM' }] },
    { id: 2, user: 'Isuri F.', email: 'isuri@email.com', subject: 'Cannot upload profile photo', category: 'Technical', status: 'Open', priority: 'Medium', created: 'Mar 3, 2026', messages: [{ from: 'user', text: 'Every time I try to upload a photo it gives an error.', time: 'Yesterday' }] },
    { id: 3, user: 'Nimasha R.', email: 'nimasha@email.com', subject: 'Room description is incorrect', category: 'Listing', status: 'In Progress', priority: 'Low', created: 'Mar 2, 2026', messages: [{ from: 'user', text: "The listing says AC included but the room doesn't have one.", time: 'Mar 2' }, { from: 'admin', text: "We've contacted the owner and are investigating.", time: 'Mar 3' }] },
    { id: 4, user: 'Lakmal S.', email: 'lakmal@email.com', subject: 'KYC still pending after 3 days', category: 'KYC', status: 'Resolved', priority: 'Medium', created: 'Feb 28, 2026', messages: [{ from: 'user', text: 'Submitted my KYC 3 days ago, no update.', time: 'Feb 28' }, { from: 'admin', text: 'Your KYC has been approved. Thank you!', time: 'Mar 1' }] },
    { id: 5, user: 'Sulan P.', email: 'sulan@email.com', subject: 'Refund not received', category: 'Payment', status: 'Open', priority: 'High', created: 'Mar 4, 2026', messages: [{ from: 'user', text: "My booking was cancelled but I haven't received my refund.", time: '9:15 AM' }] },
  ]);

  const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);
  const detail = tickets.find(t => t.id === selected);

  const sendReply = () => {
    if (!reply.trim() || !selected) return;
    setTickets(tickets.map(t => t.id === selected ? { ...t, status: 'In Progress', messages: [...t.messages, { from: 'admin', text: reply, time: 'Now' }] } : t));
    setReply('');
  };

  const resolve = (id: number) => setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));

  const priorityStyle: Record<string, string> = { High: 'bg-red-50 text-red-700', Medium: 'bg-amber-50 text-amber-700', Low: 'bg-gray-50 text-gray-600' };
  const statusStyle: Record<string, string> = { Open: 'bg-blue-50 text-blue-700', 'In Progress': 'bg-purple-50 text-purple-700', Resolved: 'bg-green-50 text-green-700' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tickets.filter(t => t.status !== 'Resolved').length} open · {tickets.length} total</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-2.5">
          {filtered.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-sm ${selected === t.id ? 'border-black ring-1 ring-black/5 shadow-sm' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.subject}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityStyle[t.priority]}`}>{t.priority}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.user} · {t.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[t.status]}`}>{t.status}</span>
                <span className="text-[10px] text-gray-400">{t.created}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {detail ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col" style={{ minHeight: 300 }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{detail.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detail.user} · {detail.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {detail.status !== 'Resolved' && (
                    <button onClick={() => resolve(detail.id)}
                      className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-100 transition-colors">
                      <Check size={12} />Resolve
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={15} /></button>
                </div>
              </div>
              <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-64">
                {detail.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3.5 py-2.5 rounded-2xl text-sm ${m.from === 'admin' ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.from === 'admin' ? 'text-gray-400' : 'text-gray-500'}`}>{m.from === 'admin' ? 'You' : detail.user} · {m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {detail.status !== 'Resolved' && (
                <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                  <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a reply…"
                    className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors"
                    onKeyDown={e => e.key === 'Enter' && sendReply()} />
                  <button onClick={sendReply} className="bg-black text-white p-2.5 rounded-xl hover:bg-gray-900 transition-colors">
                    <Send size={15} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-sm text-gray-400" style={{ minHeight: 200 }}>
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  FEEDBACK MANAGEMENT
// ─────────────────────────────────────────────
export const FeedbackManagement = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: 'Kavindu P.', listing: 'Colombo Comfort Rooms', rating: 5, comment: 'Amazing place, very clean and the owner was super helpful!', date: 'Mar 3, 2026', flagged: false },
    { id: 2, user: 'Nimasha R.', listing: 'Kandy Budget Stay', rating: 2, comment: 'The room was dirty and nothing matched the listing photos.', date: 'Mar 2, 2026', flagged: true },
    { id: 3, user: 'Isuri F.', listing: 'Galle Harbor View', rating: 4, comment: 'Great view and location. AC was a bit noisy but overall good.', date: 'Mar 1, 2026', flagged: false },
    { id: 4, user: 'Sulan P.', listing: 'Nugegoda Twin Share', rating: 1, comment: "SCAM! The place doesn't exist. Reported to authorities!", date: 'Feb 28, 2026', flagged: true },
    { id: 5, user: 'Chamara D.', listing: 'Matara Sea Breeze', rating: 5, comment: 'Best boarding experience ever. Highly recommend!', date: 'Feb 26, 2026', flagged: false },
    { id: 6, user: 'Pradeep N.', listing: 'Colombo Comfort Rooms', rating: 3, comment: 'Decent place but the water heater broke twice during my stay.', date: 'Feb 25, 2026', flagged: false },
  ]);

  const toggleFlag = (id: number) => setFeedbacks(f => f.map(fb => fb.id === id ? { ...fb, flagged: !fb.flagged } : fb));
  const deleteFeedback = (id: number) => setFeedbacks(f => f.filter(fb => fb.id !== id));

  const filtered = feedbacks.filter(fb => {
    const matchFilter = filter === 'All' || (filter === 'Flagged' && fb.flagged) || (fb.rating === parseInt(filter));
    const matchSearch = fb.user.toLowerCase().includes(search.toLowerCase()) || fb.listing.toLowerCase().includes(search.toLowerCase()) || fb.comment.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const avgRating = (feedbacks.reduce((a, fb) => a + fb.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{feedbacks.length} total reviews · Avg. {avgRating}★</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900">{avgRating}</p>
          <div className="flex items-center gap-0.5 justify-end mt-0.5">
            {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= Math.round(parseFloat(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />)}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit self-start flex-wrap">
          {['All', 'Flagged', '5', '4', '3', '2', '1'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'Flagged' ? '🚩 Flagged' : ['5','4','3','2','1'].includes(f) ? `${f}★` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">No reviews found</div>
        )}
        {filtered.map(fb => (
          <div key={fb.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${fb.flagged ? 'border-red-200 bg-red-50/20' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                  {fb.user.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{fb.user}</p>
                    <span className="text-xs text-gray-400">→</span>
                    <p className="text-xs text-blue-600 font-medium truncate">{fb.listing}</p>
                    {fb.flagged && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Flagged</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{fb.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{fb.comment}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleFlag(fb.id)}
                  className={`p-1.5 rounded-lg transition-colors ${fb.flagged ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'hover:bg-gray-100 text-gray-400 hover:text-amber-500'}`}
                  title={fb.flagged ? 'Unflag' : 'Flag'}>
                  <Flag size={14} />
                </button>
                <button onClick={() => deleteFeedback(fb.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Legacy compatibility stubs
export const AdminPassengerList = UserManagement;
export const AdminScanner = () => null;
export const AdminControl = () => null;
export const AdminSettings = () => null;
