import React from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';

export const ReportsCenter = () => {
    const stats = [
        { label: 'Monthly Margin', value: '32.4%', trend: '+2.1%', up: true },
        { label: 'Cost per Job', value: '£42.50', trend: '-£1.20', up: false },
        { label: 'Fulfillment Rate', value: '98.2%', trend: '+0.5%', up: true },
        { label: 'Active Clients', value: '142', trend: '+12', up: true },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Intelligence Hub" subtitle="Analytics and performance insights" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-blue-500/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            <div className={`flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-full ${stat.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <BarChart3 size={240} />
                    </div>
                    <Target className="text-blue-500 mb-4" size={32} />
                    <h3 className="text-xl font-black mb-2">Detailed Analytics Pipeline</h3>
                    <p className="text-white/50 text-sm max-w-sm text-center">Interactive charts and granular margin data will be projected here from the operational data stream.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Top Performers</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xs">
                                            {i}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Client Group {i}</p>
                                            <p className="text-[10px] text-slate-500">24 jobs this week</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-blue-600">£2.4k</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
