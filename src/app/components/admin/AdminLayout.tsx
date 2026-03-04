import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, LifeBuoy, MessageSquare, LogOut, Menu, X, Building2
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans overflow-hidden">

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 px-4 py-3 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-black" />
          <span className="text-base font-bold tracking-tight text-black">BoardingBook</span>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 hidden lg:flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-black leading-none">BoardingBook</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Mobile spacer */}
        <div className="h-14 lg:hidden" />

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2 pt-1">Overview</p>
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={17} />} label="Dashboard" />

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2 pt-4">Management</p>
          <NavItem to="/admin/users" icon={<Users size={17} />} label="Users" />
          <NavItem to="/admin/kyc" icon={<ShieldCheck size={17} />} label="KYC Verification" badge={7} />
          <NavItem to="/admin/tickets" icon={<LifeBuoy size={17} />} label="Support Tickets" badge={5} />
          <NavItem to="/admin/feedback" icon={<MessageSquare size={17} />} label="Feedback" />
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-gray-800">Super Admin</p>
            <p className="text-[11px] text-gray-400">admin@boardingbook.com</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f7f8fa] w-full relative pt-14 lg:pt-0">
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
          ? 'bg-black text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
