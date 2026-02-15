import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { MapPin, Clock, Calendar, Video, Map, ArrowRight } from 'lucide-react';
import { Booking, BookingAssignment, BookingStatus } from '../types';

interface JobCardProps {
    type: 'OFFER' | 'UPCOMING';
    data: any; // Can be Booking or BookingAssignment
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
    onClick?: () => void;
    processing?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
    type,
    data,
    onAccept,
    onDecline,
    onClick,
    processing
}) => {
    const isOffer = type === 'OFFER';
    const booking = isOffer ? (data as BookingAssignment).bookingSnapshot : (data as Booking);

    if (!booking) return null;

    return (
        <Card
            onClick={onClick}
            className="group relative overflow-hidden border-l-4 border-l-blue-500 hover:border-l-blue-600"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Section: Info */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between md:justify-start gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Ref: {booking.bookingRef}
                        </span>
                        <Badge variant={booking.locationType === 'ONLINE' ? 'info' : 'warning'}>
                            {booking.locationType === 'ONLINE' ? <Video size={12} className="mr-1" /> : <Map size={12} className="mr-1" />}
                            {booking.locationType}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                            {booking.languageFrom}
                        </h3>
                        <ArrowRight size={18} className="text-slate-300" />
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                            {booking.languageTo}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-bold">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} className="text-blue-500" />
                            {booking.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-blue-500" />
                            {booking.startTime} - {booking.expectedEndTime || '--:--'}
                        </div>
                        {booking.locationType === 'ONSITE' && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-blue-500" />
                                {booking.postcode}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex flex-col sm:flex-row gap-2 md:min-w-[140px]">
                    {isOffer ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDecline?.(data.id); }}
                                disabled={processing}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            >
                                Decline
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAccept?.(data.id); }}
                                disabled={processing}
                                className="flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? '...' : 'Accept'}
                            </button>
                        </>
                    ) : (
                        <button
                            className="w-full px-6 py-2.5 rounded-xl text-xs font-black uppercase bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-200"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 -z-0" />
        </Card>
    );
};
