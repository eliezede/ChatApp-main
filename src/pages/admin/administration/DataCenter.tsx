import React from 'react';
import { Database, Download, Upload, Shield, Activity, Search, RefreshCw, Key, Settings2, Terminal, Cpu, HardDrive } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

const SystemPulse = () => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
        <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-pulse" />
        <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-700">
            <Activity className="text-blue-600" size={32} />
        </div>
    </div>
);

export const DataCenter = () => {
    const mockLogs = [
        { id: '1', event: 'Bulk Invoice Sync', user: 'Admin User', time: '10 mins ago', status: 'SUCCESS', impact: 'High' },
        { id: '2', event: 'Interpreter Data Import', user: 'System Bot', time: '1 hour ago', status: 'WARNING', impact: 'Medium' },
        { id: '3', event: 'Tenant Config Update', user: 'Super Admin', time: '03:45 AM', status: 'SUCCESS', impact: 'Critical' },
        { id: '4', event: 'Email Gateway Flush', user: 'Cron Job', time: 'Yesterday', status: 'SUCCESS', impact: 'Low' },
    ];

    const logColumns = [
        {
            header: 'Orchestration Event', accessor: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${row.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Terminal size={14} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">{row.event}</span>
                </div>
            )
        },
        { header: 'Initiator', accessor: 'user' },
        { header: 'Relative Time', accessor: (row: any) => <span className="text-slate-500 text-[10px] font-bold italic">{row.time}</span> },
        {
            header: 'Status', accessor: (row: any) => (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${row.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-20">
            <PageHeader title="Database Orchestration" subtitle="Infrastructure control, bulk operations, and system integrity">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={Shield} className="h-9 px-4 uppercase text-[9px] font-black tracking-widest border-slate-200">Security Vault</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* System Health Card */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                    <SystemPulse />
                    <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Pulse</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Operational State: Nominal</p>

                    <div className="w-full mt-8 space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Cpu size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compute</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">12%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <HardDrive size={14} className="text-indigo-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">64.2GB</span>
                        </div>
                    </div>

                    <Button className="w-full mt-8 bg-slate-900 hover:bg-black text-white rounded-2xl h-12 uppercase text-[10px] font-black tracking-[0.2em] shadow-lg shadow-slate-200">Run Diagnostics</Button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Operational Commands */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Bulk Import', icon: Upload, count: '1.2k rows/min' },
                            { label: 'Full Export', icon: Download, count: 'JSON/CSV/SQL' },
                            { label: 'Schema Sync', icon: RefreshCw, count: 'v2.4.0 Optimized' },
                        ].map((cmd, i) => (
                            <button key={i} className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm hover:border-blue-500 transition-all hover:shadow-xl group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                    <cmd.icon size={20} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{cmd.label}</span>
                                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">{cmd.count}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Infrastructure Audit */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Infrastructure Audit stream</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time trace of administrative mutations</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-blue-600">Flush Logs</Button>
                        </div>
                        <Table
                            data={mockLogs}
                            columns={logColumns as any}
                            emptyMessage="No mutation trace detected."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
