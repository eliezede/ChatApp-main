import React from 'react';
import { Database, Download, Upload, Shield, Activity, Search, RefreshCw, Key, Settings2 } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';

export const DataCenter = () => {
    const mockLogs = [
        { id: '1', event: 'Bulk Invoice Sync', user: 'Admin User', time: '10 mins ago', status: 'SUCCESS' },
        { id: '2', event: 'Interpreter Data Import', user: 'System Bot', time: '1 hour ago', status: 'WARNING' },
        { id: '3', event: 'Tenant Config Update', user: 'Super Admin', time: '03:45 AM', status: 'SUCCESS' },
    ];

    const logColumns = [
        { header: 'Event Name', accessor: 'event' },
        { header: 'Executed By', accessor: 'user' },
        { header: 'Timestamp', accessor: 'time' },
        {
            header: 'Status', accessor: (row: any) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${row.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Data Center" subtitle="Administration and system integrity hub" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Operational Actions */}
                    <div className="grid grid-cols-3 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm hover:border-blue-500 transition-all hover:shadow-lg group">
                            <Upload className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bulk Import</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm hover:border-blue-500 transition-all hover:shadow-lg group">
                            <Download className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Export</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm hover:border-blue-500 transition-all hover:shadow-lg group">
                            <RefreshCw className="text-blue-500 mb-3 group-hover:rotate-180 duration-700 transition-transform" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Schema Sync</span>
                        </button>
                    </div>

                    {/* Audit Logs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Audit Logs</h3>
                            <Button variant="outline" size="sm" className="h-7 text-[10px]">View Full History</Button>
                        </div>
                        <Table
                            data={mockLogs}
                            columns={logColumns as any}
                            emptyMessage="No audit logs recorded."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10">
                        <Shield className="text-blue-500 mb-4" size={24} />
                        <h3 className="text-lg font-black mb-2">Platform Integrity</h3>
                        <p className="text-white/50 text-xs mb-6">Last security sweep completed 4 hours ago. 0 vulnerabilities found.</p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Run Health Check</Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">API & Integrations</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <Key size={14} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold dark:text-white">Webhook Endpoint</p>
                                    <p className="text-[10px] text-slate-500">Active - 240 req/hr</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <Button variant="outline" size="sm" className="w-full" icon={Settings2}>Manage Integration Keys</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
