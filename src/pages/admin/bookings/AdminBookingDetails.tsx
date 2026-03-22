import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingService, InterpreterService, BillingService, PdfService } from '../../../services/api';
import { ChatService } from '../../../services/chatService';
import { Booking, BookingAssignment, Interpreter, BookingStatus, AssignmentStatus, ServiceType, Timesheet, ServiceCategory } from '../../../types';
import { LANGUAGES } from '../../../constants/languages';
import { StatusBadge } from '../../../components/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import { useClients } from '../../../context/ClientContext';
import {
  Calendar, Clock, MapPin, Video, Globe2, ChevronLeft,
  User, CheckCircle2, AlertCircle, Edit, Trash2, MessageSquare, Building2, Mail, Phone, CreditCard, Zap, TrendingUp, Plus, History, FileText, Receipt,
  UserCircle2, Tag, ArrowLeft, Edit3, Printer, Languages, Star, ShieldCheck, UserPlus, UserMinus
} from 'lucide-react';
import { ActivityTimeline } from '../../../components/operations/ActivityTimeline';
import { InterpreterAllocationDrawer } from '../../../components/operations/InterpreterAllocationDrawer';
import { InterpreterPreviewDrawer } from '../../../components/operations/InterpreterPreviewDrawer';

const AdminBookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openThread } = useChat();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { getClientCompany } = useClients();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [suggestedInterpreters, setSuggestedInterpreters] = useState<Interpreter[]>([]);
  const [allInterpreters, setAllInterpreters] = useState<Interpreter[]>([]);
  const [interpretersMap, setInterpretersMap] = useState<Record<string, Interpreter>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Advanced Selection State
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInterpId, setSelectedInterpId] = useState<string | null>(null);
  const [isIntLoading, setIsIntLoading] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Booking>>({});
  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (id) {
      loadBookingData(id);
    }
  }, [id]);

  const loadBookingData = async (bookingId: string) => {
    setLoading(true);
    try {
      const [bookingData, assignmentsData, interpretersList, eventsData, timesheetData] = await Promise.all([
        BookingService.getById(bookingId),
        BookingService.getAssignmentsByBookingId(bookingId),
        InterpreterService.getAll(),
        BookingService.getJobEvents(bookingId),
        BillingService.getTimesheetByBookingId(bookingId)
      ]);

      setBooking(bookingData || null);
      setTimesheet(timesheetData || null);
      setAssignments(assignmentsData);
      setEvents(eventsData);
      setAllInterpreters(interpretersList);

      const map: Record<string, Interpreter> = {};
      interpretersList.forEach(i => map[i.id] = i);
      setInterpretersMap(map);

      if (bookingData) {
        const suggestions = await BookingService.findInterpretersByLanguage(bookingData.languageTo);
        setSuggestedInterpreters(suggestions);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast('Failed to load details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!booking || !booking.interpreterId || !user) return;

    setProcessing(true);
    try {
      const names = {
        [user.id]: user.displayName || 'Admin',
        [booking.interpreterId]: booking.interpreterName || 'Interpreter'
      };

      const threadId = await ChatService.getOrCreateThread(
        [user.id, booking.interpreterId],
        names,
        booking.id
      );

      openThread(threadId);
    } catch (error) {
      showToast('Failed to start chat', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (status: BookingStatus) => {
    if (!booking) return;
    setProcessing(true);
    try {
      await BookingService.updateStatus(booking.id, status);
      // Reactive Update: Update local state immediately
      setBooking(prev => prev ? { ...prev, status } : null);
      showToast(`Status updated to ${status}`, 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteJob = () => {
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const handleFinalDelete = async () => {
    if (!booking || deleteConfirmText.toLowerCase() !== 'delete') return;

    setProcessing(true);
    try {
      await BookingService.delete(booking.id);
      showToast('Booking deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      navigate('/admin/bookings');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showToast('Failed to delete booking', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setProcessing(true);
    try {
      await BookingService.update(booking.id, editFormData);
      showToast('Booking updated', 'success');
      setIsEditModalOpen(false);
      await loadBookingData(booking.id);
    } catch (error) {
      showToast('Failed to update', 'error');
    } finally {
      setProcessing(false);
    }
  };
  const handleSendOffer = async (interpreterId: string) => {
    if (!booking) return;
    setProcessing(true);
    try {
      await BookingService.createAssignment(booking.id, interpreterId);
      showToast('Offer sent', 'success');
      await loadBookingData(booking.id);
    } catch (error) {
      showToast('Failed to send offer', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAssignment = async (interpreterId: string) => {
    if (!booking) return;

    const conflictingBooking = await BookingService.checkScheduleConflict(
      interpreterId,
      booking.date,
      booking.startTime,
      booking.durationMinutes,
      booking.id
    );

    if (conflictingBooking) {
      const proceed = await confirm({
        title: 'Schedule Conflict Detected',
        message: `WARNING: This interpreter already has a booking on ${conflictingBooking.date} at ${conflictingBooking.startTime}. Are you sure you want to force this assignment?`,
        confirmLabel: 'Force Assign',
        variant: 'warning'
      });
      if (!proceed) return;
    }

    setProcessing(true);
    try {
      await BookingService.assignInterpreterToBooking(booking.id, interpreterId);
      showToast('Interpreter assigned directly', 'success');
      await loadBookingData(booking.id);
      setIsAllocationOpen(false);
    } catch (error) {
      showToast('Failed to assign', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // TODO: Implement proper backend endpoints for workload and schedule
  // These functions currently return empty/0 to prevent the massive data explosion 
  // of downloading all platform bookings to the client device.
  const getInterpreterWorkload = (interpreterId: string) => {
    return 0;
  };

  const getInterpreterSchedule = (interpreterId: string) => {
    return [];
  };

  const handleOpenAllocation = () => {
    setIsAllocationOpen(true);
  };

  const handleOpenPreview = (interpreterId: string) => {
    setSelectedInterpId(interpreterId);
    setIsPreviewOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading booking details...</div>;
  if (!booking) return <div className="p-8 text-center text-red-500">Booking not found.</div>;

  const activeSuggestions = suggestedInterpreters.filter(
    (i: Interpreter) => !assignments.some((a: BookingAssignment) => a.interpreterId === i.id)
  );

  const filteredAdvancedList = allInterpreters.filter((i: Interpreter) =>
    i.status === 'ACTIVE' &&
    (i.name.toLowerCase().includes(booking.languageTo.toLowerCase()) ||
      i.languages.some((l: string) => l.toLowerCase().includes(booking.languageTo.toLowerCase())))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/admin/bookings')} className="mr-4 p-2 rounded-full hover:bg-gray-200 text-gray-500"><ChevronLeft size={24} /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.bookingRef || booking.id.substring(0, 6).toUpperCase()}</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-gray-500 text-sm mt-1">Requested by {getClientCompany(booking.clientId, booking.clientName)} on {new Date(booking.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleUpdateStatus('ADMIN' as BookingStatus)}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            disabled={processing || booking.status === 'ADMIN'}
          >
            Admin Hold
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleUpdateStatus('CANCELLED' as BookingStatus)}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
            disabled={processing || booking.status === 'CANCELLED'}
          >
            Reject / Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDeleteJob()}
            className="text-red-600 border-red-200 hover:bg-red-50 pr-4"
            disabled={processing}
            icon={Trash2}
          >
            Delete
          </Button>
          <div className="h-8 w-px bg-gray-200 mx-1" />
          <Button
            variant="primary"
            size="sm"
            onClick={() => PdfService.generateJobSheet(booking)}
            icon={FileText}
          >
            Download Job Sheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Next Action Callout */}
          {(() => {
            const status = String(booking.status);
            let actionType: 'info' | 'warning' | 'success' | 'action' = 'info';
            let message = '';
            let actionBtn = null;

            const isTranslation = booking.serviceCategory === ServiceCategory.TRANSLATION;

            if (status === 'INCOMING') {
              actionType = 'action';
              message = isTranslation ? 'Next Step: Find and assign a translator.' : 'Next Step: Find and assign an interpreter.';
              actionBtn = <Button size="sm" onClick={handleOpenAllocation} icon={UserPlus}>{isTranslation ? 'Find Translator' : 'Find Interpreter'}</Button>;
            } else if (status === 'PENDING_ASSIGNMENT') {
              actionType = 'warning';
              message = isTranslation 
                ? 'Next Step: Wait for the translator to accept the offer or assign one directly.' 
                : 'Next Step: Wait for the interpreter to accept the offer or assign one directly.';
            } else if (status === 'BOOKED') {
              actionType = 'info';
              message = isTranslation 
                ? `Next Step: Delivery deadline is ${new Date(booking.date).toLocaleDateString()}.`
                : `Next Step: Session takes place on ${new Date(booking.date).toLocaleDateString()}.`;
            } else if (status === 'TIMESHEET_SUBMITTED') {
              actionType = 'action';
              message = isTranslation 
                ? 'Next Step: Translator submitted their delivery. Please verify it.'
                : 'Next Step: Interpreter submitted their timesheet. Please verify it.';
              actionBtn = <Button size="sm" onClick={() => navigate(`/admin/operations/timesheets?jobId=${booking.id}`)}>
                {isTranslation ? 'Review Delivery' : 'Review Timesheet'}
              </Button>;
            } else if (status === BookingStatus.READY_FOR_INVOICE) {
              actionType = 'action';
              message = isTranslation
                ? 'Next Step: Delivery verified. You can now generate the invoice.'
                : 'Next Step: Timesheet verified. You can now generate the invoice.';
              actionBtn = <Button size="sm" onClick={() => navigate(`/admin/billing/client-invoices?clientId=${booking.clientId}&start=${booking.date}&end=${booking.date}`)} icon={Plus}>Generate Invoice</Button>;
            } else if (status === BookingStatus.INVOICED) {
              actionType = 'info';
              message = 'Next Step: Invoice sent. Waiting for client payment.';
            } else if (status === 'PAID') {
              actionType = 'success';
              message = 'Job is fully completed and paid.';
            }

            if (!message) return null;

            const bgClass =
              actionType === 'action' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' :
                actionType === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  actionType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    'bg-blue-50 border-blue-200 text-blue-900';

            return (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${bgClass} shadow-sm`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Next Action</span>
                  <span className="text-sm font-bold">{message}</span>
                </div>
                {actionBtn && <div>{actionBtn}</div>}
              </div>
            );
          })()}

          <Card className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Session & Location</h2>
              <Button variant="ghost" size="sm" onClick={() => { setEditFormData({ ...booking }); setIsEditModalOpen(true); }} icon={Edit}>Edit Job</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Languages</label>
                  <div className="flex items-center mt-1"><Globe2 size={18} className="text-blue-500 mr-2" /><span className="font-medium text-gray-900">{booking.languageFrom} &rarr; {booking.languageTo}</span></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">{booking.serviceType === ServiceType.TRANSLATION ? 'Service' : 'Service & Gender'}</label>
                  <div className="flex items-center mt-1"><User size={18} className="text-indigo-500 mr-2" /><span className="font-medium text-gray-900">{booking.serviceType} {booking.serviceType !== ServiceType.TRANSLATION && booking.genderPreference !== 'None' && `(${booking.genderPreference} Preferred)`}</span></div>
                </div>
                {booking.serviceType === ServiceType.TRANSLATION && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Format & Delivery</label>
                      <div className="flex flex-col mt-1 gap-1">
                        <div className="flex items-center"><FileText size={16} className="text-blue-400 mr-2" /><span className="text-sm font-medium">{booking.translationFormat === 'Other' ? booking.translationFormatOther : booking.translationFormat}</span></div>
                        <div className="flex items-center"><Mail size={16} className="text-slate-400 mr-2" /><span className="text-sm font-medium">{booking.deliveryEmail || 'N/A'}</span></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">{booking.serviceType === ServiceType.TRANSLATION ? 'Delivery Date' : 'Date & Time'}</label>
                  <div className="flex items-center mt-1"><Calendar size={18} className="text-gray-500 mr-2" /><span className="font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</span></div>
                  {booking.serviceType !== ServiceType.TRANSLATION && (
                    <div className="flex items-center mt-1 ml-7"><Clock size={16} className="text-gray-400 mr-2" /><span className="text-sm text-gray-600">{booking.startTime} ({booking.durationMinutes} mins)</span></div>
                  )}
                </div>
                {booking.serviceType === ServiceType.TRANSLATION ? (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Pricing / Quote</label>
                    <div className="mt-1">
                      <Badge variant={booking.quoteRequested ? 'warning' : 'success'}>
                        {booking.quoteRequested ? 'Quote Before Proceeding' : 'Standard Rates Apply'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Location Type</label>
                    <div className="flex items-start mt-1">
                      {booking.locationType === 'ONLINE' ? <Video size={18} className="text-blue-500 mr-2 mt-0.5" /> : <MapPin size={18} className="text-red-500 mr-2 mt-0.5" />}
                      <span className="font-medium text-gray-900 text-sm">
                        {booking.locationType === 'ONLINE' ? (
                          <a href={booking.onlineLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{booking.onlineLink || 'Link TBC'}</a>
                        ) : (
                          `${booking.address || 'Address TBC'}, ${booking.postcode || ''}`
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {booking.serviceType === ServiceType.TRANSLATION && booking.sourceFiles && booking.sourceFiles.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Source Files</label>
                <div className="space-y-2">
                  {booking.sourceFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-xs font-medium text-slate-600">{file.split('/').pop()}</span>
                      </div>
                      <a href={file} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 uppercase hover:underline">Download</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-1 block">Booking Notes</label>
                <p className="text-sm text-amber-900">{booking.notes}</p>
              </div>
            )}
          </Card>

          <Card className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Contact & Organisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Organisation / Client</label>
                  <div className="flex items-center mt-1"><Building2 size={18} className="text-slate-500 mr-2" /><span className="font-medium text-gray-900">{getClientCompany(booking.clientId, booking.guestContact?.organisation || booking.clientName)}</span></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Contact Name</label>
                  <div className="flex items-center mt-1"><User size={18} className="text-slate-500 mr-2" /><span className="font-medium text-gray-900">{booking.guestContact?.name || 'N/A'}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Email & Phone</label>
                  <div className="flex items-center mt-1"><Mail size={16} className="text-slate-400 mr-2" /><span className="text-sm text-gray-900">{booking.guestContact?.email || 'N/A'}</span></div>
                  <div className="flex items-center mt-1"><Phone size={16} className="text-slate-400 mr-2" /><span className="text-sm text-gray-900">{booking.guestContact?.phone || 'N/A'}</span></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Purchase Order / Cost Code</label>
                  <div className="flex items-center mt-1"><CreditCard size={18} className="text-emerald-500 mr-2" /><span className="font-mono text-sm text-emerald-700 font-bold">{booking.costCode || 'N/A'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Patient / Client Name</label>
                  <div className="flex items-center mt-1 font-medium text-gray-900">{booking.patientName || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Professional Name</label>
                  <div className="flex items-center mt-1 font-medium text-gray-900">{booking.professionalName || 'N/A'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Data Consent (GDPR)</label>
                  <div className="flex items-center mt-1">
                    {booking.gdprConsent ? (
                      <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        <CheckCircle2 size={12} className="mr-1" /> CONSENT GIVEN
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <AlertCircle size={12} className="mr-1" /> NOT SPECIFIED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Assignment Section with Chat Button */}
          <Card className="bg-blue-50/50 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center"><UserCircle2 size={16} className="mr-2 text-blue-600" />Assignment</h3>
              {booking.interpreterId && (
                <button
                  onClick={handleStartChat}
                  disabled={processing}
                  className="flex items-center text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MessageSquare size={12} className="mr-1" /> Chat with Int.
                </button>
              )}
            </div>

            <div className="space-y-3">
              {booking.interpreterId ? (
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 transition-transform group-hover:scale-105">
                      <UserCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Assigned Professional</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">{booking.interpreterName}</p>
                      <button
                        onClick={() => handleOpenPreview(booking.interpreterId!)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter mt-1 hover:underline"
                      >
                        Manage Engagement
                      </button>
                    </div>
                  </div>
                  <UserCircle2 size={40} className="absolute right-2 bottom-2 text-slate-100 dark:text-slate-800 -z-0 opacity-20" />
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center text-amber-500 mb-3">
                    <UserPlus size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-4 px-4 uppercase tracking-widest">Awaiting Professional Match</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-slate-900 hover:bg-black text-[10px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-slate-200 dark:shadow-none"
                    onClick={handleOpenAllocation}
                  >
                    Find Match
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Impact Section */}
          {([BookingStatus.READY_FOR_INVOICE, BookingStatus.INVOICED, BookingStatus.PAID].map(String).includes(String(booking.status)) && timesheet) && (
            <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2"><TrendingUp size={16} /> Financial Impact</h3>
                <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200 uppercase">Verified</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Revenue</p>
                    <p className="text-xl font-black text-emerald-900 leading-none">£{timesheet.clientAmountCalculated?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cost</p>
                    <p className="text-xl font-black text-slate-600 leading-none">£{timesheet.interpreterAmountCalculated?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-emerald-800/60 uppercase">
                    <span>Session</span>
                    <span className="text-right">£{timesheet.interpreterAmountCalculated?.toFixed(2)}</span>
                  </div>
                  {(timesheet.travelFees || 0) > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500 uppercase">
                      <span>Travel ({timesheet.travelTimeMinutes}m)</span>
                      <span className="text-right">£{timesheet.travelFees?.toFixed(2)}</span>
                    </div>
                  )}
                  {(timesheet.mileageFees || 0) > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500 uppercase">
                      <span>Mileage ({timesheet.mileage}m)</span>
                      <span className="text-right">£{timesheet.mileageFees?.toFixed(2)}</span>
                    </div>
                  )}
                  {((timesheet.parking || 0) + (timesheet.transport || 0)) > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500 uppercase">
                      <span>Expenses</span>
                      <span className="text-right">£{((timesheet.parking || 0) + (timesheet.transport || 0)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Gross Profit</p>
                      <p className="text-2xl font-black text-emerald-700 leading-none">
                        £{((timesheet.clientAmountCalculated || 0) - (timesheet.interpreterAmountCalculated || 0)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => PdfService.generateClientInvoice({
                          id: `INV-${booking.id.substring(0, 6)}`,
                          clientName: booking.clientName,
                          reference: booking.bookingRef || booking.id,
                          issueDate: new Date().toISOString(),
                          totalAmount: timesheet.clientAmountCalculated,
                          items: [{
                            description: `Interpreting Services: ${booking.languageFrom} to ${booking.languageTo} (${new Date(booking.date).toLocaleDateString()})`,
                            rate: timesheet.clientAmountCalculated,
                            units: 1,
                            total: timesheet.clientAmountCalculated
                          }]
                        } as any)}
                        icon={CreditCard}
                      >
                        Download Invoice
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 border-emerald-100 border"
                        onClick={() => PdfService.generateRemittance({
                          id: `REM-${booking.id.substring(0, 6)}`,
                          interpreterName: booking.interpreterName || 'Interpreter',
                          totalAmount: timesheet.interpreterAmountCalculated,
                          items: [{
                            jobRef: booking.bookingRef || booking.id.substring(0, 6),
                            date: booking.date,
                            description: `Payment for ${booking.languageTo} service`,
                            total: timesheet.interpreterAmountCalculated
                          }]
                        })}
                        icon={Receipt}
                      >
                        Remittance Advice
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Job Timeline */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-6 flex items-center"><History size={16} className="mr-2 text-slate-400" /> Operation Audit Trail</h3>
            <ActivityTimeline events={events} isLoading={loading} />
          </Card>
        </div>
      </div>
      <InterpreterAllocationDrawer
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
        job={booking}
        onSuccess={() => id && loadBookingData(id)}
      />

      <InterpreterPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        interpreterId={selectedInterpId}
        jobId={booking.id}
        onSuccess={() => id && loadBookingData(id)}
      />

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Booking Details" maxWidth="3xl">
        <form onSubmit={handleUpdateBooking} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
          {/* Section 1: Session */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider">Session Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language From</label>
                <select
                  className="w-full p-2 border rounded-lg text-sm bg-white"
                  value={editFormData.languageFrom || ''}
                  onChange={e => setEditFormData({ ...editFormData, languageFrom: e.target.value })}
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language To</label>
                <select
                  className="w-full p-2 border rounded-lg text-sm bg-white"
                  value={editFormData.languageTo || ''}
                  onChange={e => setEditFormData({ ...editFormData, languageTo: e.target.value })}
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{editFormData.serviceType === ServiceType.TRANSLATION ? 'Delivery Date' : 'Date'}</label>
                <input type="date" className="w-full p-2 border rounded-lg text-sm" value={editFormData.date || ''} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })} />
              </div>
              {editFormData.serviceType !== ServiceType.TRANSLATION && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                    <input type="time" className="w-full p-2 border rounded-lg text-sm" value={editFormData.startTime || ''} onChange={e => setEditFormData({ ...editFormData, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Min)</label>
                    <input type="number" className="w-full p-2 border rounded-lg text-sm" value={editFormData.durationMinutes || ''} onChange={e => setEditFormData({ ...editFormData, durationMinutes: Number(e.target.value) })} />
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Category</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm bg-white" 
                  value={editFormData.serviceCategory || ''} 
                  onChange={e => setEditFormData({ ...editFormData, serviceCategory: e.target.value as any })}
                >
                  <option value="">Default (Linguist)</option>
                  <option value="Linguist">Linguist</option>
                  <option value="Solicitor">Solicitor</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Session Mode</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm bg-white" 
                  value={editFormData.sessionMode || ''} 
                  onChange={e => setEditFormData({ ...editFormData, sessionMode: e.target.value as any })}
                >
                  <option value="">Select Mode</option>
                  <option value="Face-to-Face">Face-to-Face</option>
                  <option value="Videocall">Videocall</option>
                  <option value="Telephone">Telephone</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Type</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm bg-white" 
                  value={editFormData.serviceType} 
                  onChange={e => setEditFormData({ ...editFormData, serviceType: e.target.value as ServiceType })}
                >
                  {Object.values(ServiceType).map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="editIsOOH" checked={editFormData.isOOH} onChange={e => setEditFormData({ ...editFormData, isOOH: e.target.checked })} />
                  <label htmlFor="editIsOOH" className="text-sm font-medium">Out of Hours (OOH)</label>
                </div>
                {editFormData.serviceType !== ServiceType.TRANSLATION && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender Pref.</label>
                    <select className="w-full p-2 border rounded-lg text-sm bg-white" value={editFormData.genderPreference} onChange={e => setEditFormData({ ...editFormData, genderPreference: e.target.value as any })}>
                      <option value="None">None</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {editFormData.serviceType === ServiceType.TRANSLATION && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 group animate-in fade-in slide-in-from-top-1">
                <div className="md:col-span-2 font-bold text-xs text-blue-600 uppercase tracking-widest">Translation Specifics</div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Output Format</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={editFormData.translationFormat}
                    onChange={e => setEditFormData({ ...editFormData, translationFormat: e.target.value })}
                  >
                    {['Body of Email', 'Only Word', 'Only Pdf', 'Word+Pdf', 'Leaflet', 'Other'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Email</label>
                  <input 
                    type="email"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={editFormData.deliveryEmail || ''}
                    onChange={e => setEditFormData({ ...editFormData, deliveryEmail: e.target.value })}
                  />
                </div>
                {editFormData.translationFormat === 'Other' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specify Format</label>
                    <input 
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={editFormData.translationFormatOther || ''}
                      onChange={e => setEditFormData({ ...editFormData, translationFormatOther: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="editQuoteRequested"
                    checked={editFormData.quoteRequested}
                    onChange={e => setEditFormData({ ...editFormData, quoteRequested: e.target.checked })}
                  />
                  <label htmlFor="editQuoteRequested" className="text-sm font-medium">Quote Requested</label>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Location - Only for interpreting */}
          {editFormData.serviceType !== ServiceType.TRANSLATION && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider">Location</h4>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={editFormData.locationType === 'ONSITE'} onChange={() => setEditFormData({ ...editFormData, locationType: 'ONSITE' })} /> Onsite
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={editFormData.locationType === 'ONLINE'} onChange={() => setEditFormData({ ...editFormData, locationType: 'ONLINE' })} /> Online
                </label>
              </div>
              {editFormData.locationType === 'ONLINE' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meeting Link</label>
                  <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editFormData.onlineLink || ''} onChange={e => setEditFormData({ ...editFormData, onlineLink: e.target.value })} placeholder="https://..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                    <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editFormData.address || ''} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label>
                    <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editFormData.postcode || ''} onChange={e => setEditFormData({ ...editFormData, postcode: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Section 3: Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider">Patient & Professional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name / Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.patientName || ''}
                  onChange={e => setEditFormData({ ...editFormData, patientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Professional Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.professionalName || ''}
                  onChange={e => setEditFormData({ ...editFormData, professionalName: e.target.value })}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider">Contact & Billing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.guestContact?.name || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    guestContact: { ...(editFormData.guestContact || { name: '', organisation: '', email: '', phone: '' }), name: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organisation</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.guestContact?.organisation || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    guestContact: { ...(editFormData.guestContact || { name: '', organisation: '', email: '', phone: '' }), organisation: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.guestContact?.email || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    guestContact: { ...(editFormData.guestContact || { name: '', organisation: '', email: '', phone: '' }), email: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={editFormData.guestContact?.phone || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    guestContact: { ...(editFormData.guestContact || { name: '', organisation: '', email: '', phone: '' }), phone: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purchase Order / Cost Code</label>
              <input type="text" className="w-full p-2 border rounded-lg text-sm font-mono" value={editFormData.costCode || ''} onChange={e => setEditFormData({ ...editFormData, costCode: e.target.value })} />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
            <textarea className="w-full p-2 border rounded-lg text-sm min-h-[100px]" value={editFormData.notes || ''} onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })} placeholder="Add specific instructions for the interpreter..."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={processing}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Booking"
      >
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-red-900">This action is irreversible!</p>
              <p className="text-xs text-red-700 mt-1">This will permanently delete the booking and all related offers/assignments.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              Type <span className="text-red-600 font-black underline">DELETE</span> to confirm
            </label>
            <input
              type="text"
              className="w-full p-4 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-colors font-bold text-center text-lg"
              placeholder="Type Delete here..."
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirmText.toLowerCase() !== 'delete' || processing}
              isLoading={processing}
              onClick={handleFinalDelete}
              icon={Trash2}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBookingDetails;