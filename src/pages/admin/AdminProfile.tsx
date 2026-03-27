import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StaffService } from '../../services/staffService';
import { StaffProfile, Department, JobTitle, SystemModule } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { ImageCropper } from '../../components/ui/ImageCropper';
import { UserService } from '../../services/userService';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  Shield, Briefcase, Building2, Bell, Sun, 
  Moon, Monitor, Save, AlertCircle, Heart,
  ShieldCheck, Database, Upload
} from 'lucide-react';

export const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [allowedModules, setAllowedModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { showToast } = useToast();

  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prof, depts, jobs, perms] = await Promise.all([
        StaffService.getProfile(user.id),
        StaffService.getDepartments(),
        StaffService.getJobTitles(),
        StaffService.getLevelPermissions()
      ]);
      setProfile(prof);
      setDepartments(depts);
      setJobTitles(jobs);
      
      // Find user's allowed modules based on grade
      if (prof?.jobTitleId) {
          const job = jobs.find(j => j.id === prof.jobTitleId);
          if (job?.level) {
              const levelPerm = perms.find(p => p.level === job.level);
              setAllowedModules(levelPerm?.modules || []);
          }
      }
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    if (!user?.id) return;
    setIsUploading(true);
    try {
      const photoUrl = await UserService.uploadProfilePhoto(user.id, croppedImage, user.role);
      setProfile(prev => prev ? { ...prev, photoUrl } : null);
      await refreshUser();
      showToast('Profile photo updated', 'success');
    } catch (error) {
      showToast('Failed to update photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Profile Matrix...</p>
    </div>
  );

  const currentDept = departments.find(d => d.id === profile?.departmentId);
  const currentJob = jobTitles.find(j => j.id === profile?.jobTitleId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <PageHeader title="My Profile" subtitle="Manage your professional data and platform preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm">
             <div className="relative mb-4 mx-auto w-24 h-24 group">
                <UserAvatar 
                  src={profile?.photoUrl || user?.photoUrl} 
                  name={user?.displayName || ''} 
                  size="2xl" 
                  showBorder 
                  className={isUploading ? 'opacity-50' : ''}
                />
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg border-2 border-white cursor-pointer flex items-center justify-center transition-all hover:scale-110 group-hover:rotate-6">
                  <Upload size={14} strokeWidth={2.5} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} disabled={isUploading} />
                </label>
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
                                type="button"
                                onClick={() => handleUpdatePreference('theme', mode)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${profile?.preferences?.theme === mode ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
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
                        type="button"
                        onClick={() => handleUpdatePreference('notifications', !profile?.preferences?.notifications)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${profile?.preferences?.notifications ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile?.preferences?.notifications ? 'left-5' : 'left-1'}`} />
                    </button>
                </div>
             </div>
          </div>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 gap-4 border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade / Level</p>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-slate-900 dark:text-white">Level {currentJob?.level || '1'}</p>
                            <Badge variant="neutral" className="text-[9px]">SYSTEM ACCESS: {allowedModules.length} MODULES</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 gap-4 border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-600/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                        <Database size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Permissions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {allowedModules.map(m => (
                                <Badge key={m} variant="success" className="text-[8px] px-1.5 py-0">
                                    {m.replace('_', ' ')}
                                </Badge>
                            ))}
                            {allowedModules.length === 0 && <span className="text-[10px] text-slate-400">Restricted Access</span>}
                        </div>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input 
                                type="tel"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
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
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
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
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
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
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                value={profile?.address?.street || ''}
                                onChange={e => profile && setProfile({ ...profile, address: { ...profile.address!, street: e.target.value } })}
                            />
                        </div>
                        <input 
                            type="text" placeholder="Town/City"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                            value={profile?.address?.town || ''}
                            onChange={e => profile && setProfile({ ...profile, address: { ...profile.address!, town: e.target.value } })}
                        />
                        <input 
                            type="text" placeholder="Postcode"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20 uppercase"
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
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                            value={profile?.emergencyContact?.name || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, name: e.target.value } })}
                        />
                        <input 
                            type="text" placeholder="Relationship"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                            value={profile?.emergencyContact?.relationship || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, relationship: e.target.value } })}
                        />
                        <input 
                            type="tel" placeholder="Phone"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                            value={profile?.emergencyContact?.phone || ''}
                            onChange={e => profile && setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact!, phone: e.target.value } })}
                        />
                    </div>
                </div>
             </div>
           </form>
        </div>
      </div>

      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
