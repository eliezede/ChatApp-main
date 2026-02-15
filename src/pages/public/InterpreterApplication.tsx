import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApplicationService } from '../../services/applicationService';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Globe2, ChevronLeft, ChevronRight, CheckCircle2, User,
  Languages, Award, BookOpen, UploadCloud, FileText, Check, ArrowRight
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

export const InterpreterApplication = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    languages: [] as string[],
    qualifications: [] as string[],
    dbsNumber: '',
    experienceSummary: ''
  });

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => (prev < 4 ? prev + 1 : prev) as Step);
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => (prev > 1 ? prev - 1 : prev) as Step);
  };

  const toggleItem = (listName: 'languages' | 'qualifications', item: string) => {
    const list = [...formData[listName]];
    const index = list.indexOf(item);
    if (index > -1) list.splice(index, 1);
    else list.push(item);
    setFormData({ ...formData, [listName]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ApplicationService.submit(formData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-3xl shadow-xl animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-lg shadow-green-100 ring-4 ring-green-50">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Application Sent!</h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Thanks, <strong>{formData.name.split(' ')[0]}</strong>. We've received your details. Our team will review your qualifications and be in touch shortly.
          </p>
          <Link to="/" className="inline-flex items-center px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-1">
            Return Home <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-slate-900 font-medium placeholder-slate-400";
  const labelClasses = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block ml-1";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-24">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-blue-600 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/30">
              <Globe2 size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Lingland <span className="text-slate-400">Careers</span></span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Join our Global Network</h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">Complete the steps below to apply as a professional interpreter.</p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">

          {/* Progress Header */}
          <div className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex justify-between items-center relative">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 z-10 ${step >= s ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-600/20 scale-110' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {step > s ? <Check size={16} strokeWidth={4} /> : s}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-3 transition-colors ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                    {s === 1 ? 'Start' : s === 2 ? 'Languages' : s === 3 ? 'Certs' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Personal Details</h2>
                    <p className="text-slate-500 text-sm">We need to know who you are.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Full Name</label>
                    <input type="text" required className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sarah Jones" />
                  </div>
                  <div>
                    <label className={labelClasses}>Email Address</label>
                    <input type="email" required className={inputClasses} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="e.g. sarah@example.com" />
                  </div>
                  <div>
                    <label className={labelClasses}>Phone Number</label>
                    <input type="tel" required className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. +44 7700 900000" />
                  </div>
                  <div>
                    <label className={labelClasses}>Postcode</label>
                    <input type="text" required className={inputClasses} value={formData.postcode} onChange={e => setFormData({ ...formData, postcode: e.target.value })} placeholder="e.g. SW1A 1AA" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Languages */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Languages size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Language Pairs</h2>
                    <p className="text-slate-500 text-sm">Select languages you interpret from/to English.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {settings.masterData.priorityLanguages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem('languages', lang)}
                      className={`p-4 rounded-xl border-2 text-sm font-bold transition-all relative overflow-hidden group ${formData.languages.includes(lang)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                    >
                      {formData.languages.includes(lang) && <div className="absolute top-2 right-2"><CheckCircle2 size={16} /></div>}
                      <span className="relative z-10">{lang}</span>
                    </button>
                  ))}
                </div>

                {formData.languages.length === 0 ? (
                  <p className="text-xs text-amber-500 font-bold bg-amber-50 inline-block px-3 py-1 rounded-full">Please select at least one language.</p>
                ) : (
                  <p className="text-xs text-blue-500 font-bold bg-blue-50 inline-block px-3 py-1 rounded-full">{formData.languages.length} languages selected.</p>
                )}
              </div>
            )}

            {/* STEP 3: Qualifications */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Qualifications</h2>
                    <p className="text-slate-500 text-sm">Verify your professional standing.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Certifications Held</label>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {['DPSI (Law)', 'DPSI (Health)', 'Community Interpreting L3', 'Met Police Test', 'NRPSI Registered', 'BSL Level 6'].map(qual => (
                        <button
                          key={qual}
                          type="button"
                          onClick={() => toggleItem('qualifications', qual)}
                          className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all ${formData.qualifications.includes(qual)
                              ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {qual}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                      <UploadCloud size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Upload CV / Resume</h4>
                    <p className="text-xs text-slate-500 mb-4">PDF, DOCX up to 5MB</p>
                    <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Choose File</button>
                  </div>

                  <div>
                    <label className={labelClasses}>Enhanced DBS Number (Optional)</label>
                    <input type="text" className={inputClasses} value={formData.dbsNumber} onChange={e => setFormData({ ...formData, dbsNumber: e.target.value })} placeholder="e.g. 001552..." />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Experience / Review */}
            {step === 4 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Experience & Review</h2>
                    <p className="text-slate-500 text-sm">Tell us more and submit.</p>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Professional Summary</label>
                  <textarea
                    required
                    rows={6}
                    className={inputClasses}
                    value={formData.experienceSummary}
                    onChange={e => setFormData({ ...formData, experienceSummary: e.target.value })}
                    placeholder="Briefly describe your interpreting experience, specialized domains (e.g. Crown Court, Mental Health), and years of practice..."
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 text-sm mb-4">Application Summary</h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-xs">
                    <div>
                      <dt className="text-blue-400 font-bold uppercase tracking-wider mb-1">Name</dt>
                      <dd className="text-blue-900 font-bold text-sm truncate">{formData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-blue-400 font-bold uppercase tracking-wider mb-1">Email</dt>
                      <dd className="text-blue-900 font-bold text-sm truncate">{formData.email}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-blue-400 font-bold uppercase tracking-wider mb-1">Languages</dt>
                      <dd className="text-blue-900 font-bold text-sm">{formData.languages.join(', ') || 'None selected'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={prevStep} className="px-6 py-3 rounded-xl border-slate-200 text-slate-600 font-bold">
                  Back
                </Button>
              ) : (
                <Link to="/">
                  <Button type="button" variant="ghost" className="px-6 py-3 rounded-xl text-slate-400 font-bold hover:text-slate-600">Cancel</Button>
                </Link>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={step === 1 && (!formData.name || !formData.email) || step === 2 && formData.languages.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none"
                >
                  Continue <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:bg-black transition-all hover:scale-[1.02]"
                >
                  Submit Application
                </Button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};