
import React, { useEffect, useState } from 'react';
import { BillingService } from '../../../services/billingService';
import { InterpreterInvoice } from '../../../types';
import { InvoiceTable } from '../../../components/billing/InvoiceTable';

import { TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FileText } from 'lucide-react';

import { PageHeader } from '../../../components/layout/PageHeader';

export const AdminInterpreterInvoicesPage = () => {
  const [invoices, setInvoices] = useState<InterpreterInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BillingService.getInterpreterInvoices().then(data => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Settlements"
        subtitle="Manage interpreter payment cycles and self-billed invoices."
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No Interpreter Invoices"
          description="There are no interpreter invoices submitted yet. Interpreters can submit invoices through their dashboard."
          icon={FileText}
        />
      ) : (
        <InvoiceTable invoices={invoices} type="INTERPRETER" />
      )}
    </div>
  );
};
