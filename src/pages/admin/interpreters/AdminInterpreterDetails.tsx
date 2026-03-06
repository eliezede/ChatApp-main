import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  InterpreterService, BookingService, BillingService, ChatService
} from '../../../services/api';
import {
  Interpreter, Booking, InterpreterInvoice, BookingStatus
} from '../../../types';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/StatusBadge';
import { InvoiceStatusBadge } from '../../../components/billing/InvoiceStatusBadge';
import { useSettings } from '../../../context/SettingsContext';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import {
  ChevronLeft, Mail, Phone, MapPin, Languages,
  Award, ShieldCheck, ArrowUpRight, FileText, UserCircle2, Edit, Check, MessageSquare
} from 'lucide-react';

type Tab = 'JOBS' | 'FINANCE' | 'COMPLIANCE';

export const AdminInterpreterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openThread } = useChat();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const [interpreter, setInterpreter] = useState<Interpreter | null>(null);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<InterpreterInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('JOBS');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Interpreter>>({});
  const [saving, setSaving] = useState(false);
  const [processingChat, setProcessingChat] = useState(false);

  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (interpreterId: string) => {
    setLoading(true);
    try {
      const [profile, schedule, financialHistory, offers] = await Promise.all([
        InterpreterService.getById(interpreterId),
        BookingService.getInterpreterSchedule(interpreterId),
        BillingService.getInterpreterInvoices(),
        BookingService.getInterpreterOffers(interpreterId)
      ]);

      setInterpreter(profile || null);

      const offeredBookings = offers
        .filter(o => o.bookingSnapshot && Object.keys(o.bookingSnapshot).length > 0)
        .map(o => ({
          ...o.bookingSnapshot,
          id: o.bookingId,
          status: BookingStatus.OPENED
        } as Booking));

      const mergedJobs = [...schedule];
      offeredBookings.forEach(ob => {
        if (!mergedJobs.find(j => j.id === ob.id)) {
          mergedJobs.push(ob);
        }
      });

      setJobs(mergedJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setInvoices(financialHistory.filter(inv => inv.interpreterId === interpreterId));
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!interpreter || !user) return;
    setProcessingChat(true);
    try {
      const names = {
        [user.id]: user.displayName || 'Admin',
        [interpreter.id]: interpreter.name
      };
      const threadId = await ChatService.getOrCreateThread([user.id, interpreter.id], names);
      openThread(threadId);
    } finally {
      setProcessingChat(false);
    }
  };

  const handleEdit = () => {
    if (interpreter) {
      setFormData({ ...interpreter });
      setIsEditModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;

    setSaving(true);
    try {
      await InterpreterService.updateProfile(id, formData);
      showToast('Profile updated successfully', 'success');
      await loadData(id);
      setIsEditModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    const current = formData.languages || [];
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    setFormData({ ...formData, languages: updated });
  };

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;
  if (!interpreter) return <div className="p-12 text-center text-red-500 font-bold">Interpreter not found.</div>;

  const earningsTotal = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upcomingJobs = jobs.filter(j => new Date(j.date) >= new Date() && [BookingStatus.BOOKED, BookingStatus.OPENED].includes(j.status)).length;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center">
          <button onClick={() => navigate('/admin/interpreters')} className="mr-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold mr-3 border-2 border-white shadow-sm">
              {interpreter.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{interpreter.name}</h1>
                <Badge variant={interpreter.status === 'ACTIVE' ? 'success' : 'warning'}>{interpreter.status}</Badge>
              </div>
              <p className="text-slate-500 text-xs font-medium">ID: {interpreter.id.toUpperCase()}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={MessageSquare} isLoading={processingChat} onClick={handleStartChat}>Message</Button>
          <Button variant="primary" icon={Edit} onClick={handleEdit}>Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="flex flex-col justify-center items-center py-4" padding="none">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Jobs</p>
          <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
        </Card>
        <Card className="flex flex-col justify-center items-center py-4" padding="none">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Earnings</p>
          <p className="text-2xl font-bold text-slate-900">£{earningsTotal.toFixed(2)}</p>
        </Card>
        <Card className="flex flex-col justify-center items-center py-4 border-blue-100 bg-blue-50/50" padding="none">
          <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Open Schedule</p>
          <p className="text-2xl font-bold text-blue-600">{upcomingJobs}</p>
        </Card>
        <Card className="flex flex-col justify-center items-center py-4" padding="none">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Rating</p>
          <p className="text-2xl font-bold text-slate-900">4.9 ★</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card className="space-y-4" padding="sm">
            <h3 className="font-bold text-slate-900 flex items-center uppercase text-[10px] tracking-widest">
              <UserCircle2 size={14} className="mr-1.5 text-slate-400" />
              Professional Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contacts</label>
                <div className="mt-1.5 space-y-1.5">
                  <div className="flex items-center text-xs font-semibold text-slate-700">
                    <Mail size={12} className="mr-1.5 text-slate-400" /> {interpreter.email}
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-700">
                    <Phone size={12} className="mr-1.5 text-slate-400" /> {interpreter.phone}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Languages</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {interpreter.languages.map(lang => (
                    <span key={lang} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 uppercase">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qualifications</label>
                <div className="mt-1.5 space-y-1.5">
                  {interpreter.qualifications.map(qual => (
                    <div key={qual} className="text-[11px] font-semibold text-slate-700 flex items-center">
                      <Award size={12} className="mr-1.5 text-yellow-600" /> {qual}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-orange-50 border-orange-100" padding="sm">
            <h3 className="font-bold text-orange-900 flex items-center mb-3 uppercase text-[10px] tracking-widest">
              <ShieldCheck size={14} className="mr-1.5 text-orange-500" />
              Compliance
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-orange-700 uppercase font-bold tracking-widest">DBS Expiry</p>
                <p className={`text-xs font-bold mt-0.5 ${new Date(interpreter.dbsExpiry) < new Date() ? 'text-red-600' : 'text-slate-900'}`}>
                  {new Date(interpreter.dbsExpiry).toLocaleDateString()}
                  {new Date(interpreter.dbsExpiry) < new Date() && ' (EXPIRED)'}
                </p>
              </div>
              <div className="pt-2 border-t border-orange-100 flex justify-between items-center text-[10px] text-orange-700 font-bold">
                <span>Certificate ID: ...8921</span>
                <button className="text-blue-600 hover:underline">View Doc</button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('JOBS')}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'JOBS' ? 'border-b-4 border-blue-600 text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('FINANCE')}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCE' ? 'border-b-4 border-blue-600 text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Finance ({invoices.length})
              </button>
            </div>

            <div className="p-0">
              {activeTab === 'JOBS' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No assigned jobs.</td></tr>
                      ) : (
                        jobs.map(job => (
                          <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-black text-slate-900">{new Date(job.date).toLocaleDateString()}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">{job.startTime}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-700">{job.clientName}</div>
                              <div className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{job.languageTo}</div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={job.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => navigate(`/admin/bookings/${job.id}`)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><ArrowUpRight size={18} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'FINANCE' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No financial history.</td></tr>
                      ) : (
                        invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-black text-slate-900 flex items-center">
                                <FileText size={14} className="mr-2 text-slate-300" />
                                {inv.externalInvoiceReference || inv.id.substring(0, 8)}
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">{new Date(inv.issueDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">£{inv.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <InvoiceStatusBadge status={inv.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => navigate(`/admin/billing/interpreter-invoices/${inv.id}`)} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800">Manage</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────── EDIT MODAL ─────────────────────────── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Interpreter Profile" maxWidth="3xl">
        <form onSubmit={handleSave}>
          {/* Avatar + Name header strip */}
          <div className="flex items-center gap-4 px-1 mt-1 mb-5 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-200 shrink-0">
              {(formData.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{formData.name || 'Loading…'}</p>
              <p className="text-[11px] text-slate-400 font-medium">{formData.email || ''}</p>
            </div>
            <span className={`shrink-0 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${formData.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              formData.status === 'ONBOARDING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                formData.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
              }`}>{formData.status}</span>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">

            {/* ── Left: Personal ── */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-1">
                <span className="inline-block w-3 h-[2px] bg-slate-300 rounded-full"></span>
                Personal
              </p>
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-300"
                  value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email" required
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-300"
                  value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              {/* Phone + Postcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Postcode</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    value={formData.postcode || ''} onChange={e => setFormData({ ...formData, postcode: e.target.value })} />
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address Line 1</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  value={formData.addressLine1 || ''} onChange={e => setFormData({ ...formData, addressLine1: e.target.value })} />
              </div>
            </div>

            {/* ── Right: Compliance ── */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-1">
                <span className="inline-block w-3 h-[2px] bg-slate-300 rounded-full"></span>
                Compliance
              </p>
              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="ACTIVE">Active</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
              {/* DBS Expiry */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">DBS Expiry Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  value={formData.dbsExpiry} onChange={e => setFormData({ ...formData, dbsExpiry: e.target.value })} />
              </div>
              {/* Direct Assignment toggle */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${formData.acceptsDirectAssignment ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                onClick={() => setFormData({ ...formData, acceptsDirectAssignment: !formData.acceptsDirectAssignment })}>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${formData.acceptsDirectAssignment ? 'text-blue-700' : 'text-slate-600'}`}>Direct Assignment</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Can be assigned without offer</p>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${formData.acceptsDirectAssignment ? 'bg-blue-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.acceptsDirectAssignment ? 'left-4' : 'left-0.5'}`}></div>
                </div>
                <input type="checkbox" className="hidden" id="direct-assignment" checked={formData.acceptsDirectAssignment} onChange={() => { }} />
              </div>
            </div>
          </div>

          {/* ── Languages ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <span className="inline-block w-3 h-[2px] bg-slate-300 rounded-full"></span>
                Languages
              </p>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{formData.languages?.length || 0} selected</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl custom-scrollbar">
              {settings.masterData.priorityLanguages.map(lang => {
                const selected = formData.languages?.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border ${selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                  >
                    {selected && <span className="mr-1">✓</span>}{lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors px-1 py-1"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Interpreter
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-xs font-semibold text-slate-500">
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-200 transition-all"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
        maxWidth="md"
      >
        <div className="space-y-6 py-4">
          <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex flex-col items-center text-center gap-4">
            <div className="p-3 bg-white rounded-md text-red-500 shadow-sm border border-red-50"><ShieldCheck size={24} /></div>
            <div>
              <h4 className="font-bold text-red-900 uppercase text-xs tracking-widest mb-2">Critical Action</h4>
              <p className="text-red-700/80 text-xs font-medium leading-relaxed max-w-[280px]">
                Type the security term below to confirm permanent removal.
              </p>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <div className="flex justify-between items-center ml-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type "DELETE" to confirm</p>
            </div>
            <input
              type="text"
              className={`w-full h-10 px-3 bg-slate-50 border rounded focus:outline-none transition-all text-slate-900 font-bold text-sm tracking-wider uppercase ${deleteConfirmText.toUpperCase() === 'DELETE' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 focus:border-red-500'}`}
              placeholder="Confirmation"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              className={`flex-[1.5] rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all ${deleteConfirmText.toUpperCase() === 'DELETE' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-100 text-slate-300'}`}
              disabled={deleteConfirmText.toUpperCase() !== 'DELETE' || deleting}
              isLoading={deleting}
              onClick={async () => {
                if (id) {
                  setDeleting(true);
                  try {
                    await InterpreterService.delete(id);
                    showToast('Interpreter deleted successfully', 'success');
                    navigate('/admin/interpreters');
                  } catch (e) { showToast('Deletion failed', 'error'); }
                  finally { setDeleting(false); }
                }
              }}
            >Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};