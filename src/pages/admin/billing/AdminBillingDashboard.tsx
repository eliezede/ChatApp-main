
import React, { useEffect, useState } from 'react';
import { BillingService } from '../../../services/billingService';
import { FileText, PoundSterling, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminBillingDashboard = () => {
  const [stats, setStats] = useState<any>({
    pendingClientInvoices: 0,
    pendingClientAmount: 0,
    pendingInterpreterInvoices: 0,
    pendingTimesheets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await BillingService.getDashboardStats();
        setStats(data || {
          pendingClientInvoices: 0,
          pendingClientAmount: 0,
          pendingInterpreterInvoices: 0,
          pendingTimesheets: 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cross-domain financial visibility and invoice management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Client Invoicing */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">Revenue Stream</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Pending Invoices</p>
              {loading ? <Skeleton className="h-8 w-12 mt-2" /> : (
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.pendingClientInvoices}</h3>
              )}
            </div>
            <div className="p-3 bg-slate-900 dark:bg-slate-800 rounded-xl text-white shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight mb-1">Total Pipeline</p>
            {loading ? <Skeleton className="h-6 w-24" /> : (
              <p className="text-lg font-black text-slate-700 dark:text-slate-300">£{stats.pendingClientAmount?.toFixed(2) || '0.00'}</p>
            )}
          </div>
          <Link to="/admin/billing/client-invoices" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-900 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-800 hover:text-white transition-colors">
            <span>Client Invoices</span>
            <span className="text-lg">&rarr;</span>
          </Link>
        </div>

        {/* Card 2: Interpreter Invoicing */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">Payout Pipeline</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Interpreter Claims</p>
              {loading ? <Skeleton className="h-8 w-12 mt-2" /> : (
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.pendingInterpreterInvoices}</h3>
              )}
            </div>
            <div className="p-3 bg-indigo-900 dark:bg-indigo-950 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight mb-1">Status</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-300">Awaiting processing</p>
          </div>
          <Link to="/admin/billing/interpreter-invoices" className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-900 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-900 dark:hover:bg-indigo-900 hover:text-white transition-colors">
            <span>Review Claims</span>
            <span className="text-lg">&rarr;</span>
          </Link>
        </div>

        {/* Card 3: Timesheets */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">Verification</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Pending Timesheets</p>
              {loading ? <Skeleton className="h-8 w-12 mt-2" /> : (
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.pendingTimesheets}</h3>
              )}
            </div>
            <div className="p-3 bg-emerald-900 dark:bg-emerald-950 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight mb-1">Workflow</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-300">Audit in progress</p>
          </div>
          <Link to="/admin/operations/timesheets" className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-900 dark:text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-900 dark:hover:bg-emerald-900 hover:text-white transition-colors">
            <span>Audit Timesheets</span>
            <span className="text-lg">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
