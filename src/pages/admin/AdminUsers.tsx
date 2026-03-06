import React, { useEffect, useState } from 'react';
import { UserService } from '../../services/userService';
import { User, UserRole } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Plus, ShieldOff, ShieldCheck, Trash2,
  User as UserIcon, Shield, Crown, Mail,
  MoreVertical, ExternalLink, Calendar,
  Filter, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: UserRole.ADMIN });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleSelection, setNewRoleSelection] = useState<UserRole | null>(null);
  const { showToast } = useToast();
  const { isSuperAdmin } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await UserService.getAll();
      setUsers(data ?? []);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionInProgress(user.id);
    try {
      await UserService.update(user.id, { status: newStatus });
      showToast(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`, 'success');
      await loadData();
    } catch (err) {
      showToast('Action failed', 'error');
    } finally { setActionInProgress(null); }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.displayName}? This action cannot be undone.`)) return;
    setActionInProgress(user.id);
    try {
      await UserService.delete(user.id);
      showToast('User deleted successfully', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    } finally { setActionInProgress(null); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress('invite');
    try {
      const newUser = await UserService.create({
        displayName: inviteData.name,
        email: inviteData.email,
        role: inviteData.role,
        status: 'PENDING'
      });
      await UserService.sendActivationEmail(inviteData.email, inviteData.name);
      showToast('Invitation sent successfully', 'success');
      setIsInviteModalOpen(false);
      setInviteData({ name: '', email: '', role: UserRole.ADMIN });
      await loadData();
    } catch (err) {
      showToast('Failed to send invitation', 'error');
    } finally { setActionInProgress(null); }
  };

  const handleRoleChange = async () => {
    if (!selectedUserForRole || !newRoleSelection) return;
    setActionInProgress('role-change');
    try {
      await UserService.update(selectedUserForRole.id, { role: newRoleSelection });
      showToast(`User role updated to ${newRoleSelection}`, 'success');
      setIsRoleModalOpen(false);
      setSelectedUserForRole(null);
      await loadData();
    } catch (err) {
      showToast('Failed to update role', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    setNewRoleSelection(user.role);
    setIsRoleModalOpen(true);
  };

  const safe = (val: any) => String(val ?? "").toLowerCase();

  const filteredUsers = (users ?? []).filter(u => {
    const q = safe(searchFilter);
    const matchesSearch = safe(u.displayName).includes(q) || safe(u.email).includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return <Crown className="text-amber-500" size={16} />;
      case UserRole.ADMIN: return <Shield className="text-blue-500" size={16} />;
      default: return <UserIcon className="text-gray-400" size={16} />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'danger'; // Using danger for gold-ish/important
      case UserRole.ADMIN: return 'info';
      case UserRole.CLIENT: return 'success';
      case UserRole.INTERPRETER: return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Users</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system administrators, clients, and platform access.</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          Invite New User
        </Button>
      </div>

      {/* Stats & Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="lg:col-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center h-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text" placeholder="Search by name, email, or ID..."
              className="pl-10 pr-4 py-3 bg-transparent w-full outline-none text-sm font-medium"
              value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
            />
          </div>
        </Card>

        <Card padding="sm" className="relative">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="w-full bg-transparent outline-none text-sm font-medium cursor-pointer"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admins</option>
              <option value={UserRole.ADMIN}>Administrators</option>
              <option value={UserRole.CLIENT}>Clients</option>
              <option value={UserRole.INTERPRETER}>Interpreters</option>
            </select>
          </div>
        </Card>

        <div className="flex gap-4">
          <Card padding="sm" className="flex-1 text-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{users.length}</div>
          </Card>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 animate-pulse">Retrieving user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No users found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <Card
              key={user.id}
              padding="none"
              className={`group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden flex flex-col ${user.status === 'SUSPENDED' ? 'opacity-75 grayscale-[0.5]' : ''
                }`}
            >
              {/* Suspended Indicator */}
              {user.status === 'SUSPENDED' && (
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-500 rotate-45 flex items-end justify-center pb-2 z-10 shadow-lg">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">Suspended</span>
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${user.role === UserRole.SUPER_ADMIN ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500' :
                      user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      {user.displayName.charAt(0).toUpperCase()}
                      {user.role === UserRole.SUPER_ADMIN && (
                        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md ring-1 ring-amber-200">
                          <Crown size={14} className="text-amber-500 fill-amber-500" />
                        </div>
                      )}
                    </div>
                    {/* Role Indicator Bubble */}
                    <div className="absolute -bottom-1 -right-1">
                      <div className={`w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${user.status === 'ACTIVE' ? 'bg-emerald-500' :
                        user.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    {user.displayName}
                    {user.role === UserRole.SUPER_ADMIN && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ring-1 ring-amber-500/20">Super</span>}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Mail size={14} />
                    <span className="truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </div>
                  </Badge>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={12} />
                    <span>Active</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 flex gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => toggleUserStatus(user)}
                  disabled={!!actionInProgress}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${user.status === 'ACTIVE'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  {user.status === 'ACTIVE' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  <span>{user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                </button>
                <button
                  onClick={() => openRoleModal(user)}
                  disabled={!!actionInProgress || (!isSuperAdmin && user.role === UserRole.SUPER_ADMIN)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-all shadow-sm"
                  title="Manage User Role"
                >
                  <Shield size={14} className="text-blue-500" />
                  <span>Role</span>
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  disabled={!!actionInProgress || user.role === UserRole.SUPER_ADMIN}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title={user.role === UserRole.SUPER_ADMIN ? "Cannot delete super admin" : "Delete user"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New User"
      >
        <form onSubmit={handleInvite} className="space-y-6 pt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-800">
            <AlertCircle className="text-blue-500 shrink-0" size={20} />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Sending an invitation will provision an account and send an activation email to the user.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="e.g. John Doe"
                  value={inviteData.name}
                  onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="name@company.com"
                  value={inviteData.email}
                  onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">System Role</label>
              <div className="grid grid-cols-2 gap-4">
                {[UserRole.ADMIN, UserRole.CLIENT, UserRole.INTERPRETER].map(r => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${inviteData.role === r
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                      }`}
                  >
                    <input
                      type="radio" name="role" className="hidden"
                      checked={inviteData.role === r}
                      onChange={() => setInviteData({ ...inviteData, role: r })}
                    />
                    <div className={`p-2 rounded-lg ${inviteData.role === r ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                      {r === UserRole.ADMIN ? <Shield size={18} /> : r === UserRole.CLIENT ? <UserIcon size={18} /> : <Calendar size={18} />}
                    </div>
                    <span className="font-bold text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {isSuperAdmin && (
              <div className="pt-2">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${inviteData.role === UserRole.SUPER_ADMIN
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-100 dark:border-gray-800 hover:border-amber-200'
                    }`}
                >
                  <input
                    type="radio" name="role" className="hidden"
                    checked={inviteData.role === UserRole.SUPER_ADMIN}
                    onChange={() => setInviteData({ ...inviteData, role: UserRole.SUPER_ADMIN })}
                  />
                  <div className={`p-2 rounded-lg ${inviteData.role === UserRole.SUPER_ADMIN ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                    <Crown size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">SUPER_ADMIN</span>
                    <span className="text-[10px] text-amber-600 font-bold uppercase">All permissions + Global Settings</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <Button variant="outline" className="flex-1 py-3 h-auto" onClick={() => setIsInviteModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button
              className="flex-1 py-3 h-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              loading={actionInProgress === 'invite'}
              type="submit"
              icon={Mail}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Manage User Role"
      >
        <div className="space-y-6 pt-4">
          {selectedUserForRole && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${selectedUserForRole.role === UserRole.SUPER_ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {selectedUserForRole.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{selectedUserForRole.displayName}</div>
                <div className="text-xs text-gray-500">{selectedUserForRole.email}</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select New Role</label>
            <div className="grid grid-cols-1 gap-3">
              {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT, UserRole.INTERPRETER].map(r => {
                const isSuper = r === UserRole.SUPER_ADMIN;
                const isDisabled = isSuper && !isSuperAdmin;

                return (
                  <label
                    key={r}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${newRoleSelection === r
                      ? (isSuper ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20')
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio" name="new-role" className="hidden"
                        checked={newRoleSelection === r}
                        disabled={isDisabled}
                        onChange={() => setNewRoleSelection(r)}
                      />
                      <div className={`p-2 rounded-lg ${newRoleSelection === r
                        ? (isSuper ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white')
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                        {r === UserRole.SUPER_ADMIN ? <Crown size={18} /> : r === UserRole.ADMIN ? <Shield size={18} /> : r === UserRole.CLIENT ? <UserIcon size={18} /> : <Calendar size={18} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{r}</span>
                        {isSuper && <span className="text-[10px] text-amber-600 font-bold uppercase">All permissions + Global Settings</span>}
                      </div>
                    </div>
                    {newRoleSelection === r && (
                      <CheckCircle2 size={20} className={isSuper ? 'text-amber-500' : 'text-blue-500'} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button variant="outline" className="flex-1 py-3 h-auto" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 py-3 h-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              loading={actionInProgress === 'role-change'}
              onClick={handleRoleChange}
              disabled={!newRoleSelection || newRoleSelection === selectedUserForRole?.role}
            >
              Update Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};