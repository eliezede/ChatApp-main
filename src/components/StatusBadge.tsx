
import React from 'react';
import { BookingStatus } from '../types';

export const StatusBadge: React.FC<{ status: BookingStatus | string | null | undefined }> = ({ status }) => {
  const normalizedStatus = String(status ?? 'UNKNOWN');

  const getStyles = () => {
    switch (normalizedStatus) {
      case BookingStatus.INVOICED:
      case BookingStatus.PAID:
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.BOOKED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.INCOMING:
      case 'ONBOARDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.OPENED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case BookingStatus.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case BookingStatus.INVOICING:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case BookingStatus.CANCELLED:
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()} uppercase tracking-wide`}>
      {normalizedStatus.replace('_', ' ')}
    </span>
  );
};
