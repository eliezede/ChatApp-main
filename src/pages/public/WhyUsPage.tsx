import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Shield,
    Clock,
    Award,
    Globe2,
    CheckCircle2,
    Zap,
    ChevronRight,
    Users,
    Building2,
    Lock,
    ArrowRight,
    Sparkles,
    BarChart3,
    Fingerprint,
    FileText,
    Video,
    Menu,
    X,
    Star
} from 'lucide-react';
import { PublicNavbar } from '../../components/ui/PublicNavbar';

const WhyUsPage = () => {
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 text-slate-900">

            <PublicNavbar transparent />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 mix-blend-screen animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20 mix-blend-screen"></div>
                    </div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-500/20 backdrop-blur-md shadow-lg shadow-blue-500/5">
                        <Sparkles size={12} className="mr-2 text-blue-400 animate-pulse" />
                        The Gold Standard
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-8 max-w-5xl mx-auto drop-shadow-2xl">
                        Where human expertise <br className="hidden md:block" />
                        meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">global standards.</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                        The enterprise language platform that combines the insight of expert linguists with the unmatched reliability and scale of our global operations network.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link to="/request" className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] transform hover:-translate-y-1 text-lg group border border-blue-500/50">
                            Book Interpreter
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="inline-flex justify-center items-center px-8 py-4 bg-slate-800/50 text-white border border-slate-700 font-bold rounded-2xl hover:bg-slate-800 transition-all hover:border-slate-600 backdrop-blur-sm">
                            Partner Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-20">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Engineered for Excellence</h2>
                        <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
                        <p className="mt-6 text-slate-600 max-w-2xl font-medium text-lg">
                            We don't just translate words; we bridge cultures with infrastructure built for the modern enterprise.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                        {/* Card 1: Experience (Large) */}
                        <div className="md:col-span-3 lg:col-span-4 row-span-2 bg-white rounded-[2rem] p-8 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Professional Experience</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Access a global network of vetted linguists with deep industry expertise in Law, MedTech, and Finance.</p>
                            </div>
                            <div className="mt-8 relative z-10">
                                <span className="text-6xl font-black text-slate-900 tracking-tighter">100<span className="text-blue-500">%</span></span>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Human Expertise</p>
                            </div>
                        </div>

                        {/* Card 2: Security (Medium) */}
                        <div className="md:col-span-3 lg:col-span-4 row-span-1 bg-white rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900"><Lock size={80} /></div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Bank-Grade Security</h3>
                            <p className="text-slate-600 text-sm">ISO 27001 certified with end-to-end encryption for all data in transit and at rest.</p>
                        </div>

                        {/* Card 3: Global Reach (Medium) */}
                        <div className="md:col-span-6 lg:col-span-4 row-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <Globe2 size={32} className="text-blue-100" />
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">Global</span>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-3xl font-black mb-1">200+</h3>
                                    <p className="font-medium text-blue-50">Languages & Dialects</p>
                                    <p className="text-xs text-blue-100/70 mt-1 leading-relaxed">Nuanced local context awareness.</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Compliance (Medium) */}
                        <div className="md:col-span-3 lg:col-span-4 row-span-1 bg-white rounded-[2rem] p-8 hover:border-purple-500/30 transition-all duration-500 group shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">GDPR & HIPAA</h3>
                            <p className="text-slate-600 text-sm">Full compliance with global data protection standards, ensuring your sensitive info stays private.</p>
                        </div>

                        {/* Card 5: Uptime (Wide) */}
                        <div className="md:col-span-6 lg:col-span-8 row-span-1 bg-white rounded-[2rem] p-8 flex items-center relative overflow-hidden group shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"></div>
                            <div className="relative z-10 w-full">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">99.9% Uptime SLA</h3>
                                </div>
                                <p className="text-slate-600 max-w-xl text-sm leading-relaxed">
                                    Our infrastructure is designed for high-availability. Never miss a critical communication window again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THE PROCESS --- */}
            <section className="py-24 bg-slate-900 relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">How Lingland Works</h2>
                        <p className="text-slate-400 font-medium">Streamlined from start to finish. Human precision without compromise.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { title: "Request", desc: "Book instantly through our platform or secure enterprise API.", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                                { title: "Match", desc: "Our coordinators pair your needs with the perfectly qualified expert linguist.", icon: Fingerprint, color: "text-blue-400", bg: "bg-blue-400/10" },
                                { title: "Connect", desc: "Collaborate in real-time through our HD video and crystal-clear audio platform.", icon: Video, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                { title: "Analyze", desc: "Receive detailed reporting and track your linguistic project performance.", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10" }
                            ].map((step, i) => (
                                <div key={i} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300">
                                    <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-900`}>
                                        <step.icon size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-400">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-blue-950"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight">
                        Ready to bridge the <span className="text-blue-500">language gap?</span>
                    </h2>
                    <p className="text-2xl text-slate-300 mb-12 font-light">
                        Join hundreds of forward-thinking companies scaling their global operations with Lingland's expert-led human network.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/request" className="px-10 py-5 bg-white text-blue-900 font-black text-xl rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 active:scale-95">
                            Book an Interpreter
                        </Link>
                    </div>
                    <p className="mt-8 text-sm text-slate-500">Fast connection to expert linguists worldwide.</p>
                </div>
            </section>

        </div>
    );
};

export default WhyUsPage;
