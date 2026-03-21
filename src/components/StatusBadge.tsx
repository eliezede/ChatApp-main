
import React from 'react';
import { BookingStatus, JobStatus } from '../types';

export const StatusBadge: React.FC<{ status: BookingStatus | JobStatus | string | null | undefined; size?: 'sm' | 'md' | 'lg' }> = ({ status, size = 'md' }) => {
  const normalizedStatus = String(status ?? 'UNKNOWN');

  const getStyles = () => {
    switch (normalizedStatus) {
      case BookingStatus.INVOICED:
      case 'INVOICED':
      case BookingStatus.PAID:
      case 'PAID':
      case 'VERIFIED':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.BOOKED:
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.INCOMING:
      case 'INCOMING':
      case 'ONBOARDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.OPENED:
      case 'PENDING_ASSIGNMENT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case BookingStatus.ADMIN:
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case BookingStatus.INVOICING:
      case 'TIMESHEET_SUBMITTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case BookingStatus.CANCELLED:
      case 'CANCELLED':
      case 'SUSPENDED':
      case 'BLOCKED':
      case 'UNRELIABLE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'APPLICANT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ONLY_TRANSL':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ON_LEAVE':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${getStyles()} uppercase tracking-wider`}>
      {normalizedStatus.replace(/_/g, ' ')}
    </span>
  );
};
