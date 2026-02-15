import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, Sliders, LogOut, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-black text-white p-4 z-50 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold tracking-tight">Smart Boarding<span className="text-gray-500">.admin</span></h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
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
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:block">
          <h1 className="text-xl font-bold tracking-tight">Smart Boarding<span className="text-gray-500">.admin</span></h1>
        </div>
        
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:hidden"></div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/admin/passengers" icon={<Users size={20} />} label="Passenger List" />
          <NavItem to="/admin/scanner" icon={<QrCode size={20} />} label="Scanner" />
          <NavItem to="/admin/control" icon={<Sliders size={20} />} label="Boarding Control" />
          <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-3 text-gray-400 hover:text-white w-full px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 w-full relative pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-white text-black font-bold shadow-md transform translate-x-1' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`
    }
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);
