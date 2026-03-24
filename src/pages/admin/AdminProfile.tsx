import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StaffService } from '../../services/staffService';
import { StaffProfile, Department, JobTitle } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  Shield, Briefcase, Building2, Bell, Sun, 
  Moon, Monitor, Save, AlertCircle, Heart
} from 'lucide-react';

export const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { showToast } = useToast();

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prof, depts, jobs] = await Promise.all([
        StaffService.getProfile(user.id),
        StaffService.getDepartments(),
        StaffService.getJobTitles()
      ]);
      setProfile(prof);
      setDepartments(depts);
      setJobTitles(jobs);
    } catch (error) {
      showToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleUpdatePreference = async (key: string, value: any) => {
    if (!profile) return;
    try {
        const newPreferences = { ...profile.preferences, [key]: value };
        await StaffService.updateProfile(profile.id, { preferences: newPreferences });
        setProfile({ ...profile, preferences: newPreferences });
        showToast('Preferences updated', 'success');
    } catch (e) {
        showToast('Failed to save preference', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
        await StaffService.updateProfile(profile.id, profile);
        showToast('Profile saved successfully', 'success');
    } catch (e) {
        showToast('Failed to save profile', 'error');
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading profile...</div>;

  const currentDept = departments.find(d => d.id === profile?.departmentId);
  const currentJob = jobTitles.find(j => j.id === profile?.jobTitleId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <PageHeader title="My Profile" subtitle="Manage your professional data and platform preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm">
             <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-blue-500/20">
                {user?.displayName?.charAt(0)}
             </div>
             <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">{user?.displayName}</h2>
             <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
             
             <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Department</span>
                    <span className="font-bold text-blue-600">{currentDept?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Job Title</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{currentJob?.name || 'Unassigned'}</span>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Interface Preferences</h3>
             <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-3">Color Mode</label>
                   <div className="grid grid-cols-3 gap-2">
                       {['light', 'dark', 'system'].map((mode) => (
                           <button 
                                key={mode}
                                onClick={() => handleUpdatePreference('theme', mode)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${profile?.preferences.theme === mode ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                            >
                               {mode === 'light' && <Sun size={16} />}
                               {mode === 'dark' && <Moon size={16} />}
                               {mode === 'system' && <Monitor size={16} />}
                               <span className="text-[10px] capitalize mt-2 font-bold">{mode}</span>
                           </button>
                       ))}
                   </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Notifications</span>
                        <span className="text-[10px] text-slate-400">Desktop & Email alerts</span>
                    </div>
                    <button 
                        onClick={() => handleUpdatePreference('notifications', !profile?.preferences.notifications)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${profile?.preferences.notifications ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile?.preferences.notifications ? 'left-5' : 'left-1'}`} />
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Profile Main Form */}
        <div className="lg:col-span-2 space-y-6">
           <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
                    <User size={18} className="mr-2 text-blue-600" />
                    Employee Record (UK)
                </h3>
                <Button type="submit" icon={Save} isLoading={saving}>Save Changes</Button>
             </div>

             <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input 
                                type="tel"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                placeholder="+44 7xxx xxxxxx"
                                value={profile?.phone || ''}
                                onChange={e => profile && setProfile({ ...profile, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input 
                                type="date"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                value={profile?.dob || ''}
                                onChange={e => profile && setProfile({ ...profile, dob: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">NI Number</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input 
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                placeholder="QQ 12 34 56 C"
                                value={profile?.niNumber || ''}
                                onChange={e => profile && setProfile({ ...profile, niNumber: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center">
                        <MapPin size={14} className="mr-2 text-slate-400" />
                        Home Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <input 
                                type="text" placeholder="Street Address"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                value={profile?.address?.street || ''}
                                onChange={e => profile && setProfile({ ...profile, address: { ...profile.address!, street: e.target.value } })}
                            />
                        </div>
                        <input 
                            type="text" placeholder="Town/City"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={profile?.address?.town || ''}
                            onChange={e => profile && setProfile({ ...profile, address: { ...profile.address!, town: e.target.value } })}
                        />
                        <input 
                            type="text" placeholder="Postcode"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={profile?.address?.postcode || ''}
                            onChange={e => profile && setProfile({ ...profile, address: { ...profile.address!, postcode: e.target.value } })}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center">
                        <Heart size={14} className="mr-2 text-red-500" />
                        Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                            type="text" placeholder="Full Name"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={profile?.emergencyContact?.name || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, name: e.target.value } })}
                        />
                        <input 
                            type="text" placeholder="Relationship"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={profile?.emergencyContact?.relationship || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, relationship: e.target.value } })}
                        />
                        <input 
                            type="tel" placeholder="Phone"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={profile?.emergencyContact?.phone || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, phone: e.target.value } })}
                        />
                    </div>
                </div>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};
