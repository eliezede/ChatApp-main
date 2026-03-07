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
import {
  Search, Plus, Building2, Mail, Edit,
  Trash2, MapPin, Briefcase, Clock,
  ChevronRight, ExternalLink, User, MessageSquare, AlertCircle, LayoutGrid, List, Calendar, Phone
} from 'lucide-react';
import { ViewToggle } from '../../components/ui/ViewToggle';
import { PageHeader } from '../../components/layout/PageHeader';

interface ClientWithStats extends Client {
  totalBookings: number;
  activeBookings: number;
}

export const AdminClients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openThread } = useChat();
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'GUEST' | 'SUSPENDED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, bookingsData] = await Promise.all([
        ClientService.getAll(),
        BookingService.getAll()
      ]);

      const clientsWithStats = clientsData.map(client => {
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
    } catch (error) {
      console.error('Failed to load clients data', error);
    } finally {
      setLoading(false);
    }
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
    }
  };

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
          icon={Building2}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => handleOpenPreview(client)}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-sm ${client.status === 'GUEST'
                      ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                      }`}>
                      {client.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{client.companyName}</h3>
                        {client.status === 'GUEST' && (
                          <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Guest</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        {client.contactPerson}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3 flex-1">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Mail size={14} className="text-blue-500" />
                    <span className="text-xs truncate">{client.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 min-h-[40px]">
                    <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs leading-tight line-clamp-2">{client.billingAddress || 'No billing address'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 group-hover:bg-blue-50/50 transition-colors flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Jobs</p>
                    <p className="text-sm font-bold text-slate-900">{client.totalBookings}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 group-hover:bg-emerald-50/50 transition-colors flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Active</p>
                    <p className="text-sm font-bold text-slate-900">{client.activeBookings}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Jobs</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Active</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => handleOpenPreview(client)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition-all shadow-sm ${client.status === 'GUEST'
                          ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}>
                          {client.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 leading-none">{client.companyName}</p>
                            {client.status === 'GUEST' && (
                              <Badge variant="warning" className="text-[8px] py-0 px-1.5">Guest</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{client.contactPerson}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{client.totalBookings}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={client.activeBookings > 0 ? 'info' : 'neutral'} className="text-xs">
                        {client.activeBookings} Active
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenPreview(client); }}
                        className="p-1.5 hover:bg-slate-200"
                        icon={ChevronRight}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Account Profile"
        maxWidth="2xl"
      >
        {selectedClient && (
          <div className="space-y-6 py-2">
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
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
                          <span className="text-xs text-slate-500">{job.date}</span>
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
