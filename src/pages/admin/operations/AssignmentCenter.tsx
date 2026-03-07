import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Star, MapPin, CheckCircle2, AlertCircle, Info, Search, Filter } from 'lucide-react';
import { useBookings } from '../../../hooks/useBookings';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/StatusBadge';
import { Booking, Interpreter } from '../../../types';
import { InterpreterService, BookingService } from '../../../services/api';

export const AssignmentCenter = () => {
    const navigate = useNavigate();
    const { bookings = [], loading, refresh } = useBookings();

    // Filter only unassigned jobs that are in actionable states
    const unassignedJobs = bookings.filter(b => !b.interpreterId && (b.status === 'INCOMING' || b.status === 'OPENED'));

    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
    const [isIntLoading, setIsIntLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const openAssignmentHub = async (job: Booking) => {
        setSelectedJob(job);
        setIsAssignModalOpen(true);
        setIsIntLoading(true);
        try {
            const allInts = await InterpreterService.getAll();
            // In a real scenario, we'd rank them by language, distance, and DBS
            setInterpreters(allInts.filter(i => i.status === 'ACTIVE' && i.languages.includes(job.languageTo)));
        } catch (e) {
            console.error("Failed to load interpreters");
        } finally {
            setIsIntLoading(false);
        }
    };

    const handleAssign = async (interpreter: Interpreter) => {
        if (!selectedJob) return;
        try {
            await BookingService.assignInterpreterToBooking(selectedJob.id, interpreter.id);
            setIsAssignModalOpen(false);
            refresh();
        } catch (e) {
            alert("Failed to assign interpreter");
        }
    };

    const columns = [
        {
            header: 'Target Job',
            accessor: (job: Booking) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{job.languageFrom} → {job.languageTo}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Ref: {job.bookingRef || 'TBD'}</span>
                </div>
            )
        },
        {
            header: 'Schedule',
            accessor: (job: Booking) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(job.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">{job.startTime}</span>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: (job: Booking) => (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    {job.locationType === 'ONLINE' ? 'Remote / Video' : job.location || 'Physical'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (job: Booking) => <StatusBadge status={job.status} />
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Assignment Center" subtitle="Ranked interpreter allocation hub" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-start space-x-3">
                        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Pending Allocation</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">There are {unassignedJobs.length} jobs waiting for an interpreter. Use the allocation hub to match the best-ranked professionals.</p>
                        </div>
                    </div>

                    <Table
                        data={unassignedJobs}
                        columns={columns}
                        selectable
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onRowClick={openAssignmentHub}
                        isLoading={loading}
                        emptyMessage="All jobs are currently assigned. Great work!"
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Network Health</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Active Professionals</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">124</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Matching Time</span>
                                <span className="text-sm font-bold text-green-600">14m</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <div className="flex items-center space-x-2 text-amber-600">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase">3 DBS expiries this week</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allocation Wizard / Hub */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                type="drawer"
                title="Interpreter Allocation Hub"
                maxWidth="3xl"
            >
                {selectedJob && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Target Info Header */}
                        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Target Language Path</h4>
                                    <p className="text-xl font-black">{selectedJob.languageFrom} → {selectedJob.languageTo}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Schedule</h4>
                                    <p className="text-sm font-bold">{new Date(selectedJob.date).toLocaleDateString([], { day: '2-digit', month: 'short' })} @ {selectedJob.startTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                                <div className="flex items-center space-x-2">
                                    <MapPin size={14} className="text-blue-400" />
                                    <span className="text-xs font-medium">{selectedJob.location || 'Remote'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Star size={14} className="text-amber-400" />
                                    <span className="text-xs font-medium">{selectedJob.serviceType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Search & Ranking */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ranked Suggestions</h4>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" placeholder="Search interpreter..." className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 py-1 px-3">
                                        <Filter size={14} className="mr-2" />
                                        Advanced
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isIntLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : interpreters.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-sm text-slate-400 italic font-medium">No specialized interpreters found for this path.</p>
                                    </div>
                                ) : (
                                    interpreters.map((interp, idx) => (
                                        <div
                                            key={interp.id}
                                            className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
                                            onClick={() => handleAssign(interp)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400">
                                                        {interp.name.charAt(0)}
                                                    </div>
                                                    {idx === 0 && (
                                                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                                                            <Star size={10} fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{interp.name}</p>
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black text-slate-500 uppercase">Pro</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 mt-1.5">
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin size={10} className="text-slate-400" />
                                                            <span className="text-[10px] text-slate-500">2.4 miles</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <CheckCircle2 size={10} className="text-green-500" />
                                                            <span className="text-[10px] text-slate-500">DBS Valid</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-right mr-2">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">Rank #1</p>
                                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">98% Match</p>
                                                </div>
                                                <button className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95">
                                                    <UserPlus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Batch Action Option */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">Multi-Allocation Mode</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Send this job offer to all top-ranked interpreters simultaneously.</p>
                                </div>
                                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">Blast Offer</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
