import React from 'react';
import { ClipboardList, Terminal, User, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Table } from '../../../components/ui/Table';

export const AuditLog = () => {
    const mockLogs = [
        { id: '1', event: 'Bulk Invoice Sync', user: 'Admin User', time: '10 mins ago', status: 'SUCCESS', impact: 'High', description: 'Synchronized 42 invoices with Sage accounting.' },
        { id: '2', event: 'Interpreter Data Import', user: 'System Bot', time: '1 hour ago', status: 'WARNING', impact: 'Medium', description: 'Imported 15 professionals; 2 records had duplicate emails.' },
        { id: '3', event: 'Tenant Config Update', user: 'Super Admin', time: '03:45 AM', status: 'SUCCESS', impact: 'Critical', description: 'Updated global cancellation policy settings.' },
        { id: '4', event: 'User Role Escalation', user: 'Security Bot', time: 'Yesterday', status: 'SUCCESS', impact: 'High', description: 'Promoted user eliez@lingland.com to Administrator.' },
        { id: '5', event: 'Email Gateway Flush', user: 'Cron Job', time: 'Yesterday', status: 'SUCCESS', impact: 'Low', description: 'Cleared 300 pending notification emails from queue.' },
    ];

    const logColumns = [
        {
            header: 'Event', accessor: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${row.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Terminal size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">{row.event}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{row.description}</span>
                    </div>
                </div>
            )
        },
        { 
            header: 'Initiator', accessor: (row: any) => (
                <div className="flex items-center gap-2">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{row.user}</span>
                </div>
            )
        },
        { 
            header: 'Time', accessor: (row: any) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-slate-500 text-[10px] font-bold italic">{row.time}</span>
                </div>
            )
        },
        {
            header: 'Status', accessor: (row: any) => (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                    row.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="System Audit Logs" subtitle="Permanent record of administrative actions and system mutations" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Table
                            data={mockLogs}
                            columns={logColumns as any}
                            emptyMessage="No mutation trace detected."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                        <ShieldCheck size={32} className="mb-4 opacity-80" />
                        <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">Integrity Monitoring</h3>
                        <p className="text-indigo-100 text-xs mt-2 leading-relaxed">
                            Audit logs are immutable and captured at the infrastructure layer. Any modification to security settings triggers a high-priority alert.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Retention Policy</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                            Current records are retained for **365 days** as per GDPR compliance guidelines for administrative tracing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
