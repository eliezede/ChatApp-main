import React from 'react';
import { CreditCard, Download, TrendingUp, Search, Calendar } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';

interface StatementRecord {
    id: string;
    period: string;
    generatedAt: string;
    total: string;
}

export const Statements = () => {
    const mockStatements: StatementRecord[] = [
        { id: '1', period: 'Jan 2024', generatedAt: '2024-02-01', total: '£4,250.00' },
        { id: '2', period: 'Dec 2023', generatedAt: '2024-01-02', total: '£3,800.00' },
        { id: '3', period: 'Nov 2023', generatedAt: '2023-12-01', total: '£5,100.00' },
    ];

    const columns: Array<{ header: string, accessor: keyof StatementRecord | ((item: StatementRecord) => React.ReactNode) }> = [
        { header: 'Statement Period', accessor: 'period' },
        { header: 'Generated At', accessor: 'generatedAt' },
        { header: 'Total Value', accessor: (row: StatementRecord) => <span className="font-bold">{row.total}</span> },
        { header: 'Status', accessor: () => <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Finalized</span> }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Financial Statements" subtitle="Auditing and transactional history">
                <Button icon={Download} size="sm" variant="outline">Export CSV</Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <Table
                        data={mockStatements}
                        columns={columns as any}
                        emptyMessage="No statements archived yet."
                    />
                </div>
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <TrendingUp className="text-blue-500 mb-2" size={20} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Trend</p>
                        <p className="text-xl font-black mt-1">+12% vs last Q</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
