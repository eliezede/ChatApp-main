import React, { useEffect, useState } from 'react';
import { StaffService } from '../../../services/staffService';
import { User, Department, JobTitle, UserRole } from '../../../types';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { Users, Building2, Briefcase, Mail, Phone, Settings, Shield, Crown, LayoutGrid, List, UserCircle2 } from 'lucide-react';

export const AdminStaff = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageForm, setManageForm] = useState({ departmentId: '', jobTitleId: '' });
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const { isSuperAdmin } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [members, depts, jobs] = await Promise.all([
        StaffService.getStaffMembers(),
        StaffService.getDepartments(),
        StaffService.getJobTitles()
      ]);
      setStaff(members);
      setDepartments(depts);
      setJobTitles(jobs);
    } catch (error) {
      showToast('Failed to load staff directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenManage = (member: User) => {
    setSelectedStaff(member);
    setIsManageModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSaving(true);
    try {
        const existingProfile = await StaffService.getProfile(selectedStaff.id);
        if (existingProfile) {
            await StaffService.updateProfile(existingProfile.id, manageForm);
        } else {
            await StaffService.createProfile({
                userId: selectedStaff.id,
                departmentId: manageForm.departmentId,
                jobTitleId: manageForm.jobTitleId,
                onboardingCompleted: false,
                preferences: { theme: 'system', language: 'en', notifications: true }
            });
        }
        showToast('Staff assignment updated', 'success');
        setIsManageModalOpen(false);
        await loadData();
    } catch (err) {
        showToast('Error saving assignment', 'error');
    } finally {
        setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Member',
      accessor: (user: User) => (
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${user.role === UserRole.SUPER_ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white capitalize truncate max-w-[150px]">{user.displayName}</span>
            <div className="flex items-center space-x-2">
               {user.role === UserRole.SUPER_ADMIN ? <Crown size={10} className="text-amber-500" /> : <Shield size={10} className="text-blue-500" />}
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Organization',
      accessor: (user: User) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
             <Building2 size={12} className="mr-1.5 text-slate-400" />
             <span className="font-medium truncate max-w-[120px]">Lingland Admin</span>
          </div>
          <div className="flex items-center text-[10px] text-slate-400 italic">
             <Briefcase size={10} className="mr-1.5" />
             <span>Team Member</span>
          </div>
        </div>
      )
    },
    {
      header: 'Contacts',
      accessor: (user: User) => (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center text-xs text-slate-500">
                <Mail size={12} className="mr-1.5" />
                <span className="truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className="flex items-center text-[10px] text-slate-400">
                <Phone size={10} className="mr-1.5" />
                {'UK Mobile'}
            </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {user.status}
        </Badge>
      )
    }
  ];

  const StaffCard = ({ member }: { member: User }) => (
    <div 
        onClick={() => handleOpenManage(member)}
        className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                <Settings size={14} />
            </div>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-inner ${member.role === UserRole.SUPER_ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {member.displayName.charAt(0).toUpperCase()}
            </div>
            
            <div>
                <h3 className="font-black text-slate-900 dark:text-white capitalize text-lg tracking-tight mb-1">{member.displayName}</h3>
                <div className="flex items-center justify-center space-x-2">
                    <Badge variant={member.role === UserRole.SUPER_ADMIN ? 'warning' : 'info'} className="text-[9px] px-2 py-0.5 font-black uppercase tracking-widest">
                        {member.role}
                    </Badge>
                    <Badge variant={member.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-[9px] px-2 py-0.5 font-black uppercase tracking-widest">
                        {member.status}
                    </Badge>
                </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Building2 size={14} className="shrink-0 text-blue-500" />
                    <span className="text-xs font-bold truncate">Lingland Administration</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Mail size={14} className="shrink-0 text-blue-500" />
                    <span className="text-xs font-bold truncate">{member.email}</span>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Directory" 
        subtitle="Manage internal team members and organizational roles"
      >
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl pointer-events-auto">
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <List size={18} />
            </button>
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LayoutGrid size={18} />
            </button>
        </div>
      </PageHeader>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />)}
        </div>
      ) : viewMode === 'list' ? (
        <Table 
            data={staff} 
            columns={columns} 
            isLoading={loading}
            onRowClick={(member) => handleOpenManage(member)}
            renderContextMenu={(member) => [
                { label: 'Manage Profile', icon: Settings, onClick: () => handleOpenManage(member) },
                { label: 'View Activity', icon: Users, onClick: () => showToast('Activity log coming soon', 'info') }
            ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {staff.map(member => <StaffCard key={member.id} member={member} />)}
        </div>
      )}

      <Modal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        title={selectedStaff?.role === UserRole.SUPER_ADMIN ? "SuperAdmin Details" : "Staff Profile & Assignment"}
      >
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                {selectedStaff?.displayName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-blue-900 dark:text-blue-100 truncate">{selectedStaff?.displayName}</h4>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest truncate">{selectedStaff?.email}</p>
            </div>
        </div>

        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Department</label>
              <select 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                value={manageForm.departmentId}
                onChange={e => setManageForm({ ...manageForm, departmentId: e.target.value, jobTitleId: '' })}
              >
                <option value="">Select Department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Job Title</label>
              <select 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                value={manageForm.jobTitleId}
                onChange={e => setManageForm({ ...manageForm, jobTitleId: e.target.value })}
                disabled={!manageForm.departmentId}
              >
                <option value="">Select Job Title...</option>
                {jobTitles
                    .filter(j => j.departmentId === manageForm.departmentId)
                    .map(j => <option key={j.id} value={j.id}>{j.name}</option>)
                }
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setIsManageModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" isLoading={saving}>Save Assignment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
