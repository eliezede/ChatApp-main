import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';

interface CalendarProps {
    jobs: any[];
    onDateClick?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ jobs, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const hasJobOnDay = (day: number) => {
        const checkDate = new Date(year, month, day).toISOString().split('T')[0];
        return jobs.some(job => job.date === checkDate);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const days = [];
    // Previous month days placeholder
    for (let i = 0; i < offset; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10 md:h-12 md:w-12" />);
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
        const hasJob = hasJobOnDay(d);
        const today = isToday(d);

        days.push(
            <button
                key={d}
                onClick={() => onDateClick?.(new Date(year, month, d))}
                className={`
          h-10 w-10 md:h-12 md:w-12 flex flex-col items-center justify-center rounded-xl relative transition-all text-xs font-bold
          ${today ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-700'}
          ${hasJob && !today ? 'border-2 border-emerald-100 bg-emerald-50/30' : ''}
        `}
            >
                {d}
                {hasJob && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${today ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
            </button>
        );
    }

    return (
        <Card className="p-4 select-none">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Jobs Scheduled
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    Today
                </div>
            </div>
        </Card>
    );
};
