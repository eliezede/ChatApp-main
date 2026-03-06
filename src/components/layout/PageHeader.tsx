import React from 'react';
import { Bell } from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    stats?: {
        label: string;
        value: string | number;
    };
    children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, stats, children }) => {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                {children && (
                    <div className="flex gap-2 items-center">
                        {children}
                    </div>
                )}

                {stats && (
                    <div className="hidden md:flex bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stats.label}</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.value}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{today}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">System Live</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-1"></div>
                    <NotificationCenter />
                </div>
            </div>
        </div>
    );
};
