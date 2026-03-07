import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookingService, StatsService } from '../services/api';
import { UserRole, Booking } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  Activity, Users, AlertCircle, PoundSterling, CalendarDays, Settings,
  ArrowUpRight, FileText, UserPlus, ChevronRight, Briefcase,
  Clock, CheckCircle2, XCircle, Search, Filter, Download, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { InterpreterAllocationDrawer } from '../components/operations/InterpreterAllocationDrawer';
import { InterpreterPreviewDrawer } from '../components/operations/InterpreterPreviewDrawer';

// --- Components ---

const MetricSkeleton = () => (
  <div className="flex items-center gap-3 md:border-l border-slate-100 md:pl-8">
    <div className="space-y-1">
      <Skeleton className="h-2 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-3 w-8 rounded-full" />
  </div>
);

const HighDensityActivityTable = ({ title, data, loading }: { title: string, data: any[], loading?: boolean }) => (
  <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0 min-h-[400px]">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white overflow-hidden">
      <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] shrink-0">{title}</h3>
      <div className="flex gap-2">
        <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <Filter size={16} />
        </button>
      </div>
    </div>
    <div className="overflow-x-auto custom-scrollbar flex-1">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No activity found.</td></tr>
          ) : data.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/80 group transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black uppercase border border-slate-200">
                    {item.avatar}
                  </div>
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{item.service}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                  ${item.status === 'completed' || item.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    item.status === 'pending' || item.status === 'incoming' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                  {item.date} <span className="text-[10px] text-slate-300 font-normal">|</span> {item.time}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-xs font-black text-slate-900 whitespace-nowrap">
                {item.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main Dashboard Implementation ---

export const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentByRole, setRecentByRole] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer State
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInterpId, setSelectedInterpId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      let currentStats;
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
        currentStats = await StatsService.getAdminStats();
      } else if (user?.role === UserRole.CLIENT) {
        currentStats = await StatsService.getClientStats(user.profileId || user.id);
      } else if (user?.role === UserRole.INTERPRETER) {
        currentStats = await StatsService.getInterpreterStats(user.profileId || user.id);
      }

      if (currentStats) setStats(currentStats);

      const recent = await BookingService.getRecentBookings(10);
      setRecentByRole(recent.map((b: Booking) => ({
        id: b.id,
        name: b.clientName || 'Guest',
        service: `${b.languageTo} Interpreting`,
        status: b.status.toLowerCase(),
        date: b.date,
        rawDate: b.date,
        time: b.startTime,
        amount: b.totalAmount ? `£${b.totalAmount.toFixed(2)}` : 'N/A',
        avatar: (b.clientName || 'G').substring(0, 2).toUpperCase(),
        interpreterId: b.interpreterId,
        interpreterName: b.interpreterName,
        rawBooking: b
      })));
    } catch (e) {
      console.error("Dashboard data load failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Mock Data for Charts (Keep for now as true historical data requires time to build)
  const engagementData = [
    { name: 'Week 1', value: 45 },
    { name: 'Week 2', value: 52 },
    { name: 'Week 3', value: 38 },
    { name: 'Week 4', value: 65 },
  ];

  /* --- Admin View --- */
  const renderAdminDashboard = () => {
    const today = new Date().toISOString().split('T')[0];

    // Derive operational data from real bookings
    const unassigned = recentByRole.filter((b: any) => b.status === 'incoming');
    const todaysJobs = recentByRole.filter((b: any) => b.rawDate === today);
    const pendingConfirm = recentByRole.filter((b: any) => b.status === 'opened');

    const byStatus = {
      incoming: recentByRole.filter((b: any) => b.status === 'incoming').length,
      opened: recentByRole.filter((b: any) => b.status === 'opened').length,
      booked: recentByRole.filter((b: any) => b.status === 'booked').length,
      invoicing: recentByRole.filter((b: any) => b.status === 'invoicing').length,
      invoiced: recentByRole.filter((b: any) => b.status === 'invoiced').length,
      paid: recentByRole.filter((b: any) => b.status === 'paid').length,
    };

    return (
      <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-50">
        <PageHeader
          title="Terminal One"
          subtitle="Enterprise operational intelligence dashboard."
        >
          <Button
            onClick={() => navigate('/admin/bookings/new')}
            icon={UserPlus}
            size="sm"
          >
            New Request
          </Button>
          <Button
            onClick={() => navigate('/admin/bookings')}
            variant="secondary"
            icon={Briefcase}
            size="sm"
          >
            All Bookings
          </Button>
          <Button
            onClick={() => navigate('/admin/interpreters')}
            variant="secondary"
            icon={Users}
            size="sm"
          >
            Interpreters
          </Button>
        </PageHeader>

        {/* KPI Ribbon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-8 py-5 flex flex-wrap items-center gap-x-12 gap-y-4 mb-8 shadow-sm mx-4 sm:mx-0">
          {loading ? (
            Array(5).fill(0).map((_, i) => <MetricSkeleton key={i} />)
          ) : [
            { label: 'Total Volume', value: stats?.totalBookings || 0, badge: '+12%', badgeColor: 'text-emerald-600 bg-emerald-50' },
            { label: 'Network Size', value: stats?.activeInterpreters || 0, badge: '+5%', badgeColor: 'text-emerald-600 bg-emerald-50' },
            { label: 'Incoming', value: stats?.pendingRequests || 0, badge: byStatus.incoming > 0 ? `${byStatus.incoming} urgent` : 'Clear', badgeColor: byStatus.incoming > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50' },
            { label: 'Gross Revenue', value: `£${(stats?.revenueMonth || 0).toLocaleString()}`, badge: 'MTD', badgeColor: 'text-slate-500 bg-slate-100' },
            { label: 'Outstanding', value: stats?.unpaidInvoices || 0, badge: stats?.unpaidInvoices > 0 ? 'Review' : 'Nominal', badgeColor: stats?.unpaidInvoices > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-100' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'md:border-l border-slate-100 md:pl-8' : ''}`}>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{m.label}</div>
                <div className="text-lg font-black text-slate-900 mt-1 leading-none">{m.value}</div>
              </div>
              <div className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${m.badgeColor}`}>{m.badge}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-auto">

          {/* Left: Main operational area */}
          <div className="flex-1 p-4 space-y-4 min-w-0">

            {/* 🚨 Urgent Attention Zone */}
            {(unassigned.length > 0 || pendingConfirm.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-amber-600" />
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Action Required</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unassigned.length > 0 && (
                    <button
                      onClick={() => navigate('/admin/operations/assignments')}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 hover:border-amber-400 rounded-lg text-left transition-all group shadow-sm"
                    >
                      <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">{unassigned.length}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Unassigned Bookings</p>
                        <p className="text-[10px] text-slate-500">Need interpreter assignment →</p>
                      </div>
                    </button>
                  )}
                  {pendingConfirm.length > 0 && (
                    <button
                      onClick={() => navigate('/admin/bookings')}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 hover:border-blue-400 rounded-lg text-left transition-all group shadow-sm"
                    >
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">{pendingConfirm.length}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Pending Confirmation</p>
                        <p className="text-[10px] text-slate-500">Interpreter assigned, awaiting confirm →</p>
                      </div>
                    </button>
                  )}
                  {stats?.unpaidInvoices > 0 && (
                    <button
                      onClick={() => navigate('/admin/client-invoices')}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-violet-200 hover:border-blue-700/30 hover:shadow-lg hover:shadow-blue-900/5 rounded-xl text-left transition-all group shadow-sm"
                    >
                      <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-900/20">{stats.unpaidInvoices}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Settlements Pending</p>
                        <p className="text-[9px] text-slate-400 font-bold">Unpaid client receivables →</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 📊 Booking Pipeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Booking Pipeline</h3>
                <button onClick={() => navigate('/admin/bookings')} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </button>
              </div>
              <div className="p-3 flex gap-2 overflow-x-auto">
                {[
                  { label: 'Incoming', count: byStatus.incoming, color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', path: '/admin/bookings' },
                  { label: 'Opened', count: byStatus.opened, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', path: '/admin/bookings' },
                  { label: 'Booked', count: byStatus.booked, color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', path: '/admin/bookings' },
                  { label: 'Invoicing', count: byStatus.invoicing, color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', path: '/admin/timesheets' },
                  { label: 'Invoiced', count: byStatus.invoiced, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', path: '/admin/client-invoices' },
                  { label: 'Paid', count: byStatus.paid, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400', path: '/admin/client-invoices' },
                ].map((stage, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(stage.path)}
                    className={`flex flex-col items-center min-w-[90px] p-3 rounded-xl border ${stage.color} hover:opacity-80 transition-opacity cursor-pointer`}
                  >
                    <div className="text-2xl font-black leading-none">{stage.count}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}></div>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{stage.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 📋 Recent Bookings — FULLY CLICKABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Bookings</h3>
                <button onClick={() => navigate('/admin/bookings')} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Manage All <ChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interpreter</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentByRole.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">No bookings found.</td></tr>
                    ) : recentByRole.map((item: any, i: number) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 group transition-colors cursor-pointer"
                        onClick={() => item.id && navigate(`/admin/bookings/${item.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-[10px] font-bold uppercase">
                              {item.avatar}
                            </div>
                            <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{item.service}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                            ${item.status === 'paid' || item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              item.status === 'incoming' ? 'bg-red-50 text-red-700 border border-red-200' :
                                item.status === 'opened' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  item.status === 'booked' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.interpreterId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterpId(item.interpreterId);
                                setSelectedJob(item.rawBooking);
                                setIsPreviewOpen(true);
                              }}
                              className="flex items-center text-xs font-bold text-blue-600 hover:underline"
                            >
                              {item.interpreterName}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(item.rawBooking);
                                setIsAllocationOpen(true);
                              }}
                              className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 hover:bg-amber-100 transition-colors"
                            >
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                            <Clock size={11} className="text-slate-400" />
                            {item.date} <span className="text-slate-300">•</span> {item.time}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-800 whitespace-nowrap">{item.amount}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Manage →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Action Panel */}
          <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col shrink-0">

            {/* Financial Snapshot */}
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <PoundSterling size={12} /> Financial Snapshot
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Revenue MTD', value: stats ? `£${(stats.revenueMonth || 0).toLocaleString()}` : '£---', path: '/admin/client-invoices', color: 'text-emerald-700' },
                  { label: 'Invoices Unpaid', value: stats ? `${stats.unpaidInvoices || 0} pending` : '---', path: '/admin/client-invoices', color: (stats?.unpaidInvoices || 0) > 0 ? 'text-amber-700' : 'text-slate-600' },
                  { label: 'Active Timesheets', value: `${byStatus.invoicing} awaiting`, path: '/admin/timesheets', color: byStatus.invoicing > 0 ? 'text-violet-700' : 'text-slate-600' },
                ].map((row, i) => (
                  <button key={i} onClick={() => navigate(row.path)} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <span className="text-xs text-slate-600 font-medium">{row.label}</span>
                    <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Navigate</h3>
              <div className="space-y-1">
                {[
                  { label: 'Manage Bookings', icon: Briefcase, path: '/admin/bookings', color: 'text-blue-600' },
                  { label: 'Interpreters Matrix', icon: Users, path: '/admin/interpreters', color: 'text-indigo-600' },
                  { label: 'Client Database', icon: FileText, path: '/admin/clients', color: 'text-violet-600' },
                  { label: 'Review Timesheets', icon: Clock, path: '/admin/timesheets', color: 'text-emerald-600' },
                  { label: 'Applications', icon: UserPlus, path: '/admin/applications', color: 'text-amber-600' },
                  { label: 'System Settings', icon: Settings, path: '/admin/settings', color: 'text-slate-600' },
                ].map((item, i) => (
                  <button key={i} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                    <div className="flex items-center gap-2.5">
                      <item.icon size={14} className={item.color} />
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* System Alerts */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">System Alerts</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/admin/applications')} className="w-full flex gap-3 p-2.5 hover:bg-slate-50 rounded-lg -mx-0 transition-colors text-left group">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <p className="text-[11px] text-slate-700 font-semibold leading-tight">New Application</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">1 interpreter application awaiting review</p>
                    <p className="text-[10px] text-blue-600 font-bold mt-1 group-hover:underline">Review Now →</p>
                  </div>
                </button>
                {byStatus.incoming > 0 && (
                  <button onClick={() => navigate('/admin/bookings')} className="w-full flex gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                    <div>
                      <p className="text-[11px] text-slate-700 font-semibold leading-tight">{byStatus.incoming} Unassigned Jobs</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Require interpreter assignment</p>
                      <p className="text-[10px] text-red-600 font-bold mt-1 group-hover:underline">Assign Now →</p>
                    </div>
                  </button>
                )}
                {byStatus.invoicing > 0 && (
                  <button onClick={() => navigate('/admin/timesheets')} className="w-full flex gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-violet-500 shrink-0"></div>
                    <div>
                      <p className="text-[11px] text-slate-700 font-semibold leading-tight">{byStatus.invoicing} Timesheets Pending</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ready for invoice generation</p>
                      <p className="text-[10px] text-violet-600 font-bold mt-1 group-hover:underline">Process Now →</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  /* --- Client View --- */
  const renderClientDashboard = () => (
    <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <PageHeader
        title="Client Terminal"
        subtitle={`Welcome back, ${user?.displayName || 'User'}`}
      >
        <Button onClick={() => navigate('/client/new-booking')} icon={UserPlus} size="sm">New Booking</Button>
      </PageHeader>

      {/* Metrics Ribbon */}
      <div className="bg-white border border-slate-200 rounded-3xl px-8 py-5 flex flex-wrap items-center gap-x-12 gap-y-4 mb-8 shadow-sm mx-4 sm:mx-0">
        {loading ? (
          Array(3).fill(0).map((_, i) => <MetricSkeleton key={i} />)
        ) : [
          { label: 'Pipeline Volume', value: recentByRole.length, badge: 'Live', badgeColor: 'text-blue-600 bg-blue-50' },
          { label: 'Outstanding Balance', value: stats?.unpaidInvoices || 0, badge: 'Due', badgeColor: (stats?.unpaidInvoices || 0) > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50' },
          { label: 'Historical Jobs', value: stats?.completedBookings || 0, badge: 'Total', badgeColor: 'text-emerald-600 bg-emerald-50' },
        ].map((m, i) => (
          <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'md:border-l border-slate-100 md:pl-8' : ''}`}>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{m.label}</div>
              <div className="text-lg font-black text-slate-900 mt-1 leading-none">{m.value}</div>
            </div>
            <div className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${m.badgeColor}`}>{m.badge}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <HighDensityActivityTable title="Booking History" data={recentByRole} loading={loading} />
        </div>
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Enterprise Suite</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Book certified linguistic professionals with sub-2 minute latency.</p>
            <Button onClick={() => navigate('/client/new-booking')} className="w-full justify-center shadow-lg shadow-blue-100" icon={UserPlus}>Request Service</Button>
          </div>
        </aside>
      </div>
    </div>
  );

  /* --- Interpreter View --- */
  const renderInterpreterDashboard = () => (
    <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <PageHeader
        title="Agent Interface"
        subtitle={`Session active for ${user?.displayName?.split(' ')[0] || 'Agent'}`}
      >
        <Button onClick={() => navigate('/interpreter/jobs')} variant="secondary" icon={Briefcase} size="sm">Browse Jobs</Button>
      </PageHeader>

      {/* Metrics Ribbon */}
      <div className="bg-white border border-slate-200 rounded-3xl px-8 py-5 flex flex-wrap items-center gap-x-12 gap-y-4 mb-8 shadow-sm mx-4 sm:mx-0">
        {loading ? (
          Array(3).fill(0).map((_, i) => <MetricSkeleton key={i} />)
        ) : [
          { label: 'Active Offers', value: recentByRole.filter((b: any) => b.status === 'offered').length, badge: 'New', badgeColor: 'text-blue-600 bg-blue-50' },
          { label: 'Booked Sessions', value: recentByRole.filter((b: any) => b.status === 'confirmed').length, badge: 'Active', badgeColor: 'text-indigo-600 bg-indigo-50' },
          { label: 'Settled Earnings', value: `£${(stats?.earnings || 0).toLocaleString()}`, badge: 'Total', badgeColor: 'text-emerald-600 bg-emerald-50' },
        ].map((m, i) => (
          <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'md:border-l border-slate-100 md:pl-8' : ''}`}>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{m.label}</div>
              <div className="text-lg font-black text-slate-900 mt-1 leading-none">{m.value}</div>
            </div>
            <div className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${m.badgeColor}`}>{m.badge}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <HighDensityActivityTable title="Upcoming Rota" data={recentByRole.filter((b: any) => b.status === 'confirmed' || b.status === 'completed')} loading={loading} />
        </div>

        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Market Opportunities</h3>
            <div className="space-y-4">
              {recentByRole.filter((b: any) => b.status === 'offered').length === 0 ? (
                <div className="text-xs text-slate-400 py-12 text-center font-bold uppercase tracking-widest border border-dashed border-slate-200 rounded-2xl">No open offers</div>
              ) : (
                recentByRole.filter((b: any) => b.status === 'offered').map((offer: any, i: number) => (
                  <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-xs text-slate-900">{offer.service}</h4>
                      <span className="text-[9px] font-black bg-blue-900 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm group-hover:scale-110 transition-transform">Live</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold flex items-center mb-4">
                      <CalendarDays size={12} className="mr-2 text-blue-500" /> {offer.date} <span className="mx-2 text-slate-200">|</span> {offer.time}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/interpreter/offers')} className="flex-1 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-black transition-colors uppercase tracking-widest shadow-lg shadow-slate-100">Accept</button>
                      <button onClick={() => navigate('/interpreter/offers')} className="flex-1 py-2 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-widest border border-slate-100">Details</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && renderAdminDashboard()}
      {user?.role === UserRole.CLIENT && renderClientDashboard()}
      {user?.role === UserRole.INTERPRETER && renderInterpreterDashboard()}

      {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && selectedJob && (
        <>
          <InterpreterAllocationDrawer
            isOpen={isAllocationOpen}
            onClose={() => setIsAllocationOpen(false)}
            job={selectedJob}
            onSuccess={() => loadData()}
          />
          <InterpreterPreviewDrawer
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            interpreterId={selectedInterpId}
            jobId={selectedJob.id}
            onSuccess={() => loadData()}
          />
        </>
      )}
    </div>
  );
};
