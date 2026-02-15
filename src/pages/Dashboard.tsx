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

// --- Components ---

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color, onClick }: any) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={22} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
          {trendUp ? '+' : ''}{trend}
          {trendUp ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowUpRight size={12} className="ml-1 rotate-90" />}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

const ActivityTable = ({ title, data }: { title: string, data: any[] }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
      <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 text-xs uppercase font-bold text-slate-500">
          <tr>
            <th className="px-6 py-4">Client / Service</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date & Time</th>
            <th className="px-6 py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3 border border-slate-200">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.service}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                  ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-900 font-medium">{item.date}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </td>
              <td className="px-6 py-4 text-right">
                <p className="text-sm font-bold text-slate-900">{item.amount}</p>
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

  useEffect(() => {
    const loadData = async () => {
      try {
        let currentStats;
        if (user?.role === UserRole.ADMIN) {
          currentStats = await StatsService.getAdminStats();
        } else if (user?.role === UserRole.CLIENT) {
          currentStats = await StatsService.getClientStats(user.profileId || user.id);
        } else if (user?.role === UserRole.INTERPRETER) {
          currentStats = await StatsService.getInterpreterStats(user.profileId || user.id);
        }

        if (currentStats) setStats(currentStats);

        const recent = await BookingService.getRecentBookings(5);
        setRecentByRole(recent.map((b: Booking) => ({
          name: b.clientName || 'Guest',
          service: `${b.languageTo} Interpreting`,
          status: b.status.toLowerCase(),
          date: b.date,
          time: b.startTime,
          amount: b.totalAmount ? `£${b.totalAmount.toFixed(2)}` : 'N/A',
          avatar: (b.clientName || 'G').substring(0, 2).toUpperCase()
        })));
      } catch (e) {
        console.error("Dashboard data load failed", e);
      }
    };
    loadData();
  }, [user]);

  if (!stats) return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
    </div>
  );

  // Mock Data for Charts (Keep for now as true historical data requires time to build)
  const engagementData = [
    { name: 'Week 1', value: 45 },
    { name: 'Week 2', value: 52 },
    { name: 'Week 3', value: 38 },
    { name: 'Week 4', value: 65 },
  ];

  /* --- Admin View --- */
  const renderAdminDashboard = () => (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time platform insights and performance.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center">
            <Download size={16} className="mr-2" /> Export Report
          </button>
          <button onClick={() => navigate('/admin/bookings')} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center">
            <UserPlus size={16} className="mr-2" /> New Request
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings || 0}
          trend="12%"
          trendUp={true}
          icon={CalendarDays}
          color="bg-blue-600"
          onClick={() => navigate('/admin/bookings')}
        />
        <StatCard
          title="Active Interpreters"
          value={stats.activeInterpreters}
          trend="5%"
          trendUp={true}
          icon={Users}
          color="bg-indigo-600"
          onClick={() => navigate('/admin/interpreters')}
        />
        <StatCard
          title="Monthly Revenue"
          value={`£${stats.revenueMonth.toLocaleString()}`}
          trend="8%"
          trendUp={true}
          icon={PoundSterling}
          color="bg-emerald-600"
          onClick={() => navigate('/admin/billing')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          trend="3"
          trendUp={false}
          icon={AlertCircle}
          color="bg-orange-500"
          onClick={() => navigate('/admin/bookings')}
        />
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Engagement Volume</h3>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-500 uppercase px-3 py-1.5 outline-none hover:bg-slate-100 transition-colors">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="font-bold text-lg mb-1">Quick Actions</h3>
            <p className="text-slate-400 text-xs mb-6">Common administrative tasks.</p>

            <div className="space-y-3">
              <button onClick={() => navigate('/admin/bookings')} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center transition-colors border border-white/5">
                <Briefcase size={18} className="mr-3 text-blue-400" /> Manage Bookings
              </button>
              <button onClick={() => navigate('/admin/timesheets')} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center transition-colors border border-white/5">
                <Clock size={18} className="mr-3 text-emerald-400" /> Review Timesheets
              </button>
              <button onClick={() => navigate('/admin/settings')} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center transition-colors border border-white/5">
                <Settings size={18} className="mr-3 text-slate-400" /> System Settings
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Onboarding Pipeline</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors group" onClick={() => navigate('/admin/applications')}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-bold">1</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">New Application</p>
                  <p className="text-xs text-slate-500">Awaiting review</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <ActivityTable title="Recent Booking Requests" data={recentByRole} />
    </div>
  );

  /* --- Client View --- */
  const renderClientDashboard = () => (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Client Hub</h1>
        <p className="text-slate-500 font-medium">Welcome back, {user?.displayName}. Here's your account summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Upcoming Bookings" value={recentByRole.length} icon={CalendarDays} color="bg-blue-600" onClick={() => navigate('/client/bookings')} />
        <StatCard title="Invoices Due" value={stats.unpaidInvoices || 0} icon={PoundSterling} color="bg-orange-500" onClick={() => navigate('/client/invoices')} />
        <StatCard title="Completed Jobs" value={stats.completedBookings || 0} icon={Activity} color="bg-emerald-600" onClick={() => navigate('/client/bookings')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ActivityTable title="My Booking History" data={recentByRole} />
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
          <h3 className="font-bold text-xl mb-2">Need an Interpreter?</h3>
          <p className="text-indigo-100 text-sm mb-6">Book a certified professional in less than 2 minutes.</p>
          <button onClick={() => navigate('/client/new-booking')} className="w-full py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-indigo-50 flex items-center justify-center">
            <UserPlus size={18} className="mr-2" /> Book Now
          </button>
        </div>
      </div>
    </div>
  );

  /* --- Interpreter View --- */
  const renderInterpreterDashboard = () => (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interpreter Portal</h1>
        <p className="text-slate-500 font-medium">Hello, {user?.displayName?.split(' ')[0]}. Manage your schedule and earnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Job Offers" value={recentByRole.filter((b: any) => b.status === 'offered').length} trend="New" trendUp={true} icon={Briefcase} color="bg-blue-600" onClick={() => navigate('/interpreter/offers')} />
        <StatCard title="Upcoming Jobs" value={recentByRole.filter((b: any) => b.status === 'confirmed').length} icon={CalendarDays} color="bg-indigo-600" onClick={() => navigate('/interpreter/jobs')} />
        <StatCard title="Total Earnings" value={stats.earnings ? `£${stats.earnings.toFixed(2)}` : '£0.00'} trend="8%" trendUp={true} icon={PoundSterling} color="bg-emerald-600" onClick={() => navigate('/interpreter/billing')} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-6 font-display uppercase tracking-widest text-xs">Live Opportunities</h3>
        <div className="space-y-4">
          {recentByRole.filter((b: any) => b.status === 'offered').length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium">No live offers currently.</div>
          ) : (
            recentByRole.filter((b: any) => b.status === 'offered').map((offer: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mr-4 font-bold border border-slate-100">
                    {offer.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{offer.service}</h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                      <CalendarDays size={12} className="mr-1" /> {offer.date}, {offer.time}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button onClick={() => navigate('/interpreter/offers')} className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Accept</button>
                  <button onClick={() => navigate('/interpreter/offers')} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">Details</button>
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={() => navigate('/interpreter/offers')} className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100">
          View All Offers
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {user?.role === UserRole.ADMIN && renderAdminDashboard()}
      {user?.role === UserRole.CLIENT && renderClientDashboard()}
      {user?.role === UserRole.INTERPRETER && renderInterpreterDashboard()}
    </div>
  );
};
