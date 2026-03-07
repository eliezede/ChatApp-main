import React, { useEffect, useState } from 'react';
import { ApplicationService } from '../../services/applicationService';
import { InterpreterService, UserService } from '../../services/api';
import { InterpreterApplication, ApplicationStatus, UserRole } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import {
  Mail, Phone, MapPin, Award, UserPlus, Info,
  Filter, CheckCircle2, XCircle, Clock, Trash2, Search, Zap, Eye
} from 'lucide-react';

type TabType = ApplicationStatus | 'ALL';

export const AdminApplications = () => {
  const [applications, setApplications] = useState<InterpreterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(ApplicationStatus.PENDING);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const { showToast } = useToast();

  const [selectedApp, setSelectedApp] = useState<InterpreterApplication | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ApplicationService.getAll();
      setApplications(data);
    } catch (e) {
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: InterpreterApplication) => {
    if (!window.confirm(`Approve ${app.name}? This will instantly create an Interpreter profile and User account.`)) return;

    setProcessingId(app.id);
    try {
      const allUsers = await UserService.getAll();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === app.email.toLowerCase());

      if (existingUser) {
        showToast(`User with email ${app.email} already exists.`, 'error');
        return;
      }

      const newInt = await InterpreterService.create({
        name: app.name,
        email: app.email,
        phone: app.phone,
        languages: app.languages,
        regions: [app.postcode],
        qualifications: app.qualifications,
        dbsExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ONBOARDING',
        isAvailable: false,
        acceptsDirectAssignment: true,
        organizationId: 'lingland-main',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      await UserService.create({
        displayName: app.name,
        email: app.email,
        role: UserRole.INTERPRETER,
        profileId: newInt.id,
        status: 'ACTIVE'
      });

      await ApplicationService.updateStatus(app.id, ApplicationStatus.APPROVED);

      showToast(`${app.name} has been approved and provisioned!`, 'success');
      setSelectedApp(null);
      await loadData();
    } catch (e) {
      console.error(e);
      showToast('Error during approval process', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: InterpreterApplication) => {
    if (!window.confirm(`Reject application from ${app.name}?`)) return;
    try {
      await ApplicationService.updateStatus(app.id, ApplicationStatus.REJECTED);
      showToast('Application rejected', 'info');
      setSelectedApp(null);
      await loadData();
    } catch (e) {
      showToast('Failed to reject', 'error');
    }
  };

  const handleBulkStatus = async (ids: string[], status: ApplicationStatus) => {
    if (!window.confirm(`Change status to ${status} for ${ids.length} applications?`)) return;
    setIsBulkLoading(true);
    let done = 0;
    for (const id of ids) {
      try {
        await ApplicationService.updateStatus(id, status);
        done++;
      } catch { /* silent */ }
    }
    showToast(`${done} applications updated to ${status}`, 'success');
    setSelectedIds([]);
    setIsBulkLoading(false);
    await loadData();
  };

  const filteredApps = applications.filter(app => {
    const matchesStatus = activeTab === 'ALL' ? true : app.status === activeTab;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: 'Candidate',
      accessor: (app: InterpreterApplication) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {app.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-none">{app.name}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{app.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Pathways',
      accessor: (app: InterpreterApplication) => (
        <div className="flex flex-wrap gap-1">
          {app.languages.slice(0, 2).map(l => (
            <span key={l} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-600 uppercase">
              {l}
            </span>
          ))}
          {app.languages.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+{app.languages.length - 2}</span>}
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (app: InterpreterApplication) => (
        <div className="text-xs text-slate-500 font-medium">
          {new Date(app.submittedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (app: InterpreterApplication) => (
        <Badge variant={
          app.status === ApplicationStatus.PENDING ? 'warning' :
            app.status === ApplicationStatus.APPROVED ? 'success' : 'danger'
        }>
          {app.status}
        </Badge>
      )
    }
  ];

  const handleRowClick = (app: InterpreterApplication) => {
    setSelectedApp(app);
  };

  const renderContextMenu = (app: InterpreterApplication) => [
    { label: 'Review Details', icon: Eye, onClick: () => setSelectedApp(app) },
    { divider: true },
    { label: 'Reject', icon: XCircle, variant: 'danger' as const, onClick: () => handleReject(app), disabled: app.status !== ApplicationStatus.PENDING },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Onboarding Desk" subtitle="Review and provision new interpreter accounts">
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mr-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Query candidates..."
              className="w-full pl-10 pr-4 py-1.5 bg-transparent text-xs outline-none text-slate-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-1 mr-4 bg-slate-100 p-1 rounded-lg">
          {['PENDING', 'APPROVED', 'ALL'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t as TabType)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </PageHeader>

      <Table
        data={filteredApps}
        columns={columns}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleRowClick}
        renderContextMenu={renderContextMenu}
        isLoading={loading}
        emptyMessage="No applications waiting in this queue."
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={filteredApps.length}
        entityLabel="candidate"
        isLoading={isBulkLoading}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: 'Reject Selected',
            icon: XCircle,
            onClick: () => handleBulkStatus(selectedIds, ApplicationStatus.REJECTED),
            variant: 'danger',
          },
        ]}
      />

      {/* Review Modal converted to Drawer */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Review"
        maxWidth="lg"
        type="drawer"
      >
        {selectedApp && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-600/20 mr-4">
                  {selectedApp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedApp.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Submission Date: {new Date(selectedApp.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant={selectedApp.status === ApplicationStatus.PENDING ? 'warning' : selectedApp.status === ApplicationStatus.APPROVED ? 'success' : 'danger'}>
                {selectedApp.status}
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Contact & Context</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                    <Mail size={16} className="mr-3 text-blue-500" />
                    {selectedApp.email}
                  </div>
                  <div className="flex items-center text-sm font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                    <Phone size={16} className="mr-3 text-blue-500" />
                    {selectedApp.phone}
                  </div>
                  <div className="flex items-center text-sm font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                    <MapPin size={16} className="mr-3 text-blue-500" />
                    {selectedApp.postcode}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Stash</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedApp.languages.map(l => <Badge key={l} variant="info">{l}</Badge>)}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedApp.qualifications.map(q => (
                    <span key={q} className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-2 rounded-xl border border-purple-100 flex items-center">
                      <Award size={14} className="mr-2" /> {q}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Experience Statement</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100 italic leading-relaxed">
                  "{selectedApp.experienceSummary || 'No summary provided.'}"
                </p>
              </div>
            </div>

            {selectedApp.status === ApplicationStatus.PENDING && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5 mr-3" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Approving this candidate will instantly create their <strong>professional profile</strong> and <strong>secure login</strong>.
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
              {selectedApp.status === ApplicationStatus.PENDING ? (
                <>
                  <Button
                    variant="primary"
                    icon={UserPlus}
                    isLoading={processingId === selectedApp.id}
                    onClick={() => handleApprove(selectedApp)}
                    className="w-full h-12"
                  >
                    Provision Interpreter
                  </Button>
                  <button
                    onClick={() => handleReject(selectedApp)}
                    className="w-full py-3 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Reject Application
                  </button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setSelectedApp(null)} className="w-full">
                  Close Review
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};