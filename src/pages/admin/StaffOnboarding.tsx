import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StaffService } from '../../services/staffService';
import { StaffProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { 
  User, Heart, MapPin, Shield, Calendar, Phone, 
  CheckCircle2, ArrowRight, ArrowLeft, Rocket
} from 'lucide-react';

export const StaffOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StaffProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const p = await StaffService.getProfile(user.id);
        if (p?.onboardingCompleted) {
          navigate('/admin/dashboard');
          return;
        }
        setProfile(p);
      } catch (err) {
        showToast('Error loading profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user, navigate]);

  const handleUpdate = (field: string, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleAddressUpdate = (field: string, value: string) => {
    if (!profile) return;
    setProfile({ 
      ...profile, 
      address: { ...(profile.address || { street: '', town: '', county: '', postcode: '' }), [field]: value } 
    });
  };

  const handleEmergencyUpdate = (field: string, value: string) => {
    if (!profile) return;
    setProfile({ 
      ...profile, 
      emergencyContact: { ...(profile.emergencyContact || { name: '', relationship: '', phone: '' }), [field]: value } 
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!profile?.phone && !!profile?.dob;
    if (step === 2) return !!profile?.niNumber && !!profile?.address?.street && !!profile?.address?.postcode;
    if (step === 3) return !!profile?.emergencyContact?.name && !!profile?.emergencyContact?.phone;
    return true;
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await StaffService.updateProfile(profile.id, {
        ...profile,
        onboardingCompleted: true
      });
      showToast('Welcome to the team! Onboarding complete.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast('Failed to complete onboarding', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Preparing your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800">
        <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }} 
        />
      </div>
      
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6 group transition-transform hover:scale-105">
            <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome to Lingland</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Let's get your professional profile ready in just a few steps.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-2xl transition-all">
          
          <div className="flex items-center justify-center mb-10 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${s <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {s < step ? <CheckCircle2 size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 mx-1 rounded-full ${s < step ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 mb-2">
                    <User className="text-blue-600" size={20} />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Personal Details</h2>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="tel"
                      placeholder="+44 7xxx xxxxxx"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                      value={profile?.phone || ''}
                      onChange={e => handleUpdate('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="date"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                      value={profile?.dob || ''}
                      onChange={e => handleUpdate('dob', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-blue-600" size={20} />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Legal & HMRC Data</h2>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">National Insurance Number (NI)</label>
                  <input 
                    type="text"
                    placeholder="e.g. QQ 12 34 56 C"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 uppercase font-mono tracking-wider"
                    value={profile?.niNumber || ''}
                    onChange={e => handleUpdate('niNumber', e.target.value)}
                  />
                  <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Mandatory for internal system compliance.</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Home Address</label>
                  <input 
                    placeholder="Street Address"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                    value={profile?.address?.street || ''}
                    onChange={e => handleAddressUpdate('street', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      placeholder="Town/City"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                      value={profile?.address?.town || ''}
                      onChange={e => handleAddressUpdate('town', e.target.value)}
                    />
                    <input 
                      placeholder="Postcode"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 uppercase"
                      value={profile?.address?.postcode || ''}
                      onChange={e => handleAddressUpdate('postcode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="text-red-500" size={20} />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Emergency Contact</h2>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20 mb-4">
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">We hope we never need to use this, but we need someone to contact in case of an emergency during work hours.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Contact Name</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                    value={profile?.emergencyContact?.name || ''}
                    onChange={e => handleEmergencyUpdate('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Relationship</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                        value={profile?.emergencyContact?.relationship || ''}
                        onChange={e => handleEmergencyUpdate('relationship', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phone Number</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                        value={profile?.emergencyContact?.phone || ''}
                        onChange={e => handleEmergencyUpdate('phone', e.target.value)}
                      />
                    </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-12 pt-6 border-t border-slate-50 dark:border-slate-800/50">
            {step > 1 && (
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 border-none bg-slate-100 dark:bg-slate-800"
                onClick={() => setStep(step - 1)}
                icon={ArrowLeft}
              >
                Back
              </Button>
            )}
            <Button 
              size="lg" 
              className="flex-1"
              disabled={!isStepValid()}
              isLoading={saving}
              onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
              icon={step === 3 ? Rocket : ArrowRight}
              iconPosition="right"
            >
              {step === 3 ? "Complete Onboarding" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
