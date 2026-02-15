
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InterpreterService, StorageService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { Interpreter } from '../../types';
import {
  User, Shield, Award, LogOut, Edit2, Save, X, Phone,
  Languages, Check, Upload, FileText, Info, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type ProfileTab = 'PERSONAL' | 'SKILLS' | 'COMPLIANCE' | 'AVAILABILITY';

export const InterpreterProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Interpreter | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('PERSONAL');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Interpreter>>({});

  // Calendar state
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (user?.profileId) {
      const p = await InterpreterService.getById(user.profileId);
      if (p) {
        setProfile(p);
        setFormData(p);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.profileId) return;

    setIsSaving(true);
    try {
      await InterpreterService.updateProfile(user.profileId, formData);
      showToast('Changes saved successfully', 'success');
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      showToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    const current = formData.languages || [];
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    setFormData({ ...formData, languages: updated });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.profileId) return;

    setIsUploading(true);
    try {
      const path = `interpreters/${user.profileId}/documents/dbs_${Date.now()}_${file.name}`;
      const url = await StorageService.uploadFile(file, path);
      setFormData(prev => ({ ...prev, dbsDocumentUrl: url }));
      showToast('Document uploaded successfully', 'success');
    } catch (error) {
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleGlobalAvailability = async () => {
    if (!profile || !user?.profileId) return;
    const newStatus = !profile.isAvailable;
    try {
      await InterpreterService.updateProfile(user.profileId, { isAvailable: newStatus });
      setProfile({ ...profile, isAvailable: newStatus });
      setFormData(prev => ({ ...prev, isAvailable: newStatus }));
      showToast(newStatus ? "You are now Online" : "You are now Offline", "info");
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const toggleDateAvailability = (dateStr: string) => {
    const current = formData.unavailableDates || [];
    const updated = current.includes(dateStr)
      ? current.filter(d => d !== dateStr)
      : [...current, dateStr];

    setFormData(prev => ({ ...prev, unavailableDates: updated }));
    // Auto-save availability changes to keep it fluid
    InterpreterService.updateProfile(user!.profileId!, { unavailableDates: updated });
  };

  if (!profile) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  const TabButton = ({ id, label, icon: Icon }: { id: ProfileTab; label: string; icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${activeTab === id
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const inputClasses = "w-full p-4 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 bg-white placeholder:text-slate-400 font-medium shadow-sm active:scale-[0.99]";
  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);
    const today = new Date().toISOString().split('T')[0];

    const days = [];
    // Padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-12 md:h-16 border border-gray-50 bg-gray-50/30"></div>);
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isToday = dateStr === today;
      const isUnavailable = formData.unavailableDates?.includes(dateStr);

      days.push(
        <div
          key={dateStr}
          onClick={() => !isPast && toggleDateAvailability(dateStr)}
          className={`h-16 flex flex-col items-center justify-center relative cursor-pointer transition-all active:scale-95 group/day
            ${isPast ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-white hover:bg-blue-50/50'}
            ${isUnavailable ? 'bg-red-50/50 border border-red-100 flex-1' : ''}
          `}
        >
          {isToday && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
          )}

          <span className={`text-sm font-black transition-colors ${isUnavailable ? 'text-red-600' : isPast ? 'text-slate-300' : 'text-slate-600 group-hover/day:text-blue-600'
            }`}>
            {d}
          </span>

          {isUnavailable && (
            <div className="absolute bottom-2 inset-x-2 flex justify-center">
              <div className="h-1 w-full max-w-[12px] bg-red-400 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-bold mt-1">Manage your identity, professional skills and compliance</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all border border-red-100 shadow-sm shadow-red-50 active:scale-95"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar: Profile Summary & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200/50 ring-4 ring-white">
                  {profile.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-4 border-white shadow-sm flex items-center justify-center ${profile.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  {profile.isAvailable && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900">{profile.name}</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">{profile.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant={profile.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {profile.status}
                </Badge>
                <Badge variant="info">
                  Interpreter Partner
                </Badge>
              </div>

              <div className="w-full mt-10 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Availability</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${profile.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {profile.isAvailable ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <button
                    onClick={toggleGlobalAvailability}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95 ${profile.isAvailable
                      ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/10'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10'
                      }`}
                  >
                    {profile.isAvailable ? <X size={16} /> : <Check size={16} />}
                    {profile.isAvailable ? 'Go Offline' : 'Set Active'}
                  </button>
                </div>

                <p className="px-4 text-[10px] text-slate-400 font-bold leading-relaxed">
                  {profile.isAvailable
                    ? 'Your profile is currently visible for on-demand booking requests.'
                    : 'You are hidden from searches but will still receive direct offers.'}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2 p-2 bg-white rounded-[2rem] shadow-sm border border-slate-100">
            <TabButton id="PERSONAL" label="Personal Details" icon={User} />
            <TabButton id="SKILLS" label="Skills & Expertise" icon={Award} />
            <TabButton id="COMPLIANCE" label="Compliance & DBS" icon={Shield} />
            <TabButton id="AVAILABILITY" label="Schedule Editor" icon={Calendar} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs for Mobile - Scrolled horizontally */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setActiveTab('PERSONAL')}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'PERSONAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('SKILLS')}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SKILLS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab('COMPLIANCE')}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'COMPLIANCE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('AVAILABILITY')}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'AVAILABILITY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              Schedule
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px]">
            {/* PERSONAL TAB */}
            {activeTab === 'PERSONAL' && (
              <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-black text-slate-900">Personal Information</h4>
                  {!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)} className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all flex items-center gap-2">
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  ) : (
                    <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 transition-all">
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Full Professional Name</label>
                    <input
                      type="text" disabled={!isEditing}
                      className={inputClasses + " disabled:bg-slate-50 disabled:text-slate-400 disabled:border-transparent"}
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Phone Number</label>
                    <input
                      type="tel" disabled={!isEditing}
                      className={inputClasses + " disabled:bg-slate-50 disabled:text-slate-400 disabled:border-transparent"}
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 0000 000000"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Postcode</label>
                    <input
                      type="text" disabled={!isEditing}
                      className={inputClasses + " disabled:bg-slate-50 disabled:text-slate-400 disabled:border-transparent uppercase"}
                      value={formData.postcode || ''}
                      onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="SW1A 1AA"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Primary Address</label>
                    <input
                      type="text" disabled={!isEditing}
                      className={inputClasses + " disabled:bg-slate-50 disabled:text-slate-400 disabled:border-transparent"}
                      value={formData.addressLine1 || ''}
                      onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Search for an address..."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-12 pt-10 border-t border-slate-50">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                      Confirm Changes
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'SKILLS' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-black text-slate-900">Expertise & Languages</h4>
                  {!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)} className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all flex items-center gap-2">
                      <Edit2 size={14} /> Update Skills
                    </button>
                  ) : (
                    <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 transition-all">
                      Cancel
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <label className={labelClasses + " mb-4"}>Target Languages</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {settings.masterData.priorityLanguages.map(lang => (
                        <label key={lang} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group/lang ${formData.languages?.includes(lang)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                          } ${!isEditing && 'opacity-60 pointer-events-none'}`}>
                          <input
                            type="checkbox" className="hidden"
                            checked={formData.languages?.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                          />
                          <span className="text-xs font-black uppercase tracking-wider">{lang}</span>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.languages?.includes(lang) ? 'bg-white/20 border-white text-white' : 'bg-slate-50 border-slate-100 text-transparent group-hover/lang:border-blue-200'
                            }`}>
                            <Check size={12} className="stroke-[4px]" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-12 pt-10 border-t border-slate-50">
                    <button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                      Save Updates
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* COMPLIANCE TAB */}
            {activeTab === 'COMPLIANCE' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-black text-slate-900">Compliance & Security</h4>
                  {!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)} className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all flex items-center gap-2">
                      <Edit2 size={14} /> Update Docs
                    </button>
                  ) : (
                    <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 transition-all">
                      Cancel
                    </button>
                  )}
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-8 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full -mr-6 -mt-6 blur-2xl"></div>

                  <div className="flex items-start gap-5 mb-8">
                    <div className="bg-white p-4 rounded-[1.5rem] text-orange-600 shadow-sm ring-1 ring-orange-200/50">
                      <Shield size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">Enhanced DBS Certificate</h4>
                      <p className="text-sm font-bold text-slate-500 mt-1">Verification status and documentation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className={labelClasses + " text-orange-600/80"}>Certificate Expiry</label>
                      <div className="relative">
                        <input
                          type="date" disabled={!isEditing}
                          className="w-full p-4 border border-orange-200/50 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-900 bg-white font-medium disabled:bg-white/50 disabled:border-transparent"
                          value={formData.dbsExpiry || ''}
                          onChange={e => setFormData({ ...formData, dbsExpiry: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className={`relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all min-h-[160px] ${formData.dbsDocumentUrl ? 'border-emerald-200 bg-white/60' : 'border-orange-200/50 bg-white/40 hover:bg-white/80'
                        }`}>
                        {formData.dbsDocumentUrl ? (
                          <div className="text-center">
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 inline-flex mb-3 shadow-sm">
                              <FileText size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Document Verified</p>
                            <div className="flex items-center gap-2 mt-4">
                              <a href={formData.dbsDocumentUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 text-white px-4 py-2 rounded-xl font-black uppercase tracking-[0.1em] hover:bg-black transition-all">View File</a>
                              {isEditing && (
                                <label className="cursor-pointer">
                                  <span className="text-[10px] bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-500 font-black uppercase hover:bg-slate-50 transition-all">Replace</span>
                                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isUploading} />
                                </label>
                              )}
                            </div>
                          </div>
                        ) : (
                          <label className={`flex flex-col items-center cursor-pointer group/upload ${!isEditing && 'pointer-events-none opacity-50'}`}>
                            <div className="bg-white p-4 rounded-2xl text-slate-300 mb-4 shadow-sm group-hover/upload:text-orange-500 transition-colors">
                              <Upload size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover/upload:text-slate-600 transition-colors">Upload Certificate</p>
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isUploading || !isEditing} />
                          </label>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-[2rem] z-20 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent shadow-sm"></div>
                              <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Encrypting...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-12 pt-10 border-t border-slate-50">
                    <button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                      Update Compliance
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AVAILABILITY TAB */}
            {activeTab === 'AVAILABILITY' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Manage Availabilty</h4>
                    <p className="text-sm font-bold text-slate-400 mt-1">Block dates when you are not available</p>
                  </div>

                  <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl self-start">
                    <button
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                      className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest px-6 w-44 text-center text-slate-700">
                      {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                      className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-10">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>

                <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200 relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-10 -mr-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                    <div className="bg-white/20 p-4 rounded-2xl text-white backdrop-blur-md">
                      <Info size={28} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-black text-lg">Smart Schedule Matching</h5>
                      <p className="text-blue-50 text-sm font-medium leading-relaxed mt-1">
                        Mark <span className="bg-white/20 px-2 py-0.5 rounded-md font-black">Busy</span> to stop receiving automatic matches. This won't affect your confirmed jobs.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-white rounded-[6px] shadow-sm"></div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-50">Free to work</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-[6px] shadow-md shadow-red-500/20"></div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-50">Blocked Date</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mx-1.5 shadow-[0_0_8px_white]"></div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-50">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center py-10 opacity-40">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] leading-relaxed text-center">
              Lingland internal partner platform v2.1<br />
              Secure encrypted session • UID: {user?.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
