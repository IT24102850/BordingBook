import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, LifeBuoy, MessageSquare, LogOut, Menu, X, Building2 } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Update page title based on route
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/users': 'User Management',
      '/admin/kyc': 'KYC Verification',
      '/admin/tickets': 'Support Tickets',
      '/admin/feedback': 'Feedback Management',
    };
    const title = pageTitles[location.pathname] || 'Admin Panel';
    document.title = `${title} - BoardingBook`;
  }, [location.pathname]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#181f36] font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-[#1e2436] border-b border-[rgba(129,140,248,0.15)] text-white p-4 z-50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#818cf8] to-[#22d3ee] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.3)]">
            <Building2 size={16} className="text-white" />
          </div>
          <h1 className="text-base font-bold tracking-tight">BoardingBook<span className="text-slate-400">.admin</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[rgba(129,140,248,0.1)] rounded-lg transition-colors">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1e2436] border-r border-[rgba(129,140,248,0.15)] text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:block">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-[#818cf8] to-[#22d3ee] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.3)]">
              <Building2 size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">BoardingBook</h1>
          </div>
          <p className="text-xs text-slate-400 ml-10.5">Admin Portal</p>
        </div>
        
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:hidden"></div>

        <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/admin/users" icon={<Users size={18} />} label="Users" badge="312" />
          <NavItem to="/admin/kyc" icon={<ShieldCheck size={18} />} label="KYC Verification" badge="7" badgeColor="amber" />
          <NavItem to="/admin/tickets" icon={<LifeBuoy size={18} />} label="Support Tickets" badge="5" badgeColor="red" />
          <NavItem to="/admin/feedback" icon={<MessageSquare size={18} />} label="Feedback" />
        </nav>

        <div className="p-3 border-t border-[rgba(129,140,248,0.15)]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(129,140,248,0.1)] transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#181f36] w-full relative pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ to, icon, label, badge, badgeColor = 'blue' }: { to: string, icon: React.ReactNode, label: string, badge?: string, badgeColor?: 'blue' | 'amber' | 'red' }) => {
  const badgeColors = {
    blue: 'bg-blue-900/50 text-blue-400',
    amber: 'bg-amber-900/50 text-amber-400',
    red: 'bg-red-900/50 text-red-400',
  };

  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive ? 'bg-gradient-to-r from-[#818cf8]/20 to-[#22d3ee]/10 text-white border border-[rgba(129,140,248,0.3)] shadow-[0_0_12px_rgba(129,140,248,0.15)]' : 'text-slate-400 hover:text-white hover:bg-[rgba(129,140,248,0.08)]'}`
      }
    >
      {icon}
      <span className="text-sm font-medium flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};
