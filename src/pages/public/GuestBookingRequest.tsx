import React, { useState, useEffect } from 'react';
import { BookingService, ClientService, InterpreterService } from '../../services/api';
import { ServiceType, Booking, Client } from '../../types';
import {
  Globe2, CheckCircle2, ArrowRight, FileText, ShieldCheck,
  BadgeCheck, Clock, CreditCard, MapPin, Video, Calendar, User,
  Building2, Mail, Phone, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GuestBookingRequest = () => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [createdClient, setCreatedClient] = useState<Client | null>(null);

  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);

  const [formData, setFormData] = useState({
    costCode: '',
    name: '',
    organisation: '',
    email: '',
    phone: '',
    billingEmail: '', // Kept for API compatibility, can default to email if not shown
    languageFrom: 'English',
    languageTo: '',
    date: '',
    startTime: '',
    durationMinutes: 60,
    serviceType: ServiceType.FACE_TO_FACE,
    locationType: 'ONSITE' as 'ONSITE' | 'ONLINE',
    address: '',
    postcode: '',
    onlineLink: '',
    notes: '',
    genderPreference: 'None',
    agreedToTerms: false
  });

  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const interpreters = await InterpreterService.getAll();
        const activeInts = interpreters.filter(i => i.status === 'ACTIVE');
        const allLangs = activeInts.flatMap(i => i.languages);
        const uniqueLangs = Array.from(new Set(allLangs)).sort();
        setAvailableLanguages(uniqueLangs);
      } catch (e) {
        console.error("Failed to load languages");
      } finally {
        setLoadingLangs(false);
      }
    };
    fetchLangs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.languageTo) {
      alert('Please select a target language');
      return;
    }
    setLoading(true);
    try {
      const booking = await BookingService.createGuestBooking({
        guestContact: {
          name: formData.name,
          organisation: formData.organisation,
          email: formData.email,
          phone: formData.phone,
          billingEmail: formData.billingEmail || formData.email
        },
        date: formData.date,
        startTime: formData.startTime,
        durationMinutes: Number(formData.durationMinutes),
        languageFrom: formData.languageFrom,
        languageTo: formData.languageTo,
        serviceType: formData.serviceType,
        locationType: formData.locationType,
        address: formData.address,
        postcode: formData.postcode,
        onlineLink: formData.onlineLink,
        costCode: formData.costCode,
        notes: formData.notes,
        genderPreference: formData.genderPreference
      });

      setCreatedBooking(booking);
      setStep('SUCCESS');
    } catch (err) {
      console.error(err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!createdBooking?.guestContact) return;
    setLoading(true);
    try {
      const client = await ClientService.createClientFromGuest(createdBooking.guestContact);
      await BookingService.linkClientToBooking(createdBooking.id, client.id);
      setCreatedClient(client);
    } catch (e) {
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const InputGroup = ({ label, icon: Icon, required = false, children }: any) => (
    <div className="mb-5">
      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-slate-400" />}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 hover:border-blue-200";

  // --- Success View ---
  if (step === 'SUCCESS' && createdBooking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
          <div className="bg-green-50 p-8 text-center border-b border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Booking Received!</h2>
            <p className="text-slate-600">
              Reference: <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 ml-1">{createdBooking.bookingRef}</span>
            </p>
          </div>

          <div className="p-8">
            <p className="text-center text-slate-500 text-sm mb-8">
              We've sent a confirmation to <strong>{formData.email}</strong>.<br />
              Our team will review your request shortly.
            </p>

            {!createdClient ? (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">Use Lingland often?</h3>
                <p className="text-blue-100 text-sm mb-4 relative z-10">
                  Create a secure account instantly to manage bookings, view invoices, and track spending.
                </p>
                <button
                  onClick={handleCreateClient}
                  disabled={loading}
                  className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg shadow-sm hover:bg-blue-50 transition-colors relative z-10 flex items-center justify-center"
                >
                  {loading ? 'Creating...' : 'Create Account from Booking'} <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center animate-fade-in">
                <BadgeCheck size={32} className="text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-emerald-900">Account Created!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Login with: <strong>{createdClient.email}</strong>
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center transition-colors">
                <ChevronRight size={14} className="rotate-180 mr-1" /> Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Globe2 size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Lingland</span>
          </Link>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Need help? <a href="tel:+442012345678" className="text-blue-600 font-bold hover:underline">+44 20 1234 5678</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Book an Interpreter</h1>
              <p className="text-lg text-slate-500">Secure, professional language support in minutes.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* 1. Billing Section */}
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Billing Information</h3>
                    <p className="text-xs text-slate-500">Enter your PO or Cost Code to process this request.</p>
                  </div>
                </div>

                <InputGroup label="Purchase Order / Cost Code" required>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2024-001 or CC-HR-99"
                    className={`${inputClasses} font-mono bg-slate-50 border-slate-300 focus:bg-white`}
                    value={formData.costCode}
                    onChange={e => setFormData({ ...formData, costCode: e.target.value })}
                  />
                </InputGroup>
              </div>

              {/* 2. Client Details */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Contact Details</h3>
                    <p className="text-xs text-slate-500">Who is making this booking?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Your Name" icon={User} required>
                    <input type="text" required className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </InputGroup>
                  <InputGroup label="Organisation" icon={Building2} required>
                    <input type="text" required className={inputClasses} value={formData.organisation} onChange={e => setFormData({ ...formData, organisation: e.target.value })} />
                  </InputGroup>
                  <InputGroup label="Email Address" icon={Mail} required>
                    <input type="email" required className={inputClasses} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </InputGroup>
                  <InputGroup label="Phone Number" icon={Phone} required>
                    <input type="tel" required className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </InputGroup>
                </div>
              </div>

              {/* 3. Session Details */}
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Session Details</h3>
                    <p className="text-xs text-slate-500">When and where do you need us?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <InputGroup label="Language From">
                    <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm flex items-center justify-between cursor-not-allowed">
                      English <ShieldCheck size={14} />
                    </div>
                  </InputGroup>
                  <InputGroup label="Language To" required>
                    <select
                      required
                      disabled={loadingLangs}
                      className={inputClasses}
                      value={formData.languageTo}
                      onChange={e => setFormData({ ...formData, languageTo: e.target.value })}
                    >
                      <option value="">{loadingLangs ? 'Loading languages...' : 'Select Target Language...'}</option>
                      {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <InputGroup label="Date" icon={Calendar} required>
                    <input type="date" required className={inputClasses} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </InputGroup>
                  <InputGroup label="Start Time" icon={Clock} required>
                    <input type="time" required className={inputClasses} value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                  </InputGroup>
                  <InputGroup label="Duration (Mins)" required>
                    <input type="number" min="30" step="15" required className={inputClasses} value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })} />
                  </InputGroup>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Service Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`
                           flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                           ${formData.locationType === 'ONSITE'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'}
                        `}>
                      <input type="radio" name="loc" className="hidden" value="ONSITE" checked={formData.locationType === 'ONSITE'} onChange={() => setFormData({ ...formData, locationType: 'ONSITE' })} />
                      <MapPin size={20} className="mr-2" />
                      <span className="font-bold text-sm">Face-to-Face</span>
                    </label>

                    <label className={`
                           flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                           ${formData.locationType === 'ONLINE'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'}
                        `}>
                      <input type="radio" name="loc" className="hidden" value="ONLINE" checked={formData.locationType === 'ONLINE'} onChange={() => setFormData({ ...formData, locationType: 'ONLINE' })} />
                      <Video size={20} className="mr-2" />
                      <span className="font-bold text-sm">Video Remote</span>
                    </label>
                  </div>
                </div>

                {formData.locationType === 'ONSITE' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
                    <div className="md:col-span-2">
                      <InputGroup label="Location Address" required>
                        <input type="text" required placeholder="Street address, Building, Floor..." className={inputClasses} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                      </InputGroup>
                    </div>
                    <InputGroup label="Postcode" required>
                      <input type="text" required className={inputClasses} value={formData.postcode} onChange={e => setFormData({ ...formData, postcode: e.target.value })} />
                    </InputGroup>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <InputGroup label="Meeting Link / Platform" required>
                      <input type="text" required placeholder="e.g. MS Teams Link, Zoom ID, or 'TBC'" className={inputClasses} value={formData.onlineLink} onChange={e => setFormData({ ...formData, onlineLink: e.target.value })} />
                    </InputGroup>
                  </div>
                )}
              </div>

              {/* Footer / Submit */}
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <label className="flex items-start mb-6 cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                  <input type="checkbox" required className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={formData.agreedToTerms} onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })} />
                  <span className="ml-3 text-sm text-slate-600 leading-snug">
                    I agree to Lingland's <a href="#" className="font-bold text-blue-600 hover:underline">Terms of Service</a> and confirm that I am authorised to make bookings on behalf of my organisation.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || availableLanguages.length === 0}
                  className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-slate-900/10 hover:bg-black hover:shadow-slate-900/20 hover:scale-[1.01] transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <ArrowRight size={20} className="mr-2" />
                  )}
                  Submit Request
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Trust & Info */}
          <div className="space-y-6 hidden lg:block sticky top-28">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Why Lingland?</h3>

              <ul className="space-y-4 relative z-10">
                <li className="flex items-start">
                  <BadgeCheck className="mt-0.5 mr-3 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Verified Experts</h4>
                    <p className="text-xs text-blue-100 opacity-80 mt-0.5">Every interpreter is vetted, certified, and DBS checked.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="mt-0.5 mr-3 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Secure & Private</h4>
                    <p className="text-xs text-blue-100 opacity-80 mt-0.5">Enterprise-grade encryption for all data and billing.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="mt-0.5 mr-3 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">24/7 Support</h4>
                    <p className="text-xs text-blue-100 opacity-80 mt-0.5">Our coordination team monitors all active sessions.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <blockquote className="text-slate-600 text-sm italic mb-4">
                "The fastest way to get a professional for our urgent legal hearings. No account needed, just seamless service."
              </blockquote>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs mr-3">SJ</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Legal Coordinator</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};