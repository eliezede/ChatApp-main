import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Globe2,
    CheckCircle2,
    Users,
    ArrowRight,
    Star,
    Award,
    Shield,
    Zap,
    Video,
    MessageSquare,
    ChevronRight,
    Menu,
    X,
    Building2,
    Clock,
    Scale
} from 'lucide-react';
import { PublicNavbar } from '../../components/ui/PublicNavbar';

const InterpretersPage = () => {
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            title: "Expert Vetting",
            desc: "Every linguist undergoes rigorous background checks and proficiency assessments.",
            icon: Shield,
            color: "text-blue-400"
        },
        {
            title: "ISO Certified",
            desc: "Our quality management follows ISO 9001 and ISO 17100 international standards.",
            icon: Award,
            color: "text-indigo-400"
        },
        {
            title: "Global Network",
            desc: "Access to over 5,000 professional interpreters covering 180+ languages.",
            icon: Globe2,
            color: "text-purple-400"
        },
        {
            title: "Sector Specialists",
            desc: "Deep expertise in Legal, Medical, Public Sector, and Corporate environments.",
            icon: Building2,
            color: "text-blue-400"
        }
    ];

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
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
                        <Star size={14} className="animate-pulse" />
                        <span>Elite Linguistic Network</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-8 max-w-5xl mx-auto drop-shadow-2xl">
                        Expert Linguists. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">Exceptional Results.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                        Whether you are looking for the best professional support or ready to take the next step in your career, Lingland connects the world's finest linguists with leading global organizations.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-black rounded-full hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center group transform hover:scale-105">
                            Book a Service Now <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/apply" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                            Work with Lingland
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- QUALITY & STANDARDS --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Our Quality Standards</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">We maintain the highest level of service through rigorous vetting and continuous monitoring.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                                <div className={`w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- HYBRID SECTION --- */}
            <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* For Clients */}
                        <div className="space-y-8">
                            <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest border border-blue-100">For Clients</div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Trust your most critical <span className="text-blue-600">conversations</span> to us.</h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                Our interpreters are not just linguists; they are subject matter experts. From courtroom proceedings to medical consultations, we ensure every word is conveyed with absolute precision.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-slate-700">
                                    <CheckCircle2 size={20} className="text-blue-600" />
                                    <span className="font-bold">24/7 Global Availability</span>
                                </div>
                                <div className="flex items-center space-x-3 text-slate-700">
                                    <CheckCircle2 size={20} className="text-blue-600" />
                                    <span className="font-bold">Industry Specific Expertise</span>
                                </div>
                                <div className="flex items-center space-x-3 text-slate-700">
                                    <CheckCircle2 size={20} className="text-blue-600" />
                                    <span className="font-bold">Enterprise APIs & Portal</span>
                                </div>
                            </div>
                            <Link to="/request" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 group">
                                Book your first service <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* For Interpreters - Dedicated Card */}
                        <div className="relative p-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] shadow-2xl">
                            <div className="bg-slate-900 rounded-[2.25rem] p-10 lg:p-12 space-y-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <Zap size={32} />
                                </div>
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Work with Lingland</div>
                                    <h2 className="text-3xl font-black text-white mb-4">Join the language <span className="text-indigo-400">elite</span>.</h2>
                                    <p className="text-slate-400 leading-relaxed">
                                        We are always looking for certified, professional interpreters to join our world-class network. Enjoy competitive rates, flexible scheduling, and the chance to work with the world's most innovative organizations.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                                        <p className="text-2xl font-black text-white mb-1">Top Rates</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Competitive Pay</p>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                                        <p className="text-2xl font-black text-white mb-1">Remote</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Work Anywhere</p>
                                    </div>
                                </div>
                                <Link to="/apply" className="block w-full text-center py-5 bg-white text-slate-900 font-black rounded-full hover:bg-blue-50 transition-all shadow-xl shadow-black/20 group">
                                    Apply Now
                                    <ArrowRight size={20} className="inline-block ml-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-950 pt-20 pb-10 text-slate-400 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
                                <Globe2 size={18} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Lingland</span>
                        </div>
                        <div className="flex space-x-8 text-sm font-bold">
                            <Link to="/why-us" className="hover:text-white transition-colors">Why Us</Link>
                            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
                            <Link to="/interpreters" className="text-white">Interpreters</Link>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center text-sm font-medium">
                        <p>&copy; {new Date().getFullYear()} Lingland Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InterpretersPage;
