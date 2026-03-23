
import React from 'react';
import { InvoiceStatus } from '../../types';

export const InvoiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/20';
      case InvoiceStatus.SENT: return 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case InvoiceStatus.APPROVED: return 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case InvoiceStatus.DRAFT: return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-400 border-gray-200 dark:border-slate-700';
      case InvoiceStatus.SUBMITTED: return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
      case InvoiceStatus.REJECTED: return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case InvoiceStatus.CANCELLED: return 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
      default: return 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors()} uppercase tracking-wide`}>
      {status}
    </span>
  );
};
