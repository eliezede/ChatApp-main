
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BillingService } from '../../../services/billingService';
import { ClientInvoice } from '../../../types';
import { InvoiceTable } from '../../../components/billing/InvoiceTable';
import { Plus } from 'lucide-react';
import { ClientService } from '../../../services/clientService';
import { useToast } from '../../../context/ToastContext';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';

export const AdminClientInvoicesPage = () => {
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator State
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
    ClientService.getAll().then(setClients);

    // Pre-fill from query params
    const clientId = searchParams.get('clientId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (clientId || start || end) {
      setShowGenerator(true);
      if (clientId) setSelectedClient(clientId);
      if (start || end) setDateRange({ start: start || '', end: end || '' });
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    const data = await BillingService.getClientInvoices();
    setInvoices(data);
    setLoading(false);
  };

  const handleGenerate = async () => {
    try {
      showToast('Generating invoice...', 'info');
      const result = await BillingService.generateClientInvoice(selectedClient, dateRange.start, dateRange.end);
      if (result.success) {
        showToast(`Invoice generated for £${result.total}`, 'success');
        setShowGenerator(false);
        loadData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (e) {
      showToast('Failed to generate invoice', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Accounts"
        subtitle="Manage accounts receivable and invoicing cycles."
      >
        <Button
          onClick={() => setShowGenerator(!showGenerator)}
          icon={Plus}
          size="sm"
        >
          {showGenerator ? 'Close Generator' : 'Generate Invoice'}
        </Button>
      </PageHeader>

      {showGenerator && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <h3 className="font-black text-white text-[10px] uppercase tracking-[0.2em] opacity-80">Account Settlement Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Client</label>
              <select
                className="w-full h-11 bg-slate-800 border-slate-700 text-white rounded-xl text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Entity...</option>
                {clients.map(c => <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cycle Start</label>
              <input
                type="date"
                className="w-full h-11 bg-slate-800 border-slate-700 text-white rounded-xl text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none [color-scheme:dark]"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cycle End</label>
              <input
                type="date"
                className="w-full h-11 bg-slate-800 border-slate-700 text-white rounded-xl text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none [color-scheme:dark]"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                className="w-full h-11 justify-center shadow-lg shadow-blue-900/40"
              >
                Execute Run
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No Invoices Found"
          description="There are no client invoices generated yet. Use the generator above to create one."
          onAction={() => setShowGenerator(true)}
          actionLabel="Generate Invoice"
        />
      ) : (
        <InvoiceTable invoices={invoices} type="CLIENT" />
      )}
    </div>
  );
};
