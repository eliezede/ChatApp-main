import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Building2, Globe2, MapPin, Video, Eye, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useBookings } from '../../../hooks/useBookings';
import { useAuth } from '../../../context/AuthContext';
import { useBookingViews } from '../../../hooks/useBookingViews';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/StatusBadge';
import { BulkActionBar } from '../../../components/ui/BulkActionBar';
import { Booking, BookingStatus } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { updateJobStatusAction, createDependencies } from '../../../ui/actions';

export const JobsBoard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { bookings = [], loading, refresh } = useBookings();
    const { views, activeView, setActiveViewId } = useBookingViews(user?.id || '');
    const actionsDeps = createDependencies((user as any)?.organizationId || 'lingland-main');

    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const handleRowClick = (job: Booking) => {
        setSelectedJob(job);
        setIsDrawerOpen(true);
    };

    const handleQuickStatusChange = async (job: Booking, status: BookingStatus) => {
        try {
            await updateJobStatusAction(job.id, status, actionsDeps);
            refresh();
            if (selectedJob?.id === job.id) setSelectedJob({ ...job, status });
        } catch {
            showToast('Failed to update job status', 'error');
        }
    };

    const handleBulkStatus = async (ids: string[], status: BookingStatus) => {
        setIsBulkLoading(true);
        let done = 0;
        await Promise.allSettled(ids.map(async id => {
            try { await updateJobStatusAction(id, status, actionsDeps); done++; } catch { /* silent */ }
        }));
        showToast(`${done} job${done !== 1 ? 's' : ''} updated to ${status}`, 'success');
        setSelectedIds([]);
        setIsBulkLoading(false);
        refresh();
    };

    const renderContextMenu = (job: Booking) => [
        { label: 'View Details', icon: Eye, onClick: () => navigate(`/admin/bookings/${job.id}`) },
        { label: 'Edit Job', icon: Pencil, onClick: () => navigate(`/admin/bookings/edit/${job.id}`) },
        { divider: true },
        { label: 'Mark as Verified', icon: CheckCircle2, onClick: () => handleQuickStatusChange(job, BookingStatus.INVOICING) },
        { label: 'Cancel Job', icon: Trash2, variant: 'danger' as const, onClick: () => handleQuickStatusChange(job, BookingStatus.CANCELLED) },
    ];

    const columns = [
        {
            header: 'Date / Ref',
            accessor: (job: Booking) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(job.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">{job.startTime}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Ref: {job.bookingRef || 'TBD'}</span>
                </div>
            )
        },
        {
            header: 'Client',
            accessor: (job: Booking) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                        <Building2 size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {job.guestContact?.organisation || job.clientName}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">{job.guestContact?.name || 'Contact'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Service / Language',
            accessor: (job: Booking) => (
                <div className="flex flex-col">
                    <div className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Globe2 size={12} className="mr-1.5 text-blue-500" />
                        {job.languageFrom} → {job.languageTo}
                    </div>
                    <div className="flex items-center text-[10px] text-slate-500 mt-1 uppercase font-medium">
                        {job.locationType === 'ONLINE' ? <Video size={10} className="mr-1 text-indigo-500" /> : <MapPin size={10} className="mr-1 text-red-500" />}
                        {job.serviceType}
                    </div>
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
            <PageHeader title="Jobs Board" subtitle="Operational request management">
                <div className="flex items-center space-x-2 mr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    {views.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveViewId(view.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeView.id === view.id
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {view.name}
                        </button>
                    ))}
                </div>
                <Button onClick={() => navigate('/admin/bookings/new')} icon={Plus} size="sm">Create Booking</Button>
            </PageHeader>

            <Table
                data={bookings}
                columns={columns}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onRowClick={handleRowClick}
                renderContextMenu={renderContextMenu}
                isLoading={loading}
            />

            {/* Phase 5: Floating Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                totalCount={bookings.length}
                entityLabel="job"
                isLoading={isBulkLoading}
                onClearSelection={() => setSelectedIds([])}
                onSelectAll={() => setSelectedIds(bookings.map(b => b.id))}
                actions={[
                    {
                        label: 'Confirm',
                        onClick: () => handleBulkStatus(selectedIds, BookingStatus.BOOKED),
                        variant: 'success',
                    },
                    {
                        label: 'Cancel',
                        onClick: () => handleBulkStatus(selectedIds, BookingStatus.CANCELLED),
                        variant: 'danger',
                    },
                ]}
            />

            <Modal
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                type="drawer"
                title={selectedJob ? `Job Record: ${selectedJob.bookingRef || 'TBD'}` : 'Job Record'}
                footer={
                    <div className="flex justify-between w-full">
                        <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>Close</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/bookings/edit/${selectedJob?.id}`)}>Edit Record</Button>
                            <Button size="sm" onClick={() => navigate(`/admin/bookings/${selectedJob?.id}`)}>Full Details</Button>
                        </div>
                    </div>
                }
            >
                {selectedJob && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Quick Status Section */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Workflow Status Control</span>
                                <StatusBadge status={selectedJob.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 !text-[10px] py-1" onClick={() => handleQuickStatusChange(selectedJob, BookingStatus.BOOKED)}>Confirm Booking</Button>
                                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 !text-[10px] py-1" onClick={() => handleQuickStatusChange(selectedJob, BookingStatus.INVOICING)}>Verify Job</Button>
                            </div>
                        </div>

                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule</h4>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {new Date(selectedJob.date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'long' })}
                                    </p>
                                    <p className="text-sm text-blue-600 font-bold">{selectedJob.startTime} ({selectedJob.durationMinutes} min)</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service</h4>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedJob.languageFrom} → {selectedJob.languageTo}</p>
                                    <p className="text-sm text-slate-500">{selectedJob.serviceType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Venue / Connection */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Venue / Connection</h4>
                            <div className="flex items-start space-x-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                                {selectedJob.locationType === 'ONLINE' ? (
                                    <>
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                            <Video size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Virtual Connection</p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{selectedJob.onlineLink || 'No link provided'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Physical Location</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{selectedJob.location || selectedJob.address || 'No address provided'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* People */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Information</h4>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedJob.clientName}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-tighter font-medium underline underline-offset-2">
                                            {selectedJob.guestContact?.name || 'Authorized Contact'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
