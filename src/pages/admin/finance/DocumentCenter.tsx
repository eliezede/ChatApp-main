import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, MoreHorizontal, History, CheckCircle2, AlertCircle, X, ExternalLink, Calendar, User, CreditCard } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/StatusBadge';
import { Badge } from '../../../components/ui/Badge';

interface InvoiceRecord {
    id: string;
    ref: string;
    client: string;
    date: string;
    amount: string;
    status: string;
    type?: string;
}

export const DocumentCenter = () => {
    const [activeTab, setActiveTab] = useState<'invoices' | 'job-sheets' | 'reports'>('invoices');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [drawerItem, setDrawerItem] = useState<InvoiceRecord | null>(null);

    const mockInvoices: InvoiceRecord[] = [
        { id: '1', ref: 'INV-2024-001', client: 'NHS London', date: '2024-03-01', amount: '£450.00', status: 'SENT', type: 'Invoice' },
        { id: '2', ref: 'INV-2024-002', client: 'City Council', date: '2024-03-02', amount: '£1,200.00', status: 'PAID', type: 'Invoice' },
        { id: '3', ref: 'INV-2024-003', client: 'Legal Aid', date: '2024-03-05', amount: '£85.00', status: 'DRAFT', type: 'Invoice' },
    ];

    const invoiceColumns: Array<{ header: string, accessor: keyof InvoiceRecord | ((item: InvoiceRecord) => React.ReactNode) }> = [
        {
            header: 'Reference',
            accessor: (row: InvoiceRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={14} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">{row.ref}</span>
                </div>
            )
        },
        { header: 'Recipient', accessor: 'client' },
        { header: 'Issue Date', accessor: 'date' },
        {
            header: 'Amount',
            accessor: (row: InvoiceRecord) => <span className="font-bold text-slate-900 dark:text-white">{row.amount}</span>
        },
        {
            header: 'Status',
            accessor: (row: InvoiceRecord) => <StatusBadge status={row.status as any} />
        }
    ];

    return (
        <div className="space-y-6 pb-20 relative">
            <PageHeader title="Document Center" subtitle="Financial and operational document workspace">
                <div className="flex items-center space-x-2 mr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    {(['invoices', 'job-sheets', 'reports'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>
                <Button icon={Download} size="sm" className="h-9 px-4 font-black uppercase text-[9px] tracking-widest">Download Bundle</Button>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters Bar */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search documents..." className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <Button variant="outline" size="sm" className="h-8 py-1 px-3 text-[10px] font-bold uppercase tracking-widest">
                                <Filter size={14} className="mr-2" />
                                Filters
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">{selectedIds.length} Selected</span>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" disabled={selectedIds.length === 0}>
                                <Printer size={14} className="mr-2" />
                                Batch Print
                            </Button>
                        </div>
                    </div>

                    {/* Main Table */}
                    <Table
                        data={mockInvoices}
                        columns={invoiceColumns as any}
                        selectable
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onRowClick={(row) => setDrawerItem(row)}
                        emptyMessage="No documents found in this category."
                    />
                </div>

                <div className="space-y-6">
                    {/* Quick Stats sidebar */}
                    <div className="bg-slate-940 dark:bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20 relative overflow-hidden border-4 border-white dark:border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <FileText size={120} />
                        </div>
                        <h3 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] mb-6">Finance Health</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-4xl font-black tracking-tighter">£24,450</p>
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Outstanding Revenue</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Invoiced this month</span>
                                    <span className="text-sm font-black">£12,200</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Automation</h3>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <History size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sync Agent</span>
                                </div>
                                <Badge variant="success" className="text-[8px] px-1.5 py-0">RUNNING</Badge>
                            </div>
                            <div className="h-px bg-slate-50 dark:bg-slate-800" />
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Last sync: Today, 03:45 AM
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Drawer Details */}
            {drawerItem && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setDrawerItem(null)} />
                    <div className="fixed inset-y-0 right-0 w-[450px] bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{drawerItem.ref}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Digital Document Ledger</p>
                            </div>
                            <button onClick={() => setDrawerItem(null)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Actions Header */}
                            <div className="flex gap-3">
                                <Button className="flex-1 h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-blue-600 shadow-lg shadow-blue-200" icon={Download}>Download PDF</Button>
                                <Button variant="outline" className="flex-1 h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-200" icon={ExternalLink}>View Full</Button>
                            </div>

                            {/* Core Parameters */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recipient</p>
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-blue-500" />
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{drawerItem.client}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Value</p>
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={14} className="text-indigo-500" />
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{drawerItem.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline / Trace */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Lifecycle Trace</h3>
                                <div className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-6 relative">
                                    {[
                                        { event: 'Payment Confirmed', date: 'Mar 12, 14:20', color: 'emerald', icon: CheckCircle2 },
                                        { event: 'Email Sent to Client', date: 'Mar 08, 09:12', color: 'blue', icon: FileText },
                                        { event: 'Document Generated', date: 'Mar 08, 09:10', color: 'slate', icon: History },
                                    ].map((step, i) => (
                                        <div key={i} className="relative">
                                            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-${step.color}-500 shadow-sm`} />
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{step.event}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{step.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30">
                            <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl">Delete Document Trace</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
