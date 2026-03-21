import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientService } from '../../services/clientService';
import { BookingService } from '../../services/bookingService';
import { ChatService } from '../../services/chatService';
import { Client, Booking, BookingStatus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useClients } from '../../context/ClientContext';
import {
  Search, Plus, Mail, Trash2, MapPin, Briefcase, Clock,
  ChevronRight, ExternalLink, User, MessageSquare, AlertCircle, LayoutGrid, List, Calendar, Phone,
  Building, Check, AlertTriangle
} from 'lucide-react';
import { ViewToggle } from '../../components/ui/ViewToggle';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

interface ClientWithStats extends Client {
  totalBookings: number;
  activeBookings: number;
}

export const AdminClients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openThread } = useChat();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { clientsMap } = useClients();
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'GUEST' | 'SUSPENDED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Update clients when clientsMap or bookings change
  useEffect(() => {
    const calculateStats = async () => {
      try {
        const bookingsData = await BookingService.getAll();
        const clientsWithStats = Object.values(clientsMap).map(client => {
          const clientBookings = (bookingsData || []).filter(b => b.clientId === client.id);
          return {
            ...client,
            totalBookings: clientBookings.length,
            activeBookings: clientBookings.filter(b =>
              ['INCOMING', 'PENDING_ASSIGNMENT', 'BOOKED'].includes(String(b.status))
            ).length
          };
        });
        setClients(clientsWithStats.sort((a, b) => a.companyName.localeCompare(b.companyName)));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    calculateStats();
  }, [clientsMap]);

  const loadData = async () => {
    // This now just triggers a re-calculation if needed, 
    // but the useEffect handles it via clientsMap dependency.
    setLoading(true);
  };

  const filteredClients = clients.filter(c => {
    const q = filter.toLowerCase();
    const matchesSearch = (
      c.companyName.toLowerCase().includes(q) ||
      (c.contactPerson?.toLowerCase().includes(q) ?? false) ||
      c.email.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter || (statusFilter === 'ACTIVE' && !c.status);
    return matchesSearch && matchesStatus;
  });

  const handleOpenPreview = async (client: ClientWithStats) => {
    setSelectedClient(client);
    setIsPreviewOpen(true);
    setLoadingJobs(true);
    try {
      const jobs = await BookingService.getByClientId(client.id);
      setClientJobs(jobs);
    } catch (error) {
      console.error("Failed to load client jobs", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleStartChat = async (e: React.MouseEvent | undefined, clientId: string, clientName: string) => {
    if (e) e.stopPropagation();
    if (!user) return;

    try {
      const names = {
        [user.id]: user.displayName || 'Admin',
        [clientId]: clientName
      };

      const threadId = await ChatService.getOrCreateThread(
        [user.id, clientId],
        names
      );

      openThread(threadId);
    } catch (error) {
      console.error("Failed to start chat", error);
      showToast('failed to start chat', 'error');
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    let done = 0;
    for (const id of selectedIds) {
      try {
        await ClientService.update(id, { status: status as any });
        done++;
      } catch (err) { /* silent */ }
    }
    showToast(`Updated ${done} clients to ${status}`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: 'Bulk Delete Clients',
      message: `Are you sure you want to permanently delete ${selectedIds.length} clients? This will remove their company data and account access.`,
      confirmLabel: 'Delete Permanently',
      variant: 'danger'
    });
    if (!ok) return;
    let done = 0;
    for (const id of selectedIds) {
      try {
        await ClientService.delete(id);
        done++;
      } catch (err) { /* silent */ }
    }
    showToast(`Deleted ${done} clients`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const clientColumns = [
    {
      header: 'Organization',
      accessor: (c: ClientWithStats) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border shadow-sm ${c.status === 'GUEST' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            {c.companyName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{c.companyName}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{c.status || 'Active'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Primary Contact',
      accessor: (c: ClientWithStats) => (
        <div>
          <p className="font-medium text-slate-700">{c.contactPerson}</p>
          <p className="text-xs text-slate-400">{c.email}</p>
        </div>
      )
    },
    {
      header: 'Activity',
      accessor: (c: ClientWithStats) => (
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-[10px] py-0 px-1.5">{c.activeBookings} Active</Badge>
          <span className="text-xs text-slate-400">{c.totalBookings} Total</span>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: (c: ClientWithStats) => (
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin size={12} />
          <span className="text-xs truncate max-w-[150px]">{c.billingAddress || 'N/A'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Executive Database"
        subtitle="Manage corporate accounts and organizational entities."
        stats={{ label: "Global Clients", value: clients.length }}
      >
        <Button
          icon={Plus}
          onClick={() => navigate('/admin/bookings/new')}
          size="sm"
        >
          New Booking
        </Button>
      </PageHeader>

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2">
        <div className="flex-1 relative w-full h-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search company, contact or email..."
            className="pl-10 pr-4 py-2 bg-transparent text-sm w-full h-full outline-none focus:ring-0 text-slate-900"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pl-2 lg:pl-2 w-full lg:w-auto overflow-x-auto py-2 lg:py-0">
          {(['ALL', 'ACTIVE', 'GUEST'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === s
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
            >
              {s}
            </button>
          ))}
          <div className="mx-2 h-4 w-px bg-slate-200 hidden lg:block"></div>
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Synchronizing base...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No organizations matches"
          description="We couldn't find any client matching your current search criteria."
          onAction={() => setFilter('')}
          actionLabel="View All Entities"
          icon={Building}
        />
      ) : (
        <div className="relative">
          <Table
            data={filteredClients}
            columns={clientColumns}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={handleOpenPreview}
          />

          <BulkActionBar
            selectedCount={selectedIds.length}
            totalCount={filteredClients.length}
            onClearSelection={() => setSelectedIds([])}
            entityLabel="client"
            actions={[
              { label: 'Activate', icon: Check, onClick: () => handleBulkStatusChange('ACTIVE'), variant: 'success' },
              { label: 'Suspend', icon: AlertCircle, onClick: () => handleBulkStatusChange('SUSPENDED'), variant: 'warning' },
              { label: 'Delete', icon: Trash2, onClick: () => handleBulkDelete(), variant: 'danger' }
            ]}
          />
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Account Preview"
        type="drawer"
      >
        {selectedClient && (
          <div className="space-y-6 py-2">
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
                  {selectedClient.companyName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedClient.companyName}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      <Mail size={12} className="text-blue-500" />
                      {selectedClient.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      <User size={12} className="text-indigo-500" />
                      {selectedClient.contactPerson}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={ExternalLink}
                onClick={() => navigate(`/admin/clients/${selectedClient.id}`)}
                className="flex-1 rounded-lg h-10 px-6 font-bold text-xs shadow-sm"
              >View Full Profile</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase size={14} className="text-blue-500" />
                  Contractual Data
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm"><Clock size={16} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Standard Terms</p>
                      <p className="font-bold text-slate-900 text-sm">{selectedClient.paymentTermsDays || 30} Days Net</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><MapPin size={16} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Billing Base</p>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed italic">{selectedClient.billingAddress || 'No primary address recorded'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-purple-500" />
                  Order Analytics
                </h3>
                {loadingJobs ? (
                  <div className="flex-1 flex items-center justify-center py-4"><Spinner /></div>
                ) : clientJobs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 p-4 min-h-[100px]">
                    <AlertCircle className="text-slate-300 mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-500">No service history found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {clientJobs.slice(0, 5).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer" onClick={() => navigate(`/admin/bookings/${job.id}`)}>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{job.bookingRef || `#${job.id.slice(-4)}`}</span>
                          <span className="text-xs text-xs text-slate-500">{job.date}</span>
                        </div>
                        <Badge variant={job.status === 'COMPLETED' ? 'success' : 'info'} className="text-xs px-2">
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                    {clientJobs.length > 5 && (
                      <p className="text-xs text-center font-bold text-slate-500 pt-2 border-t border-slate-100 mt-2">Historical Volume: {clientJobs.length} Orders</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => setIsPreviewOpen(false)}
                className="font-bold text-xs"
              >Return</Button>
              <Button
                onClick={(e) => handleStartChat(e, selectedClient.id, selectedClient.companyName)}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm font-bold text-xs"
                icon={MessageSquare}
              >Direct Message</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
