import React, { useState } from 'react';
import { CreditCard, Download, TrendingUp, Search, Calendar, X, FileText, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

interface StatementRecord {
    id: string;
    period: string;
    generatedAt: string;
    total: string;
}

export const Statements = () => {
    const [drawerItem, setDrawerItem] = useState<StatementRecord | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const mockStatements: StatementRecord[] = [
        { id: '1', period: 'Jan 2024', generatedAt: '2024-02-01', total: '£4,250.00' },
        { id: '2', period: 'Dec 2023', generatedAt: '2024-01-02', total: '£3,800.00' },
        { id: '3', period: 'Nov 2023', generatedAt: '2023-12-01', total: '£5,100.00' },
    ];

    const columns: Array<{ header: string, accessor: keyof StatementRecord | ((item: StatementRecord) => React.ReactNode) }> = [
        {
            header: 'Statement Period',
            accessor: (row: StatementRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                        <Calendar size={14} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">{row.period}</span>
                </div>
            )
        },
        { header: 'Archive Date', accessor: (row: StatementRecord) => <span className="text-slate-500 text-[10px] font-bold">{row.generatedAt}</span> },
        { header: 'Value', accessor: (row: StatementRecord) => <span className="font-black text-slate-900 dark:text-white">£{row.total.replace('£', '')}</span> },
        { header: 'Status', accessor: () => <Badge variant="success" className="text-[8px] px-2 py-0.5">FINALIZED</Badge> }
    ];

    return (
        <div className="space-y-6 pb-20 relative">
            <PageHeader title="Financial Statements" subtitle="Auditing and transactional history for corporate accounts">
                <Button icon={Download} size="sm" variant="outline" className="h-9 px-4 font-black uppercase text-[9px] tracking-widest border-slate-200">Export CSV</Button>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-3 text-slate-400">
                            <Search size={14} className="ml-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Filter Archive</span>
                        </div>
                    </div>

                    <Table
                        data={mockStatements}
                        columns={columns as any}
                        selectable
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onRowClick={(row) => setDrawerItem(row)}
                        emptyMessage="No statements archived yet."
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <TrendingUp className="text-blue-500 mb-3" size={24} />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Growth Trend</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">+12% vs last Q</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Consistent performance gain</p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                        <ShieldCheck className="text-indigo-600 mb-2" size={20} />
                        <p className="text-[9px] font-black text-indigo-700/60 uppercase tracking-widest">Audit Policy</p>
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-400 mt-1 leading-relaxed">All statements are cryptographically signed and archived for 7 years.</p>
                    </div>
                </div>
            </div>

            {/* Side Drawer Details */}
            {drawerItem && (
                <>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-all duration-500" onClick={() => setDrawerItem(null)} />
                    <div className="fixed inset-y-0 right-0 w-[450px] bg-white dark:bg-slate-900 shadow-3xl z-50 animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{drawerItem.period} Statement</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Record #{drawerItem.id}</p>
                            </div>
                            <button onClick={() => setDrawerItem(null)} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Analytics Summary */}
                            <div className="p-6 bg-slate-940 dark:bg-slate-950 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-xl text-white">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Total Volume</p>
                                <p className="text-4xl font-black tracking-tighter mb-4">{drawerItem.total}</p>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[80%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>
                            </div>

                            {/* Section breakdown */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Component Values</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Translation Services', value: '£3,120.50' },
                                        { label: 'Interpretations', value: '£840.00' },
                                        { label: 'System Fees', value: '£289.50' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item.label}</span>
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="pt-4 space-y-3">
                                <Button className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-blue-600 shadow-lg shadow-blue-200" icon={Download}>Download PDF</Button>
                                <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-slate-200" icon={Mail}>Email Link</Button>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signed on {drawerItem.generatedAt} by Controller</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
