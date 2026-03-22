import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, CheckSquare, Users, ShieldCheck, LifeBuoy, Star, AlertCircle, 
  Search, Filter, Eye, Ban, CheckCircle, XCircle, Trash2, Flag, MessageSquare,
  FileText, ChevronDown, ChevronUp, Send, X as XIcon
} from 'lucide-react';

// ─────────────────────────────────────────────
// ADMIN LOGIN
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
        localStorage.setItem('adminLoginTime', new Date().toISOString());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#181f36] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#818cf8] to-[#22d3ee] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(129,140,248,0.4)]">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BoardingBook</h1>
          <p className="text-sm text-slate-400 mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1e2436] rounded-2xl shadow-sm border border-[rgba(129,140,248,0.15)] p-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@boardingbook.com"
              className="w-full px-3.5 py-2.5 border border-[rgba(129,140,248,0.2)] bg-[#232b47] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-[rgba(129,140,248,0.2)] bg-[#232b47] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors placeholder:text-slate-500"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-xs text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Demo: <span className="font-medium text-slate-300">admin@boardingbook.com</span> / <span className="font-medium text-slate-300">Admin@1234</span>
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Listings', value: '24', delta: '+3 this week', icon: <Building2 size={18} />, color: 'bg-blue-900/30 text-blue-400' },
    { label: 'Completed Bookings', value: '138', delta: '+12 this month', icon: <CheckSquare size={18} />, color: 'bg-green-900/30 text-green-400' },
    { label: 'Registered Users', value: '312', delta: '+28 this month', icon: <Users size={18} />, color: 'bg-purple-900/30 text-purple-400' },
    { label: 'Pending KYC', value: '7', delta: '2 urgent', icon: <ShieldCheck size={18} />, color: 'bg-amber-900/30 text-amber-400' },
    { label: 'Open Tickets', value: '5', delta: '1 urgent', icon: <LifeBuoy size={18} />, color: 'bg-red-900/30 text-red-400' },
    { label: 'Avg. Rating', value: '4.6', delta: '↑ 0.2 from last mo.', icon: <Star size={18} />, color: 'bg-orange-900/30 text-orange-400' },
  ];

  const recentActivity = [
    { text: 'Lakmal Silva submitted KYC documents', time: '2m ago', dot: 'bg-amber-400' },
    { text: 'Booking #1038 marked as completed', time: '14m ago', dot: 'bg-green-400' },
    { text: 'New support ticket from Kavindu P.', time: '31m ago', dot: 'bg-red-400' },
    { text: 'New user registered: Nimasha R.', time: '1h ago', dot: 'bg-blue-400' },
    { text: 'New 5★ review on "Colombo Comfort Rooms"', time: '2h ago', dot: 'bg-purple-400' },
    { text: 'Pradeep N. KYC approved by admin', time: '3h ago', dot: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">System overview and recent activity</p>
        </div>
        <span className="text-xs text-slate-400 bg-[#1e2436] border border-[rgba(129,140,248,0.15)] px-3 py-1.5 rounded-lg font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
          All systems operational
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-2xl p-4 shadow-sm">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.color} mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className="text-[11px] text-slate-500 mt-1">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[rgba(129,140,248,0.04)] rounded-lg hover:bg-[rgba(129,140,248,0.08)] transition-colors">
                <span className={`w-2 h-2 rounded-full ${a.dot} mt-1.5 flex-shrink-0`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{a.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-[rgba(129,140,248,0.08)] hover:bg-[rgba(129,140,248,0.12)] rounded-lg text-sm text-slate-200 transition-colors">Review pending KYC</button>
            <button className="w-full text-left px-4 py-3 bg-[rgba(129,140,248,0.08)] hover:bg-[rgba(129,140,248,0.12)] rounded-lg text-sm text-slate-200 transition-colors">Answer support tickets</button>
            <button className="w-full text-left px-4 py-3 bg-[rgba(129,140,248,0.08)] hover:bg-[rgba(129,140,248,0.12)] rounded-lg text-sm text-slate-200 transition-colors">Moderate feedback</button>
            <button className="w-full text-left px-4 py-3 bg-[rgba(129,140,248,0.08)] hover:bg-[rgba(129,140,248,0.12)] rounded-lg text-sm text-slate-200 transition-colors">View analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// USER MANAGEMENT
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
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-sm text-slate-400 mt-0.5">{users.length} total registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-white bg-[#232b47] border border-[rgba(129,140,248,0.2)] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          {['All', 'Tenant', 'Owner', 'Active', 'Banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[rgba(129,140,248,0.2)] text-white' : 'bg-[#232b47] text-slate-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e2436] rounded-2xl border border-[rgba(129,140,248,0.15)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgba(129,140,248,0.05)] border-b border-[rgba(129,140,248,0.15)]">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-[rgba(129,140,248,0.08)] hover:bg-[rgba(129,140,248,0.04)] transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold ${u.role === 'Owner' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{u.joined}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold ${u.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelected(u.id)} className="p-1.5 hover:bg-[rgba(129,140,248,0.1)] rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toggleBan(u.id)} className={`p-1.5 hover:bg-[rgba(129,140,248,0.1)] rounded-lg transition-colors ${u.status === 'Banned' ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}>
                        <Ban size={14} />
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
          <div className="bg-[#1e2436] rounded-2xl shadow-2xl border border-[rgba(129,140,248,0.2)] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-white">{detailUser.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-[rgba(129,140,248,0.1)] rounded-lg text-slate-400 hover:text-white">
                <XIcon size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400"><span className="font-semibold text-white">Email:</span> {detailUser.email}</p>
              <p className="text-slate-400"><span className="font-semibold text-white">Role:</span> {detailUser.role}</p>
              <p className="text-slate-400"><span className="font-semibold text-white">Joined:</span> {detailUser.joined}</p>
              <p className="text-slate-400"><span className="font-semibold text-white">Status:</span> {detailUser.status}</p>
              <p className="text-slate-400"><span className="font-semibold text-white">Listings:</span> {detailUser.listings}</p>
              <p className="text-slate-400"><span className="font-semibold text-white">Bookings:</span> {detailUser.bookings}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => toggleBan(detailUser.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${detailUser.status === 'Banned' ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40' : 'bg-red-900/30 text-red-400 hover:bg-red-900/40'}`}>
                {detailUser.status === 'Banned' ? 'Unban User' : 'Ban User'}
              </button>
              <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[rgba(129,140,248,0.1)] text-white hover:bg-[rgba(129,140,248,0.15)] transition-colors">
                View Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// KYC VERIFICATION
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
    pending: 'bg-amber-900/30 text-amber-400',
    approved: 'bg-green-900/30 text-green-400',
    rejected: 'bg-red-900/30 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">KYC Verification</h1>
        <p className="text-sm text-slate-400 mt-0.5">Review boarding owner identity and property documents</p>
      </div>

      <div className="flex gap-1 bg-[#232b47] p-1 rounded-xl w-fit">
        {(['pending', 'approved', 'rejected'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${activeTab === tab ? 'bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {tab} {tab === 'pending' && `(${pendingCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-12">No {activeTab} submissions yet</p>
        )}
        {filtered.map(k => (
          <div key={k.id} className="bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{k.owner}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle[k.status]}`}>
                    {k.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{k.email}</p>
                <p className="text-xs text-slate-400 mt-1">Listing: <span className="text-slate-300">{k.listing}</span></p>
                <p className="text-xs text-slate-500 mt-0.5">Submitted {k.submitted}</p>
              </div>
              {k.status === 'pending' && (
                <button onClick={() => setExpanded(expanded === k.id ? null : k.id)} className="p-1 hover:bg-[rgba(129,140,248,0.1)] rounded-lg text-slate-400 hover:text-white transition-colors">
                  {expanded === k.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>

            {expanded === k.id && (
              <div className="mt-4 pt-4 border-t border-[rgba(129,140,248,0.1)] space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {k.docs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(129,140,248,0.08)] rounded-lg">
                        <FileText size={12} className="text-indigo-400" />
                        <span className="text-xs text-slate-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => take(k.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-900/30 hover:bg-green-900/40 text-green-400 rounded-lg text-xs font-semibold transition-colors">
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button onClick={() => take(k.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-900/30 hover:bg-red-900/40 text-red-400 rounded-lg text-xs font-semibold transition-colors">
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUPPORT TICKETS
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

  const priorityStyle: Record<string, string> = { High: 'bg-red-900/30 text-red-400', Medium: 'bg-amber-900/30 text-amber-400', Low: 'bg-[rgba(129,140,248,0.1)] text-slate-400' };
  const statusStyle: Record<string, string> = { Open: 'bg-blue-900/30 text-blue-400', 'In Progress': 'bg-purple-900/30 text-purple-400', Resolved: 'bg-green-900/30 text-green-400' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-slate-400 mt-0.5">{tickets.filter(t => t.status !== 'Resolved').length} open · {tickets.length} total</p>
      </div>

      <div className="flex gap-1 bg-[#232b47] p-1 rounded-xl w-fit">
        {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white' : 'text-slate-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-2.5">
          {filtered.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${selected === t.id ? 'bg-[rgba(129,140,248,0.1)] border-[rgba(129,140,248,0.3)]' : 'bg-[#1e2436] border-[rgba(129,140,248,0.15)] hover:border-[rgba(129,140,248,0.25)]'}`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white flex-1">{t.subject}</h4>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityStyle[t.priority]}`}>{t.priority}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{t.user} • {t.category}</p>
              <div className="flex items-center justify-between">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle[t.status]}`}>{t.status}</span>
                <span className="text-xs text-slate-500">{t.created}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          {detail ? (
            <div className="bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-2xl shadow-sm p-5 h-full flex flex-col">
              <div className="mb-4 pb-4 border-b border-[rgba(129,140,248,0.1)]">
                <h3 className="text-lg font-bold text-white mb-1">{detail.subject}</h3>
                <p className="text-xs text-slate-400">{detail.user} ({detail.email}) • {detail.created}</p>
              </div>
              <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                {detail.messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg ${m.from === 'user' ? 'bg-[rgba(129,140,248,0.08)] ml-0 mr-8' : 'bg-green-900/20 ml-8 mr-0'}`}>
                    <p className="text-xs font-semibold text-slate-300 mb-1">{m.from === 'user' ? detail.user : 'Admin'}</p>
                    <p className="text-sm text-slate-200 mb-1">{m.text}</p>
                    <p className="text-[10px] text-slate-500">{m.time}</p>
                  </div>
                ))}
              </div>
              {detail.status !== 'Resolved' && (
                <div className="flex gap-2">
                  <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…"
                    className="flex-1 px-3 py-2 text-sm text-white bg-[#232b47] border border-[rgba(129,140,248,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  <button onClick={sendReply} className="px-4 py-2 bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Send size={14} />
                  </button>
                  <button onClick={() => resolve(detail.id)} className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/40 transition-colors text-xs font-semibold">
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1e2436] border border-[rgba(129,140,248,0.15)] rounded-2xl shadow-sm h-96 flex items-center justify-center text-slate-500 text-sm">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// FEEDBACK MANAGEMENT
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
          <h1 className="text-xl font-bold text-white">Feedback Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review and moderate user reviews and ratings</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{avgRating}</p>
          <p className="text-xs text-slate-400">Avg. Rating</p>
          <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className={i < Math.round(parseFloat(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />)}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-white bg-[#232b47] border border-[rgba(129,140,248,0.2)] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors" />
        </div>
        <div className="flex gap-1 bg-[#232b47] p-1 rounded-xl w-fit self-start flex-wrap">
          {['All', 'Flagged', '5', '4', '3', '2', '1'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-[rgba(129,140,248,0.2)] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {f === 'Flagged' ? f : f === 'All' ? f : `${f}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-12">No feedback matches your filters</p>
        )}
        {filtered.map(fb => (
          <div key={fb.id} className={`bg-[#1e2436] border rounded-xl p-4 shadow-sm ${fb.flagged ? 'border-red-500/30 bg-red-900/5' : 'border-[rgba(129,140,248,0.15)]'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{fb.user}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: fb.rating }).map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  {fb.flagged && <Flag size={12} className="text-red-400" />}
                </div>
                <p className="text-xs text-slate-500">on {fb.listing} • {fb.date}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleFlag(fb.id)} className={`p-1.5 hover:bg-[rgba(129,140,248,0.1)] rounded-lg transition-colors ${fb.flagged ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}>
                  <Flag size={14} />
                </button>
                <button onClick={() => deleteFeedback(fb.id)} className="p-1.5 hover:bg-[rgba(129,140,248,0.1)] rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-300">{fb.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
