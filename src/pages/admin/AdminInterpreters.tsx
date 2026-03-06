import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterpreterService } from '../../services/interpreterService';
import { BookingService } from '../../services/bookingService';
import { ChatService } from '../../services/chatService';
import { Interpreter, BookingStatus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  Search, UserCircle2, MapPin,
  Languages, ShieldCheck, Edit, Check, MessageSquare,
  LayoutGrid, List, AlertCircle, Trash2, Calendar, Mail, Phone, ChevronRight, ExternalLink
} from 'lucide-react';
import { ViewToggle } from '../../components/ui/ViewToggle';
import { PageHeader } from '../../components/layout/PageHeader';

export const AdminInterpreters = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openThread } = useChat();
  const { settings } = useSettings();
  const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
  const [loading, setLoading] = useState(true);

  const [textFilter, setTextFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ONBOARDING' | 'SUSPENDED'>('ALL');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInterpreter, setSelectedInterpreter] = useState<Interpreter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [interpreterJobs, setInterpreterJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    loadInterpreters();
  }, []);

  const loadInterpreters = async () => {
    setLoading(true);
    try {
      const data = await InterpreterService.getAll();
      setInterpreters(data);
    } catch (error) {
      console.error('Error loading interpreters', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterpreters = interpreters.filter(i => {
    const matchesText = i.name.toLowerCase().includes(textFilter.toLowerCase()) ||
      i.email.toLowerCase().includes(textFilter.toLowerCase());
    const matchesLang = langFilter ? i.languages.some(l => l.toLowerCase().includes(langFilter.toLowerCase())) : true;
    const matchesStatus = statusFilter === 'ALL' ? true : i.status === statusFilter;
    return matchesText && matchesLang && matchesStatus;
  });

  const handleStartChat = async (e: React.MouseEvent | undefined, interpreterId: string | undefined, interpreterName: string | undefined) => {
    if (e) e.stopPropagation();
    if (!user || !interpreterId) return;

    try {
      const names = {
        [user.id]: user.displayName || 'Admin',
        [interpreterId]: interpreterName || 'Interpreter'
      };

      const threadId = await ChatService.getOrCreateThread(
        [user.id, interpreterId],
        names
      );

      openThread(threadId);
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  const handleOpenPreview = async (interpreter: Interpreter) => {
    setSelectedInterpreter(interpreter);
    setIsPreviewOpen(true);
    setLoadingJobs(true);
    try {
      const jobs = await BookingService.getByInterpreterId(interpreter.id);
      setInterpreterJobs(jobs);
    } catch (error) {
      console.error("Failed to load interpreter jobs", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Interpreters Matrix"
        subtitle="Directory of certified freelancers and agencies."
        stats={{ label: "Active Pool", value: interpreters.length }}
      />

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2">
        <div className="flex-1 relative w-full h-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            className="pl-10 pr-4 py-2 bg-transparent text-sm w-full h-full outline-none focus:ring-0 text-slate-900"
            value={textFilter}
            onChange={e => setTextFilter(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-64 h-10 border-t lg:border-t-0 lg:border-l border-slate-100">
          <input
            type="text"
            placeholder="Filter language..."
            className="px-4 py-2 bg-transparent text-sm w-full h-full outline-none focus:ring-0 text-slate-900"
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-48 relative h-10 border-t lg:border-t-0 lg:border-l border-slate-100">
          <select
            className="px-4 py-2 bg-transparent text-sm w-full h-full outline-none focus:ring-0 text-slate-900 cursor-pointer appearance-none font-medium"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <ChevronRight className="absolute right-3 top-1/2 -rotate-90 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-slate-100 pl-2 lg:pl-2 w-full lg:w-auto flex justify-end">
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Synchronizing base...</p>
        </div>
      ) : filteredInterpreters.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="We couldn't find any interpreter matching your search criteria."
          onAction={() => { setTextFilter(''); setLangFilter(''); setStatusFilter('ALL'); }}
          actionLabel="View All Interpreters"
          icon={UserCircle2}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredInterpreters.map(interpreter => (
            <div
              key={interpreter.id}
              onClick={() => handleOpenPreview(interpreter)}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center font-bold text-lg group-hover:bg-slate-100 transition-colors border border-slate-200">
                      {interpreter.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{interpreter.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{interpreter.email}</p>
                    </div>
                  </div>
                  <Badge variant={interpreter.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {interpreter.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-start gap-2">
                    <Languages size={14} className="text-slate-400 mt-0.5" />
                    <div className="flex gap-1 flex-wrap">
                      {interpreter.languages.map(lang => (
                        <span key={lang} className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-200">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-600 truncate">{interpreter.regions.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleStartChat(e, interpreter.id, interpreter.name)}
                    className="text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium px-2 py-1 h-auto"
                    icon={MessageSquare}
                  >Message</Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/interpreters/${interpreter.id}`); }}
                    className="rounded-lg text-xs font-medium px-3 py-1 h-auto"
                    icon={UserCircle2}
                  >Profile</Button>
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
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Interpreter</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Languages</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr >
              </thead >
              <tbody className="divide-y divide-slate-100">
                {filteredInterpreters.map(interpreter => (
                  <tr
                    key={interpreter.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => handleOpenPreview(interpreter)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                          {interpreter.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{interpreter.name}</div>
                          <div className="text-xs text-slate-500">{interpreter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {interpreter.languages.map(l => (
                          <span key={l} className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-200">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{interpreter.regions[0]}{interpreter.regions.length > 1 && ` +${interpreter.regions.length - 1}`}</td>
                    <td className="px-4 py-3">
                      <Badge variant={interpreter.status === 'ACTIVE' ? 'success' : 'warning'}>{interpreter.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenPreview(interpreter); }}
                        className="p-1.5 h-auto text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      ><ChevronRight size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table >
          </div >
        </div >
      )}


      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Interpreter Profile Overview"
        maxWidth="2xl"
      >
        {selectedInterpreter && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-slate-200">
                  {selectedInterpreter.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedInterpreter.name}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <Badge variant={selectedInterpreter.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {selectedInterpreter.status}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                      <Mail size={12} className="text-slate-400" />
                      {selectedInterpreter.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                  size="sm"
                  variant="primary"
                  icon={ExternalLink}
                  onClick={() => navigate(`/admin/interpreters/${selectedInterpreter.id}`)}
                  className="w-full rounded-md text-xs font-medium shadow-sm py-2 px-4 h-auto"
                >View Full Profile</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-400" />
                  Capabilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg"><Languages size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Languages</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedInterpreter.languages.map(l => (
                          <span key={l} className="bg-slate-50 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-200">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg"><MapPin size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Regions</p>
                      <p className="text-sm font-medium text-slate-700">{selectedInterpreter.regions.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Recent Assignments
                </h3>
                {loadingJobs ? (
                  <div className="flex-1 flex items-center justify-center"><Spinner /></div>
                ) : interpreterJobs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 p-4">
                    <AlertCircle className="text-slate-300 mb-2" size={24} />
                    <p className="text-xs font-medium text-slate-500">No assigned jobs</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1">
                    {interpreterJobs.slice(0, 5).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors cursor-pointer" onClick={() => navigate(`/admin/bookings/${job.id}`)}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-900">{job.bookingRef || `#${job.id.slice(-4)}`}</span>
                          <span className="text-[10px] text-slate-500">{job.date} • {job.startTime}</span>
                        </div>
                        <Badge variant={job.status === 'COMPLETED' ? 'success' : 'info'} className="text-[10px] py-0 px-1.5 h-5">
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                    {interpreterJobs.length > 5 && (
                      <p className="text-[10px] text-center font-medium text-slate-500 py-2 bg-slate-50 border border-slate-200 rounded-md mt-2">+{interpreterJobs.length - 5} More historical records</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-100">
              <Button
                onClick={(e) => handleStartChat(e, selectedInterpreter.id, selectedInterpreter.name)}
                className="flex-1 rounded-md text-sm font-medium py-2 h-auto"
                icon={MessageSquare}
              >Start Direct Message</Button>
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-[0.4] rounded-md text-sm font-medium py-2 h-auto"
              >Dismiss</Button>
            </div>
          </div>
        )}
      </Modal>

    </div >
  );
};