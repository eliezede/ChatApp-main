
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, PlusCircle, User,
  LogOut, Globe2, Menu, CreditCard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 mb-1 group ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mr-2 shadow-lg shadow-blue-500/30">
            <Globe2 size={18} />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Lingland</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-4 mt-6">
            My Account</div>
          <NavItem to="/client/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/client/dashboard'} />
          <NavItem to="/client/profile" icon={User} label="Company Profile" active={isActive('/client/profile')} />

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-4 mt-6">Requests</div>
          <NavItem to="/client/new-booking" icon={PlusCircle} label="New Request" active={isActive('/client/new-booking')} />
          <NavItem to="/client/bookings" icon={CalendarDays} label="Bookings History" active={isActive('/client/bookings')} />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Finance</div>
          <NavItem to="/client/invoices" icon={CreditCard} label="Invoices" active={isActive('/client/invoices')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center p-2 rounded-2xl bg-slate-50 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
              {user?.displayName?.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">Client Portal</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors uppercase tracking-widest border border-red-100"
          >
            <LogOut size={14} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
          <button
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900">Lingland</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
