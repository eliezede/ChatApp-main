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
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
                    <span>Admin</span>
                    <span>/</span>
                    <span className="text-blue-500 dark:text-blue-400">{title}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{title}</h1>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">{subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {children && (
                    <div className="flex gap-2 items-center">
                        {children}
                    </div>
                )}

                {stats && (
                    <div className="hidden lg:flex bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stats.label}</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{stats.value}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white leading-tight uppercase tabular-nums">{today}</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">System Engine Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
