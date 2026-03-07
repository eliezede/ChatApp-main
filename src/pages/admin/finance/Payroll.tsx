import React, { useState } from 'react';
import { Receipt, DollarSign, UserCheck, Search, Filter, X, CreditCard, Calendar, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/StatusBadge';
import { Badge } from '../../../components/ui/Badge';

interface PayrollRecord {
    id: string;
    interpreter: string;
    jobs: number;
    total: string;
    status: string;
}

export const Payroll = () => {
    const [drawerItem, setDrawerItem] = useState<PayrollRecord | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const mockPayroll: PayrollRecord[] = [
        { id: '1', interpreter: 'John Doe', jobs: 12, total: '£640.00', status: 'PENDING' },
        { id: '2', interpreter: 'Jane Smith', jobs: 8, total: '£420.00', status: 'AUTHORIZED' },
        { id: '3', interpreter: 'Robert Brown', jobs: 15, total: '£850.00', status: 'PAID' },
    ];

    const columns: Array<{ header: string, accessor: keyof PayrollRecord | ((item: PayrollRecord) => React.ReactNode) }> = [
        {
            header: 'Interpreter',
            accessor: (row: PayrollRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                        {row.interpreter.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">{row.interpreter}</span>
                </div>
            )
        },
        { header: 'Job Count', accessor: (row: PayrollRecord) => <span className="font-bold text-[10px] text-slate-500">{row.jobs} assignments</span> },
        { header: 'Total Payable', accessor: (row: PayrollRecord) => <span className="font-black text-slate-900 dark:text-white">£{row.total.replace('£', '')}</span> },
        {
            header: 'Status',
            accessor: (row: PayrollRecord) => <StatusBadge status={row.status as any} />
        }
    ];

    return (
        <div className="space-y-6 pb-20 relative">
            <PageHeader title="Interpreter Payroll" subtitle="Management of professional payment cycles and interpreter remittances">
                <Button icon={DollarSign} size="sm" className="h-9 px-4 font-black uppercase text-[9px] tracking-[0.15em] bg-blue-600 shadow-lg shadow-blue-200">Process Batch</Button>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search payroll..." className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs outline-none" />
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-slate-100">
                                <Filter size={14} className="mr-2 text-slate-400" />
                                Period
                            </Button>
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">{selectedIds.length} Selected</span>
                                <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest bg-emerald-600">Authorize Batch</Button>
                            </div>
                        )}
                    </div>

                    <Table
                        data={mockPayroll}
                        columns={columns as any}
                        selectable
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onRowClick={(row) => setDrawerItem(row)}
                        emptyMessage="No pending payroll items."
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-900/10 border border-slate-700/50">
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Batch Summary</h4>
                            <Receipt className="text-blue-500/50" size={20} />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-3xl font-black tracking-tighter text-white">£4,820.50</p>
                                <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.15em] mt-1">Total Payout for Period</p>
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Pending</span>
                                    <span className="text-amber-400">£1,240</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Authorized</span>
                                    <span className="text-blue-400">£3,580</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <UserCheck className="text-slate-200 mb-3" size={24} />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Compliance Hook</h4>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Payments only authorized for interpreters with valid ID and Right to Work documents.</p>
                        <Button variant="ghost" className="w-full mt-4 h-9 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl">Check Compliance</Button>
                    </div>
                </div>
            </div>

            {/* Side Drawer Details */}
            {drawerItem && (
                <>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-all duration-500" onClick={() => setDrawerItem(null)} />
                    <div className="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-slate-900 shadow-3xl z-50 animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 font-black text-sm">
                                    {drawerItem.interpreter.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{drawerItem.interpreter}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Payment Record #{drawerItem.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setDrawerItem(null)} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200 group">
                                <X size={20} className="text-slate-400 group-hover:text-slate-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50">
                                    <p className="text-[8px] font-black text-blue-600/60 uppercase tracking-widest mb-2">Total Amount</p>
                                    <p className="text-2xl font-black text-blue-600">{drawerItem.total}</p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100/50">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Period</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Current Cycle</p>
                                </div>
                            </div>

                            {/* Job Breakdown */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assignment Breakdown ({drawerItem.jobs} items)</h3>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group hover:border-blue-500/30 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                                    <Calendar size={14} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">NHS-2024-00{i}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">Professional Translation · 2h</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">£45.00</p>
                                                <ArrowRight size={12} className="text-slate-200 ml-auto mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="pt-4 space-y-3">
                                <Button className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-blue-600 shadow-lg shadow-blue-200" icon={CheckCircle2}>Authorize Payment</Button>
                                <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-slate-200" icon={Download}>Statement PDF</Button>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">Payments are processed via BACS every Friday at 16:00 GMT.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
