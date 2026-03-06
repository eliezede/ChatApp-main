import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, PlusCircle, User,
  LogOut, Globe2, Menu, CreditCard, X, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, isCollapsed }) => (
  <Link
    to={to}
    title={isCollapsed ? label : undefined}
    className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'} rounded-xl transition-all duration-200 mb-0.5 group ${active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
  >
    <Icon size={isCollapsed ? 22 : 18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} />
    {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
  </Link>
);

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
              <Globe2 size={18} />
            </div>
            {!isCollapsed && <span className="ml-3 text-lg font-bold text-slate-900 dark:text-white tracking-tight">Lingland</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide space-y-0.5">
          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">
            My Account</div>}
          <NavItem isCollapsed={isCollapsed} to="/client/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/client/dashboard'} />
          <NavItem isCollapsed={isCollapsed} to="/client/profile" icon={User} label="Company Profile" active={isActive('/client/profile')} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-6">Requests</div>}
          <NavItem isCollapsed={isCollapsed} to="/client/new-booking" icon={PlusCircle} label="New Request" active={isActive('/client/new-booking')} />
          <NavItem isCollapsed={isCollapsed} to="/client/bookings" icon={CalendarDays} label="Bookings History" active={isActive('/client/bookings')} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-6">Finance</div>}
          <NavItem isCollapsed={isCollapsed} to="/client/invoices" icon={CreditCard} label="Invoices" active={isActive('/client/invoices')} />
        </nav>

        <div className={`border-t border-slate-100 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4 px-0' : 'p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4'}`}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.displayName?.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">Client</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <Menu size={18} className={isCollapsed ? 'rotate-90' : ''} />
            </button>
          </div>
          <div className={`flex ${isCollapsed ? 'flex-col' : 'items-center'} gap-2 mt-2`}>
            <ThemeToggle className={`flex-1 justify-center ${isCollapsed ? 'p-2' : ''}`} />
            <button
              onClick={logout}
              title="Sign Out"
              className={`flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30 ${isCollapsed ? '' : 'flex-1 text-xs font-bold uppercase tracking-widest'}`}
            >
              <LogOut size={16} className={isCollapsed ? '' : 'mr-2'} />
              {!isCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:hidden">
          <button
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">Lingland</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
