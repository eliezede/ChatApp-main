import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Globe2, ArrowRight, CheckCircle2,
  Menu, X, Sparkles, Check, LogIn, Headset,
  Layers, Presentation, FileCheck, Scale, History, Hand, MessagesSquare,
  Shield, Star, Users, Zap
} from 'lucide-react';
import { PublicNavbar } from '../../components/ui/PublicNavbar';

const services = [
  {
    title: 'In-Person Interpreting',
    desc: 'Expert linguists for medical appointments, legal hearings, and business summits. Local expertise when physical presence matters most.',
    icon: MessagesSquare,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    delay: '0'
  },
  {
    title: 'Video Remote (VRI)',
    desc: 'Instant connection to qualified interpreters via secure video link. Perfect for urgent consultations and virtual meetings.',
    icon: Headset,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    delay: '100'
  },
  {
    title: 'Certified Translation',
    desc: 'ISO-compliant document translation for legal, medical, and official papers. Fast turnaround with accuracy guaranteed.',
    icon: FileCheck,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    delay: '200'
  },
  {
    title: 'Conference Services',
    desc: 'Simultaneous interpretation equipment and teams for large-scale international events and webinars.',
    icon: Presentation,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    delay: '300'
  }
];

const stats = [
  { label: 'Languages', value: '180+' },
  { label: 'Interpreters', value: '5,000+' },
  { label: 'Match Time', value: '< 3 min' },
  { label: 'Client Satisfaction', value: '99.8%' }
];

export const LandingPage = () => {
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">

      <PublicNavbar transparent />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-900">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20 mix-blend-screen"></div>
          </div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-8 border border-blue-500/20 backdrop-blur-sm">
                <Zap size={12} className="mr-2 text-blue-400" />
                The Future of Interpretation
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Bridging barriers with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">expert voices.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
                Connect seamlessly with certified interpreters worldwide. From high-stakes legal proceedings to medical emergencies, we provide the voice you need, instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/request"
                  className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-1 text-lg group"
                >
                  Book as Guest
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Partner Login
                </Link>
              </div>

              <div className="mt-12 flex items-center space-x-6 text-sm font-medium text-slate-500">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-blue-500" /> GDPR Compliant
                </div>
                <div className="flex items-center">
                  <Star size={16} className="mr-2 text-blue-500" /> ISO 9001 Certified
                </div>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="relative hidden lg:block perspective-1000">
              {/* Main Card */}
              <div className="relative z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-out max-w-md mx-auto">
                {/* Header of Card */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 ring-2 ring-green-500/20">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Booking Confirmed</p>
                      <p className="text-xs text-blue-200/60">Reference #LG-8829</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold">
                    Active
                  </div>
                </div>

                {/* Body of Card */}
                <div className="space-y-4">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">JS</div>
                    <div>
                      <p className="text-sm font-bold text-white">John Smith</p>
                      <p className="text-xs text-blue-200/60">Verified Legal Interpreter</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-blue-100/80 px-2">
                    <span>Language Pair</span>
                    <span className="font-bold text-white">English ↔ Spanish</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-blue-100/80 px-2">
                    <span>Duration</span>
                    <span className="font-bold text-white">2 Hours</span>
                  </div>
                </div>

                {/* Simulated 'Voice' Waveform */}
                <div className="mt-8 flex items-center justify-center space-x-1 h-8 opacity-60">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1 bg-blue-400 rounded-full animate-music-bar" style={{ height: Math.random() * 24 + 8 + 'px', animationDelay: i * 0.1 + 's' }}></div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 -right-10 z-10 p-4 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl animate-float-slow">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Globe2 size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Global Reach</p>
                    <p className="text-xs text-slate-500">180+ Languages</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 z-30 p-4 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl animate-float-delayed">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Shield size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Verified Pro</p>
                    <p className="text-xs text-slate-500">DBS Checked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 backdrop-blur-sm hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-8 divide-x divide-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="text-center px-4">
                  <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs font-bold text-blue-200/60 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section id="services" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Comprehensive language solutions for <span className="relative inline-block">
                <span className="relative z-10">any scenario.</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-200/50 -rotate-1"></span>
              </span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100"
              >
                <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className={`${service.color}`} size={28} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {service.desc}
                </p>
                <Link to="/services" className="mt-6 pt-6 border-t border-slate-50 flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- JOIN US SECTION --- */}
      <section id="interpreters" className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl">
            {/* Abstract decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest mb-6 border border-white/10">
                  <Sparkles size={14} className="mr-2 text-yellow-400" />
                  Work with Lingland
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                  Transform your fluency into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">new opportunities.</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
                  Join the UK's most advanced interpreting network. Enjoy seamless digital management, rapid payments, and complete flexibility over your schedule.
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    "Weekly pay with direct deposit",
                    "Complete scheduling flexibility",
                    "Access to global corporate clients",
                    "Zero paperwork, 100% digital"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center text-white/90 font-medium">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-blue-900/50">
                        <Check size={14} className="text-white" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  to="/apply"
                  className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20 transform hover:scale-105 group"
                >
                  Apply to Join Network
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="hidden lg:relative lg:block h-[400px]">
                {/* Decorative Dashboard UI specific for Interpreter */}
                <div className="absolute top-10 right-10 w-full max-w-sm bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">This Month</p>
                      <p className="text-3xl font-black text-white">£4,250.00</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                      <ArrowRight className="-rotate-45" size={24} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    </div>
                    <p className="text-xs text-slate-500 text-right font-bold">+12% vs last month</p>
                  </div>
                </div>

                <div className="absolute bottom-0 right-1/3 w-64 bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xl transform -rotate-6 hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <History size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">New Job Offer</p>
                      <p className="text-xs text-slate-400">Medical • 2 mins ago</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white">Accept</button>
                    <button className="flex-1 py-2 bg-slate-700 rounded-lg text-xs font-bold text-slate-300">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-10 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
                  <Globe2 size={18} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Lingland</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
                The world's most trusted platform for professional linguistic services.
                Bridging language barriers with technology, speed, and human expertise.
              </p>
              <div className="flex space-x-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Globe2 size={18} /></div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Users size={18} /></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Solutions</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Medical</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Legal & Court</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Corporate Business</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Conferences</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><Link to="/apply" className="hover:text-blue-400 transition-colors">Become a Partner</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <p>© 2024 Lingland Ltd. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">ISO 9001</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};