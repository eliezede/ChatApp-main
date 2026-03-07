import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, MoreHorizontal, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/StatusBadge';

interface InvoiceRecord {
    id: string;
    ref: string;
    client: string;
    date: string;
    amount: string;
    status: string;
}

export const DocumentCenter = () => {
    const [activeTab, setActiveTab] = useState<'invoices' | 'job-sheets' | 'reports'>('invoices');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const mockInvoices: InvoiceRecord[] = [
        { id: '1', ref: 'INV-2024-001', client: 'NHS London', date: '2024-03-01', amount: '£450.00', status: 'SENT' },
        { id: '2', ref: 'INV-2024-002', client: 'City Council', date: '2024-03-02', amount: '£1,200.00', status: 'PAID' },
        { id: '3', ref: 'INV-2024-003', client: 'Legal Aid', date: '2024-03-05', amount: '£85.00', status: 'DRAFT' },
    ];

    const invoiceColumns: Array<{ header: string, accessor: keyof InvoiceRecord | ((item: InvoiceRecord) => React.ReactNode) }> = [
        {
            header: 'Reference',
            accessor: (row: InvoiceRecord) => <span className="font-bold text-slate-900 dark:text-white">{row.ref}</span>
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
        <div className="space-y-6">
            <PageHeader title="Document Center" subtitle="Financial and operational document workspace">
                <div className="flex items-center space-x-2 mr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'invoices' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('job-sheets')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'job-sheets' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Job Sheets
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'reports' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Reports
                    </button>
                </div>
                <Button icon={Download} size="sm">Download Bundle</Button>
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
                            <Button variant="outline" size="sm" className="h-8 py-1 px-3">
                                <Filter size={14} className="mr-2" />
                                Filters
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">{selectedIds.length} Selected</span>
                            <Button variant="outline" size="sm" className="h-8" disabled={selectedIds.length === 0}>
                                <Printer size={14} className="mr-2" />
                                Print
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
                        emptyMessage="No documents found in this category."
                    />
                </div>

                <div className="space-y-6">
                    {/* Quick Stats sidebar */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <FileText size={120} />
                        </div>
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Finance Health</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-3xl font-black">£24,450</p>
                                <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mt-1">Outstanding Revenue</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-white/60 font-medium">Invoiced this month</span>
                                    <span className="text-sm font-bold">£12,200</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[60%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Automation</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <History size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Nightly PDF Sync</span>
                                </div>
                                <span className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <div className="text-[10px] text-slate-400 italic">
                                Last sync: Today, 03:45 AM
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
