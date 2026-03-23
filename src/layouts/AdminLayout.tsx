import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard, CalendarDays, Users, Briefcase,
  LogOut, Globe2, Menu, FileText, PoundSterling,
  CreditCard, UserCog, Settings, UserPlus, X, ChevronRight, MessageSquare, Mail,
  UserCheck, BarChart3, ClipboardList, PanelLeftOpen, PanelLeftClose, ChevronLeft, ChevronRight as ChevronRightIcon,
  Search, ShieldCheck, Database, History, HelpCircle, Bell, User as UserIcon, Clock, ChevronDown
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
    className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg transition-all duration-200 mb-0.5 group ${active
      ? 'sidebar-active shadow-sm'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={isCollapsed ? 20 : 18} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
      {!isCollapsed && <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}>{label}</span>}
    </div>
    {!isCollapsed && (
      <div className="flex items-center">
        {badge ? (
          <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        ) : null}
      </div>
    )}
  </Link>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSecondarySlim, setIsSecondarySlim] = useState(false);
  const [isPrimaryExpanded, setIsPrimaryExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [onboardingBadge, setOnboardingBadge] = useState(0);

  const [activeCategory, setActiveCategory] = useState<string>('CORE');

  const isWorkstation = location.pathname === '/admin/dashboard' || location.pathname === '/admin/terminal-one';

  const categories = [
    { id: 'CORE', label: 'Home', icon: LayoutDashboard, rootPath: '/admin/dashboard' },
    { id: 'OPS', label: 'Operations', icon: Briefcase, rootPath: '/admin/bookings' },
    { id: 'NET', label: 'Network', icon: Users, rootPath: '/admin/interpreters' },
    { id: 'FIN', label: 'Finance', icon: PoundSterling, rootPath: '/admin/billing' },
    { id: 'COMMS', label: 'Comms', icon: MessageSquare, rootPath: '/admin/messages' },
    { id: 'ADMIN', label: 'Administration', icon: Settings, rootPath: '/admin/users' },
  ];

  // British English Date Format
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getUKDate = () => {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('en-GB', { month: 'long' });
    return `${weekday}, ${day}${getOrdinalSuffix(day)} ${month}`;
  };

  const today = getUKDate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const pathMap: Record<string, string> = {
      '/admin/dashboard': 'CORE',
      '/admin/terminal-one': 'CORE',
      '/admin/bookings': 'OPS',
      '/admin/operations': 'OPS',
      '/admin/interpreters': 'NET',
      '/admin/clients': 'NET',
      '/admin/applications': 'NET',
      '/admin/billing': 'FIN',
      '/admin/finance': 'FIN',
      '/admin/messages': 'COMMS',
      '/admin/settings/email-templates': 'COMMS',
      '/admin/users': 'ADMIN',
      '/admin/settings': 'ADMIN',
      '/admin/system': 'ADMIN',
      '/admin/administration': 'ADMIN'
    };

    const currentPath = location.pathname;
    const categoryId = Object.entries(pathMap).find(([path]) => currentPath.startsWith(path))?.[1];
    if (categoryId) setActiveCategory(categoryId);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribeChat = ChatService.subscribeToThreads(user.id, (threads) => {
      const count = threads.reduce((acc, t) => acc + (t.unreadCount[user.id] || 0), 0);
      setTotalUnread(count);
    });

    const fetchStats = async () => {
      try {
        const stats = await import('../services/statsService').then(m => m.StatsService.getOnboardingStats());
        const total = stats.pendingApplications + stats.pendingOnboardingDocs;
        setOnboardingBadge(total);
      } catch (e) {
        console.error("Failed to fetch onboarding stats", e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(interval);
      unsubscribeChat();
    };
  }, [user]);

  const isActive = (path: string) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path + '/'));

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSecondaryCollapse = () => {
    const nextState = !isSecondarySlim;
    setIsSecondarySlim(nextState);
    if (nextState) {
      setIsPrimaryExpanded(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      <ChatSystem />
      <CommandPalette />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex
        transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Primary Sidebar */}
        <div className={`
          ${isPrimaryExpanded ? 'w-56' : 'w-16 lg:w-20'} 
          bg-slate-900 flex flex-col items-center py-6 border-r border-slate-800 shrink-0 transition-all duration-300
        `}>
          <div className={`flex items-center ${isPrimaryExpanded ? 'px-4 space-x-3 justify-start' : 'justify-center'} w-full mb-8`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Globe2 size={24} />
            </div>
            {isPrimaryExpanded && <span className="text-white font-black tracking-tighter text-xl capitalize">Lingland</span>}
          </div>

          <div className="flex-1 w-full flex flex-col space-y-1.5 px-2 overflow-y-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.rootPath && cat.rootPath !== location.pathname) navigate(cat.rootPath);
                  if (isPrimaryExpanded && window.innerWidth < 1024) setIsPrimaryExpanded(false);
                }}
                title={!isPrimaryExpanded ? cat.label : undefined}
                className={`w-full rounded-xl flex items-center transition-all duration-200 group relative 
                  ${isPrimaryExpanded ? 'px-4 py-2.5 space-x-3' : 'h-12 justify-center'}
                  ${activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-blue-500/20 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <cat.icon size={22} className="shrink-0" />
                {isPrimaryExpanded && <span className="text-sm font-semibold truncate">{cat.label}</span>}
                {!isPrimaryExpanded && activeCategory === cat.id && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                )}
                {cat.id === 'NET' && onboardingBadge > 0 && (
                  <div className={`absolute ${isPrimaryExpanded ? 'right-4 top-4' : 'top-2 right-2'} w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900`} />
                )}
              </button>
            ))}
          </div>

          <div className={`mt-auto w-full flex flex-col ${isPrimaryExpanded ? 'items-start px-2' : 'items-center'} space-y-4`}>
            <button 
              onClick={() => setIsPrimaryExpanded(!isPrimaryExpanded)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${isPrimaryExpanded ? 'ml-2' : ''}`}
              title={isPrimaryExpanded ? 'Collapse Menu' : 'Expand Menu'}
            >
              {isPrimaryExpanded ? <ChevronLeft size={20} /> : <ChevronRightIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Secondary Sidebar (Contextual) */}
        {!isWorkstation && (
          <div className={`${isSecondarySlim ? 'w-16 lg:w-20' : 'w-64'} bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 overflow-hidden`}>
            <div className={`h-16 flex items-center ${isSecondarySlim ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100 dark:border-slate-800 shrink-0`}>
              {!isSecondarySlim ? (
                <>
                  <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase truncate">
                    {categories.find(c => c.id === activeCategory)?.label}
                  </h2>
                  <button onClick={() => setIsSecondarySlim(true)} className="lg:hidden p-1 text-slate-400">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              )}
            </div>
            <nav className={`flex-1 overflow-y-auto ${isSecondarySlim ? 'p-2' : 'p-4'} scrollbar-hide space-y-6`}>
              {activeCategory === 'OPS' && (
                <div className="space-y-4">
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Scheduling</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/bookings" icon={CalendarDays} label="Jobs Board" active={isActive('/admin/bookings')} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/operations/assignments" icon={UserCheck} label="Assignments" active={isActive('/admin/operations/assignments')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Review</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/operations/timesheets" icon={ClipboardList} label="Timesheet Review" active={isActive('/admin/operations/timesheets')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'NET' && (
                <div className="space-y-4">
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Resources</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/interpreters" icon={Users} label="Interpreters" active={isActive('/admin/interpreters')} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/clients" icon={Briefcase} label="Clients & Depts" active={isActive('/admin/clients')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Recruitment</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/applications" icon={UserPlus} label="Applications" badge={onboardingBadge} active={isActive('/admin/applications')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'FIN' && (
                <div className="space-y-4">
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Invoicing</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/billing" icon={PoundSterling} label="Finance Hub" active={location.pathname === '/admin/billing'} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/billing/client-invoices" icon={CreditCard} label="Client Invoices" active={isActive('/admin/billing/client-invoices')} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/billing/interpreter-invoices" icon={PoundSterling} label="Payments" active={isActive('/admin/billing/interpreter-invoices')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Accounting</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/finance/statements" icon={FileText} label="Statements" active={isActive('/admin/finance/statements')} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/finance/payroll" icon={PoundSterling} label="Payroll" active={isActive('/admin/finance/payroll')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Reports</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/finance/documents" icon={Database} label="Data Center" active={isActive('/admin/finance/documents')} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/finance/reports" icon={BarChart3} label="Financial Reports" active={isActive('/admin/finance/reports')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'COMMS' && (
                <div className="space-y-4">
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Messaging</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/messages" icon={MessageSquare} label="Messages" badge={totalUnread} active={isActive('/admin/messages')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Templates</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/settings/email-templates" icon={Mail} label="Email Templates" active={isActive('/admin/settings/email-templates')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'ADMIN' && (
                <div className="space-y-4">
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">Users</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/users" icon={UserCog} label="Users & Roles" active={isActive('/admin/users')} isCollapsed={isSecondarySlim} />
                    </div>
                  </div>
                  <div>
                    {!isSecondarySlim && <div className="sidebar-group-label !px-2">System</div>}
                    <div className="space-y-1">
                      <NavItem to="/admin/settings" icon={Settings} label="System Config" active={location.pathname === '/admin/settings'} isCollapsed={isSecondarySlim} />
                      <NavItem to="/admin/system/audit-log" icon={History} label="Audit Logs" active={isActive('/admin/system/audit-log')} isCollapsed={isSecondarySlim} />
                      {user?.role === UserRole.SUPER_ADMIN && (
                        <NavItem to="/admin/administration/data" icon={ShieldCheck} label="Data Orchestration" active={isActive('/admin/administration/data')} isCollapsed={isSecondarySlim} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={toggleSecondaryCollapse}
                className={`w-full flex items-center ${isSecondarySlim ? 'justify-center' : 'space-x-2'} text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors`}
              >
                {isSecondarySlim ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                {!isSecondarySlim && <span>Collapse Sidebar</span>}
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 -ml-2 mr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* System Status Integration */}
            <div className="hidden md:flex items-center space-x-3 text-slate-500">
               <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">{today}</span>
               <div className="group relative">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse cursor-help" />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase mb-1 tracking-wider">System Engine Status</p>
                    <p className="text-[9px] text-slate-500 leading-tight">All systems operational. Low latency detected in Terminal One.</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-100 dark:border-slate-800 pl-6">
              <ThemeToggle className="!p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" />
              <NotificationCenter />
            </div>
            
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
                   {user?.displayName?.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col items-start transition-opacity duration-200">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">{user?.displayName}</span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-bold">
                       {user?.displayName?.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate">{user?.displayName}</span>
                      <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                    </div>
                  </div>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <UserIcon size={16} />
                    <span>View Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-hide bg-slate-50 dark:bg-slate-950">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};