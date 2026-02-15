import React, { useEffect, useState } from 'react';
import { ClientService, BookingService } from '../../services/api';
import { Client, Booking, BookingStatus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  Search, Plus, Building2, Mail, Edit2,
  Trash2, MapPin, Briefcase, Clock,
  ChevronRight, ExternalLink, User
} from 'lucide-react';

interface ClientWithStats extends Client {
  totalBookings: number;
  activeBookings: number;
}

export const AdminClients = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

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
            [BookingStatus.REQUESTED, BookingStatus.OFFERED, BookingStatus.ACCEPTED, BookingStatus.CONFIRMED].includes(b.status)
          ).length
        };
      });

      setClients(clientsWithStats.sort((a, b) => a.companyName.localeCompare(b.companyName)));
    } catch (error) {
      showToast('Failed to load clients data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const safe = (val: any) => String(val ?? "").toLowerCase();

  const filteredClients = clients.filter(c => {
    const q = safe(filter);
    return (
      safe(c.companyName).includes(q) ||
      safe(c.contactPerson).includes(q) ||
      safe(c.email).includes(q)
    );
  });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ ...client });
    } else {
      setEditingClient(null);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        billingAddress: '',
        paymentTermsDays: 30,
        defaultCostCodeType: 'PO'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingClient) {
        await ClientService.update(editingClient.id, formData);
        showToast('Client updated successfully', 'success');
      } else {
        await ClientService.create(formData as Client);
        showToast('New client created', 'success');
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Error saving client details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1";
  const inputClasses = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clients Directory</h1>
          <p className="text-slate-500 font-bold mt-1">Manage registered organizations and billing profiles</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl shadow-lg shadow-blue-200"
        >
          New Client
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by company, contact person or email..."
            className="pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl w-full text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Synchronizing base...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients matches"
          description="We couldn't find any organization matching your current search criteria."
          onAction={() => setFilter('')}
          actionLabel="View All Clients"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group relative overflow-hidden flex flex-col h-full"
            >
              {/* Subtle decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-blue-50 transition-colors duration-500"></div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-indigo-100 group-hover:border-indigo-600">
                      {client.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{client.companyName}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        <User size={10} />
                        {client.contactPerson}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(client)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                    <Mail size={16} className="text-blue-500" />
                    <span className="text-sm font-bold truncate">{client.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-50 h-16 overflow-hidden">
                    <MapPin size={16} className="text-emerald-500 mt-0.5" />
                    <span className="text-xs font-bold leading-relaxed line-clamp-2">{client.billingAddress || 'No billing address set'}</span>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                  <div className="bg-slate-50 rounded-2xl p-4 transition-colors group-hover:bg-blue-50/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Jobs</p>
                    <p className="text-xl font-black text-slate-900">{client.totalBookings}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 transition-colors group-hover:bg-emerald-50/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">In Progress</p>
                    <p className="text-xl font-black text-slate-900">{client.activeBookings}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client Profile' : 'Register New Client'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-8 py-4">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClasses}>Company / Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Lingland Global"
                className={inputClasses}
                value={formData.companyName || ''}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Main Contact Person</label>
              <input
                type="text"
                placeholder="Full Name"
                className={inputClasses}
                value={formData.contactPerson || ''}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Billing Email Address</label>
              <input
                type="email"
                placeholder="finance@organization.com"
                className={inputClasses}
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClasses}>Full Billing Address</label>
              <textarea
                className={inputClasses + " h-24 resize-none"}
                placeholder="Street, City, Postcode..."
                value={formData.billingAddress || ''}
                onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div>
              <label className={labelClasses}>Payment Terms (Days)</label>
              <select
                className={inputClasses + " bg-white"}
                value={formData.paymentTermsDays || 30}
                onChange={e => setFormData({ ...formData, paymentTermsDays: parseInt(e.target.value) })}
              >
                <option value={7}>7 Days (Express)</option>
                <option value={14}>14 Days (Standard)</option>
                <option value={30}>30 Days (Corporate)</option>
                <option value={60}>60 Days (Enterprise)</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Default Cost Code Type</label>
              <select
                className={inputClasses + " bg-white"}
                value={formData.defaultCostCodeType || 'PO'}
                onChange={e => setFormData({ ...formData, defaultCostCodeType: e.target.value as any })}
              >
                <option value="PO">Purchase Order (PO)</option>
                <option value="Cost Code">Cost Code</option>
                <option value="Client Name">Client Name Reference</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              className="flex-[2] h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100"
            >
              {editingClient ? 'Update Profile' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
