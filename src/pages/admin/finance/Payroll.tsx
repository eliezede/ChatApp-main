import React from 'react';
import { Receipt, DollarSign, UserCheck, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';

interface PayrollRecord {
    id: string;
    interpreter: string;
    jobs: number;
    total: string;
    status: string;
}

export const Payroll = () => {
    const mockPayroll: PayrollRecord[] = [
        { id: '1', interpreter: 'John Doe', jobs: 12, total: '£640.00', status: 'PENDING' },
        { id: '2', interpreter: 'Jane Smith', jobs: 8, total: '£420.00', status: 'AUTHORIZED' },
        { id: '3', interpreter: 'Robert Brown', jobs: 15, total: '£850.00', status: 'PAID' },
    ];

    const columns: Array<{ header: string, accessor: keyof PayrollRecord | ((item: PayrollRecord) => React.ReactNode) }> = [
        { header: 'Interpreter', accessor: 'interpreter' },
        { header: 'Job Count', accessor: 'jobs' },
        { header: 'Total Payable', accessor: (row: PayrollRecord) => <span className="font-bold">{row.total}</span> },
        {
            header: 'Status', accessor: (row: PayrollRecord) => (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${row.status === 'PAID' ? 'bg-green-50 text-green-600' :
                        row.status === 'AUTHORIZED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Interpreter Payroll" subtitle="Management of professional payment cycles">
                <Button icon={DollarSign} size="sm">Process Batch</Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <Table
                        data={mockPayroll}
                        columns={columns as any}
                        emptyMessage="No pending payroll items."
                    />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <UserCheck className="text-slate-400 mb-3" size={24} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Validation</h4>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">All interpreter bank details are verified and active for this period.</p>
                </div>
            </div>
        </div>
    );
};
