import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Building2, Globe2, MapPin, Video, Eye, Pencil, Trash2, CheckCircle2, UserPlus, UserCircle2 } from 'lucide-react';
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
import { BookingService, BillingService } from '../../../services/api';
import { updateJobStatusAction, createDependencies } from '../../../ui/actions';
import { InterpreterAllocationDrawer } from '../../../components/operations/InterpreterAllocationDrawer';
import { InterpreterPreviewDrawer } from '../../../components/operations/InterpreterPreviewDrawer';
import { filterBookings, groupBookings } from '../../../utils/bookingFilters';
import { ViewManagerDrawer } from '../../../components/operations/ViewManagerDrawer';
import { Settings, Plus as PlusIcon } from 'lucide-react';

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

    // Assignment States
    const [isAllocationOpen, setIsAllocationOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [targetInterpreterId, setTargetInterpreterId] = useState<string | null>(null);

    // View Manager States
    const [isViewManagerOpen, setIsViewManagerOpen] = useState(false);
    const [editingViewId, setEditingViewId] = useState<string | null>(null);

    const handleRowClick = (job: Booking) => {
        setSelectedJob(job);
        setIsDrawerOpen(true);
    };

    const handleAssignClick = (e: React.MouseEvent, job: Booking) => {
        e.stopPropagation();
        setSelectedJob(job);
        setIsAllocationOpen(true);
    };

    const handleInterpreterPreview = (e: React.MouseEvent, job: Booking) => {
        e.stopPropagation();
        setSelectedJob(job);
        setTargetInterpreterId(job.interpreterId || null);
        setIsPreviewOpen(true);
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

    const handleVerifyTimesheet = async (job: Booking) => {
        try {
            await BillingService.approveTimesheetByBookingId(job.id);
            refresh();
            if (selectedJob?.id === job.id) setSelectedJob({ ...job, status: BookingStatus.INVOICING });
            showToast('Timesheet verified and job moved to invoicing', 'success');
        } catch {
            showToast('Failed to verify timesheet', 'error');
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
            header: 'Interpreter',
            accessor: (job: Booking) => (
                <div className="flex flex-col">
                    {job.interpreterId ? (
                        <button
                            onClick={(e) => handleInterpreterPreview(e, job)}
                            className="flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight group"
                        >
                            <UserCircle2 size={12} className="mr-1 text-blue-400 group-hover:text-blue-600" />
                            Assigned: {job.interpreterName || 'Professional'}
                        </button>
                    ) : (
                        <button
                            onClick={(e) => handleAssignClick(e, job)}
                            className="flex items-center text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 transition-all hover:scale-105"
                        >
                            <UserPlus size={12} className="mr-1.5" />
                            Assign Now
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (job: Booking) => <StatusBadge status={job.status} />
        }
    ];

    const filteredBookings = filterBookings(bookings, activeView);
    const groupedBookings = groupBookings(filteredBookings, activeView.groupBy);
    const groupKeys = Object.keys(groupedBookings);

    return (
        <div className="space-y-6">
            <PageHeader title="Jobs Board" subtitle="Operational request management">
                <div className="flex items-center space-x-2 mr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    {views.map(view => (
                        <div key={view.id} className="relative group/view">
                            <button
                                onClick={() => setActiveViewId(view.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeView.id === view.id
                                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {view.name}
                                {activeView.id === view.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingViewId(view.id);
                                            setIsViewManagerOpen(true);
                                        }}
                                        className="p-0.5 hover:bg-slate-700 dark:hover:bg-slate-200 rounded transition-colors"
                                    >
                                        <Settings size={10} />
                                    </button>
                                )}
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            setEditingViewId(null);
                            setIsViewManagerOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Create New View"
                    >
                        <PlusIcon size={14} />
                    </button>
                </div>
                <Button onClick={() => navigate('/admin/bookings/new')} icon={Plus} size="sm">Create Booking</Button>
            </PageHeader>

            {groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== 'All Jobs') ? (
                <div className="space-y-12">
                    {groupKeys.map(groupKey => (
                        <div key={groupKey} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-8 w-1.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                                    {groupKey}
                                    <span className="ml-3 text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {groupedBookings[groupKey].length} jobs
                                    </span>
                                </h2>
                            </div>
                            <Table
                                data={groupedBookings[groupKey]}
                                columns={columns}
                                selectable
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                                onRowClick={handleRowClick}
                                renderContextMenu={renderContextMenu}
                                isLoading={loading}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Table
                    data={filteredBookings}
                    columns={columns}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={handleRowClick}
                    renderContextMenu={renderContextMenu}
                    isLoading={loading}
                />
            )}

            {/* Phase 5: Floating Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                totalCount={filteredBookings.length}
                entityLabel="job"
                isLoading={isBulkLoading}
                onClearSelection={() => setSelectedIds([])}
                onSelectAll={() => setSelectedIds(filteredBookings.map(b => b.id))}
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
                                {selectedJob.status === BookingStatus.INCOMING && (
                                    <Button size="sm" className="bg-blue-600 text-white !text-[10px] py-1" onClick={() => handleQuickStatusChange(selectedJob, BookingStatus.OPENED)}>Open for Assignments</Button>
                                )}
                                {selectedJob.status === BookingStatus.OPENED && (
                                    <Button size="sm" className="bg-amber-600 text-white !text-[10px] py-1" onClick={(e) => handleAssignClick(e, selectedJob)}>Assign Professional</Button>
                                )}
                                {selectedJob.status === BookingStatus.BOOKED && (
                                    <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 !text-[10px] py-1" onClick={() => handleQuickStatusChange(selectedJob, BookingStatus.INVOICING)}>Manual Verification</Button>
                                )}
                                {(selectedJob.status === BookingStatus.TIMESHEET_SUBMITTED || (selectedJob.status as string) === 'TIMESHEET_SUBMITTED') && (
                                    <Button size="sm" className="bg-emerald-600 text-white !text-[10px] py-1 col-span-2" onClick={() => handleVerifyTimesheet(selectedJob)}>Verify Timesheet</Button>
                                )}
                                {selectedJob.status === BookingStatus.INVOICING && (
                                    <Button size="sm" className="bg-indigo-600 text-white !text-[10px] py-1 col-span-2" onClick={() => navigate('/admin/timesheets')}>Invoicing Review</Button>
                                )}
                                {selectedJob.status === BookingStatus.PAID && (
                                    <p className="text-[10px] text-green-600 font-bold uppercase col-span-2 bg-green-50 p-2 rounded-lg text-center">Process Completed & Paid</p>
                                )}
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
                            {/* Interpreter Section */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Interpreter Assignment</h4>
                                {selectedJob.interpreterId ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600">
                                                <UserCircle2 size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedJob.interpreterName}</p>
                                                <button
                                                    onClick={(e) => handleInterpreterPreview(e, selectedJob)}
                                                    className="text-[11px] text-blue-600 font-bold uppercase hover:underline"
                                                >
                                                    View Intelligence
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 italic">No professional assigned yet.</p>
                                        <Button size="sm" variant="outline" className="h-8 py-1 bg-white dark:bg-slate-900" onClick={(e) => handleAssignClick(e, selectedJob)}>
                                            <UserPlus size={14} className="mr-2" />
                                            Assign
                                        </Button>
                                    </div>
                                )}
                            </div>

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

            <InterpreterAllocationDrawer
                isOpen={isAllocationOpen}
                onClose={() => setIsAllocationOpen(false)}
                job={selectedJob}
                onSuccess={refresh}
            />

            <InterpreterPreviewDrawer
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                interpreterId={targetInterpreterId}
                jobId={selectedJob?.id || null}
                onSuccess={refresh}
            />

            <ViewManagerDrawer
                isOpen={isViewManagerOpen}
                onClose={() => setIsViewManagerOpen(false)}
                viewId={editingViewId}
            />
        </div>
    );
};
