import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard, CalendarDays, Users, Briefcase,
  LogOut, Menu, Globe2, FileText, PoundSterling,
  CreditCard, UserCog, Settings, UserPlus, X, ChevronRight, MessageSquare, Mail,
  UserCheck, BarChart3, ClipboardList
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { ChatSystem } from '../components/chat/ChatSystem';
import { ChatService } from '../services/chatService';
import { CommandPalette } from '../components/ui/CommandPalette';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: number;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, badge, onClick, isCollapsed }) => (
  <Link
    to={to}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} rounded-xl transition-all duration-200 mb-0.5 group ${active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={isCollapsed ? 22 : 18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </div>
    {!isCollapsed && (
      <div className="flex items-center">
        {badge ? (
          <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full mr-1">
            {badge}
          </span>
        ) : active && <ChevronRight size={12} className="text-blue-200" />}
      </div>
    )}
    {isCollapsed && badge && (
      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></div>
    )}
  </Link>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    return ChatService.subscribeToThreads(user.id, (threads) => {
      const count = threads.reduce((acc, t) => acc + (t.unreadCount[user.id] || 0), 0);
      setTotalUnread(count);
    });
  }, [user]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <ChatSystem />
      <CommandPalette />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
              <Globe2 size={18} />
            </div>
            {!isCollapsed && <span className="ml-3 text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">Lingland</span>}
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide space-y-0.5">
          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-1">Core</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/dashboard" icon={LayoutDashboard} label="Workstation" active={location.pathname === '/admin/dashboard'} onClick={closeSidebar} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">Operations</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/bookings" icon={CalendarDays} label="Jobs Board" active={isActive('/admin/bookings')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/operations/assignments" icon={UserCheck} label="Assignments" active={isActive('/admin/operations/assignments')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/timesheets" icon={FileText} label="Timesheet Review" active={isActive('/admin/timesheets')} onClick={closeSidebar} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">Network</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/interpreters" icon={Users} label="Interpreters" active={isActive('/admin/interpreters')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/clients" icon={Briefcase} label="Clients & Depts" active={isActive('/admin/clients')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/applications" icon={UserPlus} label="Applications" active={isActive('/admin/applications')} onClick={closeSidebar} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">Finance</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/billing/client-invoices" icon={CreditCard} label="Client Invoices" active={isActive('/admin/billing/client-invoices')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/billing/interpreter-invoices" icon={PoundSterling} label="Interpreter Payments" active={isActive('/admin/billing/interpreter-invoices')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/finance/reports" icon={BarChart3} label="Financial Reports" active={isActive('/admin/finance/reports')} onClick={closeSidebar} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">Communications</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/messages" icon={MessageSquare} label="Direct Messages" badge={totalUnread} active={isActive('/admin/messages')} onClick={closeSidebar} />
          <NavItem isCollapsed={isCollapsed} to="/admin/settings/email-templates" icon={Mail} label="Email Templates" active={isActive('/admin/settings/email-templates')} onClick={closeSidebar} />

          {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-3 mt-4">Administration</div>}
          <NavItem isCollapsed={isCollapsed} to="/admin/users" icon={UserCog} label="Users & Roles" active={isActive('/admin/users')} onClick={closeSidebar} />
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
            <React.Fragment>
              <NavItem isCollapsed={isCollapsed} to="/admin/settings" icon={Settings} label="System Config" active={location.pathname === '/admin/settings'} onClick={closeSidebar} />
              <NavItem isCollapsed={isCollapsed} to="/admin/system/audit-log" icon={ClipboardList} label="Audit Logs" active={isActive('/admin/system/audit-log')} onClick={closeSidebar} />
            </React.Fragment>
          )}
        </nav>

        <div className={`border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4 px-0' : 'space-x-3 px-2'} mb-4`}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.displayName?.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">Admin</p>
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

          <div className={`flex ${isCollapsed ? 'flex-col' : 'items-center'} gap-2 p-2`}>
            <ThemeToggle className={`flex-1 justify-center ${isCollapsed ? 'p-2' : ''}`} />
            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30 ${isCollapsed ? '' : 'flex-1 text-[10px] font-bold uppercase tracking-widest'}`}
            >
              <LogOut size={16} className={isCollapsed ? '' : 'mr-2'} />
              {!isCollapsed && "Out"}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:hidden sticky top-0 z-30">
          <div className="flex items-center">
            <button className="lg:hidden p-2 -ml-2 mr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:hidden whitespace-nowrap">Control Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
              {user?.displayName?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};