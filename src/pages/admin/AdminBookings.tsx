import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';
import { useBookingViews } from '../../hooks/useBookingViews';
import { StatusBadge } from '../../components/StatusBadge';
import { Search, MapPin, Video, Plus, Clock, UserPlus, Building2, Globe2, User, UserCheck, X, Mail, Phone, Calendar, Info, LayoutList, TableProperties, UserMinus, PanelLeftClose, PanelLeftOpen, Pencil, Eye, EyeOff, Filter, SortAsc, Layers, ChevronDown, ChevronUp, Trash2, MoreVertical, ExternalLink, Lock, Globe, Copy, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { ClientService, InterpreterService, BookingService as RawBookingService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Interpreter, Booking, BookingStatus, BookingColumnField, ALL_BOOKING_COLUMNS, ViewFilterRule, ViewSortRule, GroupableField, FilterableField, SortableField } from '../../types';

export const AdminBookings = () => {
  const { user, isSuperAdmin } = useAuth();
  const { bookings = [], loading, error, refresh } = useBookings();
  const { views, activeView, activeViewId, setActiveViewId, saveCustomView, deleteCustomView, updateCustomView } = useBookingViews(user?.id || '');

  const [filter, setFilter] = useState('');
  const [allInterpreters, setAllInterpreters] = useState<Interpreter[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInterpreter, setSelectedInterpreter] = useState<Interpreter | null>(null);
  const [isInterpreterModalOpen, setIsInterpreterModalOpen] = useState(false);
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  // Quick-view modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalBooking, setModalBooking] = useState<Booking | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);
  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; booking: Booking } | null>(null);
  const [isGlobalSettingsModalOpen, setIsGlobalSettingsModalOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    ClientService.getAll();
    loadInterpreters();
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  const openBookingModal = (booking: Booking) => {
    setModalBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, booking: Booking) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, booking });
  };

  const handleQuickStatusChange = async (booking: Booking, status: BookingStatus) => {
    setStatusChanging(true);
    try {
      await RawBookingService.updateStatus(booking.id, status);
      refresh();
      if (modalBooking?.id === booking.id) setModalBooking((prev: Booking | null) => prev ? { ...prev, status } : null);
    } catch (e) { alert('Failed to update status'); }
    finally { setStatusChanging(false); setContextMenu(null); }
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setContextMenu(null);
  };

  const loadInterpreters = async () => {
    try {
      const ints = await InterpreterService.getAll();
      setAllInterpreters(ints.filter(i => i.status === 'ACTIVE'));
    } catch (e) {
      console.error("Failed to load interpreters");
    }
  };

  const handleAssignClick = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setAssignSearch(booking.languageTo); // Pre-fill with language
    setIsAssignModalOpen(true);
  };

  const confirmAssign = async (interpreter: Interpreter) => {
    if (!selectedBooking) return;
    setAssignLoading(true);
    try {
      await RawBookingService.assignInterpreterToBooking(selectedBooking.id, interpreter.id);
      setIsAssignModalOpen(false);
      refresh();
    } catch (e) {
      alert("Failed to assign interpreter");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassign = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to unassign this interpreter?")) return;
    setUnassigningId(bookingId);
    try {
      await RawBookingService.unassignInterpreterFromBooking(bookingId);
      refresh();
    } catch (e) {
      alert("Failed to unassign interpreter");
    } finally {
      setUnassigningId(null);
    }
  };

  const handleInterpreterClick = (e: React.MouseEvent, interpreterId: string) => {
    e.stopPropagation();
    const interp = allInterpreters.find(i => i.id === interpreterId);
    if (interp) {
      setSelectedInterpreter(interp);
      setIsInterpreterModalOpen(true);
    }
  };

  const safe = (val: unknown) => String(val ?? "").toLowerCase();

  const filteredBookings = (bookings ?? []).filter((b: Booking) => {
    const q = safe(filter);
    const matchesSearch = !q || (
      safe(b?.clientName).includes(q) ||
      safe(b?.guestContact?.organisation).includes(q) ||
      safe(b?.status).includes(q) ||
      safe(b?.bookingRef).includes(q) ||
      safe(b?.languageTo).includes(q) ||
      safe(b?.interpreterName).includes(q)
    );

    if (!matchesSearch) return false;

    // View Filters
    if (activeView.filters) {
      if (activeView.filters.statuses && activeView.filters.statuses.length > 0) {
        if (!activeView.filters.statuses.includes(b.status)) return false;
      }
      if (activeView.filters.hasInterpreter !== undefined) {
        const has = !!b.interpreterId;
        if (has !== activeView.filters.hasInterpreter) return false;
      }
      if (activeView.filters.interpreterId) {
        if (b.interpreterId !== activeView.filters.interpreterId) return false;
      }
      if (activeView.filters.dateRange && activeView.filters.dateRange !== 'ALL') {
        const d = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bDate = new Date(d);
        bDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        switch (activeView.filters.dateRange) {
          case 'TODAY':
            if (diffDays !== 0) return false;
            break;
          case 'TOMORROW':
            if (diffDays !== 0 && diffDays !== 1) return false; // Today & Tomorrow combined
            break;
          case 'NEXT_7_DAYS':
            if (diffDays < 0 || diffDays > 7) return false;
            break;
          case 'THIS_MONTH':
            if (bDate.getMonth() !== today.getMonth() || bDate.getFullYear() !== today.getFullYear()) return false;
            break;
        }
      }
    }
    return true;
  }).sort((a: Booking, b: Booking) => {
    if (activeView.sortBy === 'dateDesc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (activeView.sortBy === 'dateAsc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (activeView.sortBy === 'status') {
      const diff = a.status.localeCompare(b.status);
      if (diff !== 0) return diff;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (activeView.sortBy === 'client') {
      const diff = (a.clientName || '').localeCompare(b.clientName || '');
      if (diff !== 0) return diff;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const [newViewName, setNewViewName] = useState('');
  const [newViewTab, setNewViewTab] = useState<'filters' | 'fields' | 'group' | 'sort'>('filters');
  // Filters tab
  const [newViewStatuses, setNewViewStatuses] = useState<BookingStatus[]>([]);
  const [newViewDateRange, setNewViewDateRange] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'THIS_MONTH'>('ALL');
  const [newViewHasInterpreter, setNewViewHasInterpreter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  // Fields tab
  const [newViewHiddenFields, setNewViewHiddenFields] = useState<BookingColumnField[]>([]);
  // Group tab
  const [newViewGroupBy, setNewViewGroupBy] = useState<GroupableField | ''>('');
  // Sort tab
  const [newViewSortRules, setNewViewSortRules] = useState<ViewSortRule[]>([{ field: 'date', direction: 'desc' }]);

  const openEditModal = (view: typeof activeView) => {
    setEditingViewId(view.id);
    setNewViewName(view.name);
    setNewViewTab('filters');
    setNewViewStatuses(view.filters?.statuses || []);
    setNewViewDateRange(view.filters?.dateRange || 'ALL');
    setNewViewHasInterpreter(
      view.filters?.hasInterpreter === undefined ? 'ALL' :
        view.filters.hasInterpreter ? 'ASSIGNED' : 'UNASSIGNED'
    );
    setNewViewHiddenFields(view.hiddenFields || []);
    setNewViewGroupBy(view.groupBy || '');
    setNewViewSortRules(view.sortRules?.length ? view.sortRules : [{ field: 'date', direction: 'desc' }]);
    setIsCreateViewModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingViewId(null);
    setNewViewName('');
    setNewViewTab('filters');
    setNewViewStatuses([]);
    setNewViewDateRange('ALL');
    setNewViewHasInterpreter('ALL');
    setNewViewHiddenFields([]);
    setNewViewGroupBy('');
    setNewViewSortRules([{ field: 'date', direction: 'desc' }]);
    setIsCreateViewModalOpen(true);
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    const viewData = {
      name: newViewName.trim(),
      icon: 'table',
      sortBy: (activeView.sortBy || 'dateDesc') as any,
      filters: {
        statuses: newViewStatuses.length > 0 ? newViewStatuses : undefined,
        dateRange: newViewDateRange !== 'ALL' ? newViewDateRange : undefined,
        hasInterpreter: newViewHasInterpreter === 'ALL' ? undefined : (newViewHasInterpreter === 'ASSIGNED')
      },
      hiddenFields: newViewHiddenFields,
      groupBy: newViewGroupBy,
      sortRules: newViewSortRules,
    };
    if (editingViewId) {
      updateCustomView(editingViewId, viewData);
    } else {
      saveCustomView(viewData);
    }
    setIsCreateViewModalOpen(false);
    setEditingViewId(null);
  };

  const SORT_FIELD_LABELS: Record<SortableField, string> = {
    date: 'Date', status: 'Status', client: 'Client', interpreter: 'Interpreter',
    languageTo: 'Language', duration: 'Duration', amount: 'Amount',
  };
  const GROUP_FIELD_LABELS: Record<GroupableField, string> = {
    status: 'Status', languageTo: 'Language', serviceType: 'Service Type',
    locationType: 'Location', date: 'Date',
  };

  // View toolbar active indicators
  const hasActiveFilters = (activeView.filters?.statuses?.length ?? 0) > 0
    || (activeView.filters?.dateRange && activeView.filters.dateRange !== 'ALL')
    || activeView.filters?.hasInterpreter !== undefined;
  const hiddenCount = activeView.hiddenFields?.length ?? 0;
  const hasGroup = !!(activeView.groupBy);
  const hasSort = (activeView.sortRules?.length ?? 0) > 0;

  // Apply advanced sort rules
  const applySort = (bookings: Booking[]) => {
    if (!activeView.sortRules?.length) return bookings;
    return [...bookings].sort((a, b) => {
      for (const rule of activeView.sortRules!) {
        let diff = 0;
        if (rule.field === 'date') diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        else if (rule.field === 'status') diff = a.status.localeCompare(b.status);
        else if (rule.field === 'client') diff = (a.clientName || '').localeCompare(b.clientName || '');
        else if (rule.field === 'interpreter') diff = (a.interpreterName || '').localeCompare(b.interpreterName || '');
        else if (rule.field === 'languageTo') diff = (a.languageTo || '').localeCompare(b.languageTo || '');
        else if (rule.field === 'duration') diff = (a.durationMinutes || 0) - (b.durationMinutes || 0);
        if (diff !== 0) return rule.direction === 'asc' ? diff : -diff;
      }
      return 0;
    });
  };

  const getGroupKey = (booking: Booking, field: string): string => {
    switch (field) {
      case 'status': return booking.status || 'Unknown';
      case 'languageTo': return booking.languageTo || 'Unknown';
      case 'serviceType': return booking.serviceType || 'Unknown';
      case 'locationType': return booking.locationType || 'Unknown';
      case 'date': return new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      default: return 'Other';
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Build grouped structure when groupBy is active
  const groupedBookings: { key: string; bookings: Booking[] }[] | null = activeView.groupBy
    ? Object.entries(
      filteredBookings.reduce((acc: Record<string, Booking[]>, b: Booking) => {
        const k = getGroupKey(b, activeView.groupBy!);
        if (!acc[k]) acc[k] = [];
        acc[k].push(b);
        return acc;
      }, {})
    ).map(([key, bookings]) => ({ key, bookings }))
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar for Views */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-64' : 'hidden lg:block lg:w-16'} flex-shrink-0`}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
          <div className={`p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center sm:flex-row ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2 sm:mb-0">
                <LayoutList size={18} className="text-blue-600" />
                Views
              </h3>
            )}
            <div className="flex items-center gap-1">
              {isSidebarOpen && isSuperAdmin && (
                <button
                  onClick={() => setIsGlobalSettingsModalOpen(true)}
                  className="p-1.5 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-sm transition-colors"
                  title="Global View Settings"
                >
                  <Layers size={18} />
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg shadow-sm transition-colors"
                title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {views.map(view => (
              <div key={view.id} className="group relative">
                <button
                  onClick={() => setActiveViewId(view.id)}
                  title={!isSidebarOpen ? view.name : undefined}
                  className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2 rounded-xl text-left transition-all ${activeViewId === view.id
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <div className={`${activeViewId === view.id ? 'text-blue-500' : 'text-slate-400'} flex-shrink-0`}>
                    {view.icon === 'table' && <TableProperties size={16} />}
                    {view.icon === 'calendar' && <Calendar size={16} />}
                    {view.icon === 'user-minus' && <UserMinus size={16} />}
                  </div>
                  {isSidebarOpen && <span className="text-sm font-medium truncate flex-1 leading-snug pr-12">{view.name}</span>}
                </button>

                {isSidebarOpen && activeViewId === view.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(view);
                      }}
                      className="p-1 rounded-md hover:bg-blue-200 text-blue-500 transition-colors"
                      title="Edit View"
                    >
                      <Pencil size={14} />
                    </button>
                    {!view.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete custom view?')) deleteCustomView(view.id);
                        }}
                        className="p-1 rounded-md hover:bg-red-200 text-red-500 transition-colors"
                        title="Delete View"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={openCreateModal}
              className={`w-full mt-3 flex items-center justify-center ${isSidebarOpen ? 'gap-2 px-3' : 'px-0'} py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-bold`}
              title="Create Custom View"
            >
              <Plus size={16} />
              {isSidebarOpen && "Create Custom View"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {activeView.name}
              {!activeView.isSystem && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase font-bold tracking-wider">Custom</span>}
            </h1>
            <p className="text-gray-500 text-sm">System-wide requests</p>
          </div>
          <Button onClick={() => navigate('/admin/bookings/new')} icon={Plus}>Create Booking</Button>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2">
          <div className="flex-1 relative w-full h-10">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search clients, ref or status..."
              className="pl-10 pr-4 py-2 bg-transparent text-sm w-full h-full outline-none focus:ring-0 text-slate-900"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* View Toolbar */}
        {(hasActiveFilters || hiddenCount > 0 || hasGroup || hasSort) && (
          <div className="flex flex-wrap gap-2 -mt-2">
            {hiddenCount > 0 && (
              <button onClick={() => { openEditModal(activeView); setNewViewTab('fields'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-semibold transition-all">
                <EyeOff size={12} />{hiddenCount} hidden fields
              </button>
            )}
            {hasActiveFilters && (
              <button onClick={() => { openEditModal(activeView); setNewViewTab('filters'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-semibold transition-all">
                <Filter size={12} />Filtered by Status
              </button>
            )}
            {hasGroup && (
              <button onClick={() => { openEditModal(activeView); setNewViewTab('group'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-full text-xs font-semibold transition-all">
                <Layers size={12} />Grouped by {GROUP_FIELD_LABELS[activeView.groupBy as GroupableField]}
              </button>
            )}
            {hasSort && (
              <button onClick={() => { openEditModal(activeView); setNewViewTab('sort'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full text-xs font-semibold transition-all">
                <SortAsc size={12} />Sorted by {activeView.sortRules?.length} field{(activeView.sortRules?.length ?? 0) > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="py-12 text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description={filter ? "Adjust your search filters." : "No bookings in the system."}
            actionLabel={filter ? "Clear Filters" : "Refresh"}
            onAction={filter ? () => setFilter('') : refresh}
          />
        ) : (
          <Card padding="none" className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref / Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Interpreter</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {groupedBookings ? (
                    // --- GROUPED RENDERING ---
                    groupedBookings.flatMap(({ key, bookings: groupRows }) => {
                      const isCollapsed = collapsedGroups.has(key);
                      return [
                        // Group Header Row
                        <tr
                          key={`group-header-${key}`}
                          className="bg-slate-50 hover:bg-slate-100 cursor-pointer select-none transition-colors"
                          onClick={() => toggleGroup(key)}
                        >
                          <td colSpan={6} className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                              </span>
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{key}</span>
                              <span className="ml-auto text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                {groupRows.length} job{groupRows.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                        </tr>,
                        // Group Rows (hidden when collapsed)
                        ...(isCollapsed ? [] : groupRows.map((booking) => (
                          <tr
                            key={booking.id}
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            onClick={() => openBookingModal(booking)}
                            onContextMenu={(e) => handleContextMenu(e, booking)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600 hidden sm:block border border-blue-100 shadow-sm">
                                  <Clock size={16} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900 leading-none">
                                    {new Date(booking.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                  </div>
                                  <div className="text-xs font-bold text-blue-600 mt-1">{booking.startTime}</div>
                                  <div className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Ref: {booking.bookingRef || 'TBD'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                  <Building2 size={14} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{booking.guestContact?.organisation || booking.clientName}</div>
                                  <div className="text-xs text-slate-500">{booking.guestContact?.name || 'Main Contact'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm font-bold text-slate-800">
                                  <Globe2 size={12} className="mr-1.5 text-blue-500" />
                                  {booking.languageFrom} &rarr; {booking.languageTo}
                                </div>
                                <div className="flex items-center text-xs text-slate-500">
                                  {booking.locationType === 'ONLINE' ? <Video size={12} className="mr-1.5 text-indigo-500" /> : <MapPin size={12} className="mr-1.5 text-red-500" />}
                                  {booking.serviceType}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {booking.interpreterId ? (
                                <div className="flex items-center group/int">
                                  <button
                                    onClick={(e) => handleInterpreterClick(e, booking.interpreterId!)}
                                    className="flex items-center hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-all text-left border border-transparent hover:border-slate-200 max-w-[160px]"
                                  >
                                    <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center mr-2 shadow-sm border border-emerald-100 shrink-0">
                                      <UserCheck size={12} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">Assigned</div>
                                      <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                                        {booking.interpreterName || 'Profile'}
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => handleUnassign(e, booking.id)}
                                    disabled={unassigningId === booking.id}
                                    className="ml-1 p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover/int:opacity-100 shrink-0 border border-transparent hover:border-red-100"
                                    title="Unassign Interpreter"
                                  >
                                    {unassigningId === booking.id ? <Spinner size="sm" /> : <X size={12} />}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleAssignClick(e, booking)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase hover:bg-amber-100 transition-all border border-amber-200 shadow-sm"
                                >
                                  <UserPlus size={12} />
                                  Assign
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleContextMenu(e, booking); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                                title="Quick actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        )))
                      ];
                    })
                  ) : (
                    // --- FLAT RENDERING (no groupBy) ---
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => openBookingModal(booking)}
                        onContextMenu={(e) => handleContextMenu(e, booking)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600 hidden sm:block border border-blue-100 shadow-sm">
                              <Clock size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 leading-none">
                                {new Date(booking.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                              </div>
                              <div className="text-xs font-bold text-blue-600 mt-1">{booking.startTime}</div>
                              <div className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Ref: {booking.bookingRef || 'TBD'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                              <Building2 size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{booking.guestContact?.organisation || booking.clientName}</div>
                              <div className="text-xs text-slate-500">{booking.guestContact?.name || 'Main Contact'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-bold text-slate-800">
                              <Globe2 size={12} className="mr-1.5 text-blue-500" />
                              {booking.languageFrom} &rarr; {booking.languageTo}
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                              {booking.locationType === 'ONLINE' ? <Video size={12} className="mr-1.5 text-indigo-500" /> : <MapPin size={12} className="mr-1.5 text-red-500" />}
                              {booking.serviceType}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {booking.interpreterId ? (
                            <div className="flex items-center group/int">
                              <button
                                onClick={(e) => handleInterpreterClick(e, booking.interpreterId!)}
                                className="flex items-center hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-all text-left border border-transparent hover:border-slate-200 max-w-[160px]"
                              >
                                <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center mr-2 shadow-sm border border-emerald-100 shrink-0">
                                  <UserCheck size={12} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">Assigned</div>
                                  <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                                    {booking.interpreterName || 'Profile'}
                                  </div>
                                </div>
                              </button>
                              <button
                                onClick={(e) => handleUnassign(e, booking.id)}
                                disabled={unassigningId === booking.id}
                                className="ml-1 p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover/int:opacity-100 shrink-0 border border-transparent hover:border-red-100"
                                title="Unassign Interpreter"
                              >
                                {unassigningId === booking.id ? <Spinner size="sm" /> : <X size={12} />}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleAssignClick(e, booking)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase hover:bg-amber-100 transition-all border border-amber-200 shadow-sm"
                            >
                              <UserPlus size={12} />
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleContextMenu(e, booking); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                            title="Quick actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create/Edit View Modal - Tabbed */}
        <Modal
          isOpen={isCreateViewModalOpen}
          onClose={() => setIsCreateViewModalOpen(false)}
          title={editingViewId ? 'Edit View' : 'Create Custom View'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">View Name</label>
              <input
                type="text"
                placeholder="e.g., Urgent Spanish Jobs"
                value={newViewName}
                onChange={e => setNewViewName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {(['filters', 'fields', 'group', 'sort'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setNewViewTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold capitalize border-b-2 transition-all ${newViewTab === tab
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {tab === 'filters' && <Filter size={12} />}
                  {tab === 'fields' && <Eye size={12} />}
                  {tab === 'group' && <Layers size={12} />}
                  {tab === 'sort' && <SortAsc size={12} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* --- FILTERS TAB --- */}
            {newViewTab === 'filters' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Status Filter</label>
                  <div className="flex flex-wrap gap-2">
                    {[BookingStatus.INCOMING, BookingStatus.OPENED, BookingStatus.BOOKED, BookingStatus.ADMIN,
                    BookingStatus.INVOICING, BookingStatus.INVOICED, BookingStatus.PAID, BookingStatus.CANCELLED].map(status => (
                      <button
                        key={status}
                        onClick={() => setNewViewStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newViewStatuses.includes(status)
                          ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date Range</label>
                    <select value={newViewDateRange} onChange={e => setNewViewDateRange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="ALL">All Dates</option>
                      <option value="TODAY">Today</option>
                      <option value="TOMORROW">Today & Tomorrow</option>
                      <option value="NEXT_7_DAYS">Next 7 Days</option>
                      <option value="THIS_MONTH">This Month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Assignment</label>
                    <select value={newViewHasInterpreter} onChange={e => setNewViewHasInterpreter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="ALL">Any</option>
                      <option value="ASSIGNED">Assigned Only</option>
                      <option value="UNASSIGNED">Unassigned Only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- FIELDS TAB --- */}
            {newViewTab === 'fields' && (
              <div className="space-y-1">
                <p className="text-xs text-slate-500 mb-3">Toggle which columns are visible in this view.</p>
                {ALL_BOOKING_COLUMNS.map(col => {
                  const isHidden = newViewHiddenFields.includes(col.field);
                  return (
                    <div key={col.field}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">
                      <span className="text-sm font-medium text-slate-700">{col.label}</span>
                      <button
                        onClick={() => setNewViewHiddenFields(prev =>
                          isHidden ? prev.filter(f => f !== col.field) : [...prev, col.field]
                        )}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isHidden
                          ? 'bg-slate-100 border-slate-200 text-slate-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}
                      >
                        {isHidden ? <><EyeOff size={12} />Hidden</> : <><Eye size={12} />Visible</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- GROUP TAB --- */}
            {newViewTab === 'group' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Group rows by a field to create visual sections.</p>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Group By</label>
                  <select value={newViewGroupBy} onChange={e => setNewViewGroupBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">No Grouping</option>
                    <option value="status">Status</option>
                    <option value="languageTo">Language</option>
                    <option value="serviceType">Service Type</option>
                    <option value="locationType">Location Type</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                {newViewGroupBy && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs text-violet-700 font-medium">
                    Bookings will be grouped by <strong>{GROUP_FIELD_LABELS[newViewGroupBy as GroupableField]}</strong>. Each group will have a collapsible header.
                  </div>
                )}
              </div>
            )}

            {/* --- SORT TAB --- */}
            {newViewTab === 'sort' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Add multiple sort rules. The first rule takes priority.</p>
                <div className="space-y-2">
                  {newViewSortRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                      <span className="text-xs text-slate-400 font-bold w-6 text-center">{index + 1}</span>
                      <select value={rule.field}
                        onChange={e => setNewViewSortRules(prev => prev.map((r, i) => i === index ? { ...r, field: e.target.value as SortableField } : r))}
                        className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none">
                        {(Object.keys(SORT_FIELD_LABELS) as SortableField[]).map(f => (
                          <option key={f} value={f}>{SORT_FIELD_LABELS[f]}</option>
                        ))}
                      </select>
                      <select value={rule.direction}
                        onChange={e => setNewViewSortRules(prev => prev.map((r, i) => i === index ? { ...r, direction: e.target.value as 'asc' | 'desc' } : r))}
                        className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none">
                        <option value="asc">A → Z</option>
                        <option value="desc">Z → A</option>
                      </select>
                      {newViewSortRules.length > 1 && (
                        <button onClick={() => setNewViewSortRules(prev => prev.filter((_, i) => i !== index))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {newViewSortRules.length < 4 && (
                  <button
                    onClick={() => setNewViewSortRules(prev => [...prev, { field: 'date', direction: 'asc' }])}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    <Plus size={14} /> Add Sort Rule
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateViewModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveView} disabled={!newViewName.trim()}>Save View</Button>
            </div>
          </div>
        </Modal>

        {/* Assignment Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Interpreter for ${selectedBooking?.bookingRef}`}
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by name or language..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm shadow-sm transition-all"
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1">
              {allInterpreters
                .filter(i =>
                  i.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                  i.languages.some(l => l.toLowerCase().includes(assignSearch.toLowerCase()))
                )
                .map(interpreter => (
                  <div
                    key={interpreter.id}
                    className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm bg-white"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 font-bold text-sm shadow-sm border border-blue-100">
                        {interpreter.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{interpreter.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{interpreter.languages.slice(0, 3).join(', ')}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => confirmAssign(interpreter)}
                      isLoading={assignLoading}
                      className="text-xs px-3 py-1 h-7"
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              {allInterpreters.length === 0 && <p className="text-center text-slate-400 py-4 text-sm font-medium">No interpreters found.</p>}
            </div>
          </div>
        </Modal>

        {/* Interpreter Info Modal */}
        <Modal
          isOpen={isInterpreterModalOpen}
          onClose={() => setIsInterpreterModalOpen(false)}
          title="Interpreter Profile"
        >
          {selectedInterpreter && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-black shadow-sm">
                  {selectedInterpreter.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedInterpreter.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[9px] font-bold uppercase tracking-wider">{selectedInterpreter.status}</span>
                    {selectedInterpreter.isAvailable && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[9px] font-bold uppercase tracking-wider">Available</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Mail size={10} /> Contact Info
                    </label>
                    <div className="text-[13px] font-medium text-slate-700 truncate">{selectedInterpreter.email}</div>
                    <div className="text-[13px] font-medium text-slate-700 mt-1">{selectedInterpreter.phone}</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Calendar size={10} /> DBS Security
                    </label>
                    <div className="text-[13px] font-medium text-slate-700">Expires: {selectedInterpreter.dbsExpiry}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Languages</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInterpreter.languages.map(l => (
                        <span key={l} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold shadow-sm">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Regions</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInterpreter.regions.map(r => (
                        <span key={r} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold shadow-sm">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/interpreters/${selectedInterpreter.id}`)}
                  className="text-xs px-3 py-1.5"
                >
                  View Full Profile
                </Button>
                <Button onClick={() => setIsInterpreterModalOpen(false)} className="text-xs px-3 py-1.5">Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Booking Quick-View Modal */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title="Booking Details"
          maxWidth="4xl"
        >
          {modalBooking && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Header Information */}
                <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-blue-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Schedule</h3>
                      <div className="text-xl font-black text-slate-900 leading-tight">
                        {new Date(modalBooking.date).toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        {modalBooking.startTime} &ndash; {modalBooking.endTime} ({modalBooking.durationMinutes} min)
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={modalBooking.status} size="lg" />
                </div>

                {/* Core Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Client</span>
                    </div>
                    <div className="font-bold text-slate-900">{modalBooking.clientName}</div>
                    <div className="text-xs text-slate-500">
                      Organisation: {modalBooking.guestContact?.organisation || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Service</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {modalBooking.languageFrom} &rarr; {modalBooking.languageTo}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                      {modalBooking.locationType === 'ONLINE' ? <Video size={14} className="text-indigo-500" /> : <MapPin size={14} className="text-red-500" />}
                      {modalBooking.serviceType} ({modalBooking.locationType})
                    </div>
                  </div>
                </div>

                {/* Patient/Guest Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <User size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Patient / Guest Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name</div>
                      <div className="text-sm font-bold text-slate-800">{modalBooking.guestContact?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contact</div>
                      <div className="text-sm font-bold text-slate-800">{modalBooking.guestContact?.phone || modalBooking.guestContact?.email || 'N/A'}</div>
                    </div>
                    {modalBooking.patientReference && (
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Reference</div>
                        <div className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                          {modalBooking.patientReference}
                          <button onClick={() => handleCopyRef(modalBooking.patientReference!)} className="text-blue-500 hover:text-blue-700">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                {modalBooking.adminNotes && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Info size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Admin Notes</span>
                    </div>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">{modalBooking.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Operational Actions</h4>

                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start text-xs font-bold"
                      onClick={() => navigate(`/admin/bookings/${modalBooking.id}`)}
                      icon={ExternalLink}
                    >
                      Open Full Edit Page
                    </Button>

                    <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Change Status</p>
                      {[BookingStatus.BOOKED, BookingStatus.INCOMING, BookingStatus.CANCELLED].map(status => (
                        <button
                          key={status}
                          disabled={statusChanging || modalBooking.status === status}
                          onClick={() => handleQuickStatusChange(modalBooking, status)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border ${modalBooking.status === status
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                          {statusChanging && modalBooking.status !== status ? 'Updating...' : `Mark as ${status}`}
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Interpreter</p>
                      {modalBooking.interpreterId ? (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <div className="text-xs font-bold text-slate-900">{modalBooking.interpreterName}</div>
                          <button
                            onClick={(e) => handleUnassign(e, modalBooking.id)}
                            className="text-[10px] font-bold text-red-600 hover:text-red-800 mt-1"
                          >
                            Unassign Interpreter
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-start text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                          icon={UserPlus}
                          onClick={(e) => handleAssignClick(e, modalBooking)}
                        >
                          Assign Interpreter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Context Menu Overlay */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-56 animate-in fade-in zoom-in duration-100"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contextMenu.booking.bookingRef || 'Quick Actions'}</div>
              <div className="text-xs font-bold text-slate-900 truncate">{contextMenu.booking.clientName}</div>
            </div>

            <button onClick={() => openBookingModal(contextMenu.booking)} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <Eye size={16} className="text-slate-400" /> View Quick Details
            </button>

            <button onClick={() => navigate(`/admin/bookings/${contextMenu.booking.id}`)} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <ExternalLink size={16} className="text-slate-400" /> Open Full Page
            </button>

            <div className="h-px bg-slate-100 my-1"></div>

            <button onClick={() => handleCopyRef(contextMenu.booking.bookingRef || '')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <Copy size={16} className="text-slate-400" /> Copy Reference
            </button>

            {!contextMenu.booking.interpreterId && (
              <button
                onClick={(e) => handleAssignClick(e, contextMenu.booking)}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <UserPlus size={16} /> Assign Interpreter
              </button>
            )}

            <div className="h-px bg-slate-100 my-1"></div>

            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase">Set Status</div>
            <div className="grid grid-cols-1 gap-0.5 px-1.5 pb-1">
              {[BookingStatus.BOOKED, BookingStatus.INCOMING, BookingStatus.CANCELLED].map(status => (
                <button
                  key={status}
                  onClick={() => handleQuickStatusChange(contextMenu.booking, status)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${contextMenu.booking.status === status
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};