import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, LifeBuoy, MessageSquare, LogOut, Menu, X, Building2, Settings
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('adminToken');

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#181f36] font-sans overflow-hidden">

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-[#232b47] border-b border-[rgba(129,140,248,0.2)] px-4 py-3 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-[#a5b4fc]" />
          <span className="text-base font-bold tracking-tight text-white">BoardingBook</span>
          <span className="text-xs font-semibold text-slate-400 bg-[rgba(129,140,248,0.1)] px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[rgba(129,140,248,0.1)] rounded-lg transition-colors text-slate-300">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#1e2436] border-r border-[rgba(129,140,248,0.15)] flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[rgba(129,140,248,0.15)] hidden lg:flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#818cf8] to-[#22d3ee] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.4)]">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">BoardingBook</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Mobile spacer */}
        <div className="h-14 lg:hidden" />

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pb-2 pt-1">Overview</p>
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={17} />} label="Dashboard" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pb-2 pt-4">Management</p>
          <NavItem to="/admin/users" icon={<Users size={17} />} label="Users" />
          <NavItem to="/admin/kyc" icon={<ShieldCheck size={17} />} label="KYC Verification" />
          <NavItem to="/admin/tickets" icon={<LifeBuoy size={17} />} label="Support Tickets" />
          <NavItem to="/admin/feedback" icon={<MessageSquare size={17} />} label="Feedback" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pb-2 pt-4">Account</p>
          <NavItem to="/admin/settings" icon={<Settings size={17} />} label="Settings" />
        </nav>

        <div className="px-3 py-4 border-t border-[rgba(129,140,248,0.15)]">
          <div className="px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-slate-200">{localStorage.getItem('adminName') ?? 'Super Admin'}</p>
            <p className="text-[11px] text-slate-500">{localStorage.getItem('adminEmail') ?? ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-slate-400 hover:text-red-400 hover:bg-[rgba(248,113,113,0.08)] w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#181f36] w-full relative pt-14 lg:pt-0">
        <div className="p-5 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-gradient-to-r from-[#818cf8] to-[#22d3ee] text-white shadow-[0_0_12px_rgba(129,140,248,0.3)]'
          : 'text-slate-400 hover:bg-[rgba(129,140,248,0.08)] hover:text-white'
      }`
    }
  >
    {icon}
    <span className="flex-1">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>
    )}
  </NavLink>
);
