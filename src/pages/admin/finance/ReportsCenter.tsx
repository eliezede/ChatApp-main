import React from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Zap, Globe, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const Sparkline = ({ data, color = 'blue' }: { data: number[], color?: 'blue' | 'red' | 'green' }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const colors = {
        blue: '#3b82f6',
        red: '#ef4444',
        green: '#10b981'
    };

    return (
        <div className="w-16 h-8 opacity-50">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <polyline
                    fill="none"
                    stroke={colors[color]}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="drop-shadow-sm"
                />
            </svg>
        </div>
    );
};

export const ReportsCenter = () => {
    const stats = [
        { label: 'Monthly Margin', value: '32.4%', trend: '+2.1%', up: true, data: [30, 31, 28, 32, 30, 34, 32] },
        { label: 'Cost per Job', value: '£42.50', trend: '-£1.20', up: false, data: [45, 44, 46, 43, 44, 42, 42.5] },
        { label: 'Fulfillment Rate', value: '98.2%', trend: '+0.5%', up: true, data: [97, 98, 97.5, 98, 98.5, 98.2, 98.2] },
        { label: 'Active Clients', value: '142', trend: '+12', up: true, data: [120, 125, 130, 135, 138, 140, 142] },
    ];

    const volumeData = [
        { label: 'Mon', value: 65 },
        { label: 'Tue', value: 85 },
        { label: 'Wed', value: 120 },
        { label: 'Thu', value: 95 },
        { label: 'Fri', value: 140 },
        { label: 'Sat', value: 40 },
        { label: 'Sun', value: 25 },
    ];

    return (
        <div className="space-y-6 pb-20">
            <PageHeader title="Intelligence Hub" subtitle="Real-time operational analytics and margin control">
                <div className="flex gap-2">
                    <Badge variant="info" className="h-9 px-4 font-black uppercase tracking-[0.15em] text-[9px] bg-blue-50 text-blue-700 animate-pulse">Live Feed</Badge>
                </div>
            </PageHeader>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] group">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <Sparkline data={stat.data} color={stat.up ? 'green' : 'red'} />
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                            <div className={`flex items-center space-x-1 text-[10px] font-black px-2.5 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Volume Chart */}
                <div className="lg:col-span-2 bg-slate-940 dark:bg-slate-950 p-8 rounded-[3rem] border-4 border-white dark:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-10 z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Job Volume Distribution
                                <TrendingUp size={20} className="text-blue-500" />
                            </h3>
                            <p className="text-slate-500 text-xs font-medium">Daily requested service assignments (7-day window)</p>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <button className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600 shadow-sm">Daily</button>
                            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Weekly</button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
                        {volumeData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full relative flex items-end justify-center">
                                    {/* Bar Pillar */}
                                    <div
                                        className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-2xl transition-all duration-700 group-hover:from-blue-500 group-hover:to-cyan-400 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                                        style={{ height: `${(d.value / 150) * 280}px` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.value}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 p-8 pointer-events-none opacity-[0.03] dark:opacity-[0.05] flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-full h-px bg-slate-900 dark:bg-white" />)}
                    </div>
                </div>

                {/* Side Insights */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 border-t-4 border-white/20">
                        <Zap className="mb-4 text-blue-200" size={32} />
                        <h3 className="text-xl font-black mb-2 tracking-tight leading-tight">Automated Optimization active</h3>
                        <p className="text-blue-50/70 text-xs font-medium leading-relaxed mb-6">
                            Smart routing has reduced interpreter travel costs by <span className="text-white font-black underline">14%</span> this billing cycle.
                        </p>
                        <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl">
                            View Report
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Regions</h3>
                            <Globe size={16} className="text-slate-300" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'London Central', jobs: 245, growth: '+12%', up: true },
                                { name: 'Manchester Area', jobs: 182, growth: '+8%', up: true },
                                { name: 'Birmingham', jobs: 94, growth: '-2%', up: false },
                            ].map((region, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{region.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold">{region.jobs} assignments</p>
                                    </div>
                                    <span className={`text-[10px] font-black ${region.up ? 'text-green-500' : 'text-red-500'}`}>{region.growth}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Audit Status</p>
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Financial Records Validated</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
