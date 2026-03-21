import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Globe2, CheckCircle2, ArrowRight, ShieldCheck,
    Clock, MapPin, Video, Phone, FileText, ChevronRight,
    MessageSquare, Star, Users, Menu, X
} from 'lucide-react';
import { PublicNavbar } from '../../components/ui/PublicNavbar';

export const ServicesPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PublicNavbar transparent />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 mix-blend-screen animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20 mix-blend-screen"></div>
                    </div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-8 border border-blue-500/20 backdrop-blur-sm">
                        Global Language Solutions
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
                        Breaking barriers with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">precision and speed.</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Expert interpretation and translation services powered by certified professionals and enterprise-grade technology.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-1 text-lg group whitespace-nowrap flex items-center justify-center">
                            Get a Free Quote <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#services" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center">
                            Explore Services
                        </a>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section id="services" className="relative z-20 -mt-20 px-4 lg:px-8 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                        {/* Service Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">On-site Interpreting</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Face-to-face professional support for your most critical meetings, court hearings, and medical appointments. Our interpreters provide culturally nuanced communication.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Court Certified Experts</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Medical & NHS Specialists</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> DBS Checked Professionals</li>
                            </ul>
                            <Link to="/request" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700">
                                Book On-site <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        {/* Service Card 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Video size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Video Remote (VRI)</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Instant visual connection to certified interpreters through our secure platform. Ideal for healthcare consultations, HR interviews, and distance learning.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> HD Secure Video</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> No Software Installation</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Connect in &lt; 30 Seconds</li>
                            </ul>
                            <Link to="/request" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700">
                                Book Video Session <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        {/* Service Card 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Phone size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Telephone (OPI)</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Immediate audio access to professional interpreters in over 200 languages. Available 24/7 with zero connection fees.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> 200+ Languages</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> 24/7 Availability</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Pay Per Minute</li>
                            </ul>
                            <Link to="/request" className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700">
                                Start Call <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        {/* Service Card 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-900/5 transition-all group">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Translation</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Precise document localization and technical translation services. We handle everything from legal contracts and medical records to website globalization.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Certified Translations</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Fast Turnaround</li>
                                <li className="flex items-center text-sm text-slate-500"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Technical Accuracy</li>
                            </ul>
                            <Link to="/request?service=translation" className="inline-flex items-center text-purple-600 font-bold hover:text-purple-700">
                                Get Quote <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Why Global Organisations Choose Lingland</h2>
                        <p className="text-slate-500 text-lg">We combine human expertise with technology to deliver consistency at scale.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Certified Quality</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Every professional undergoes rigorous vetting. We hold ISO 9001 and ISO 17100 certifications for language services.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Availability</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Our global operations center never sleeps. Request support or manage bookings at any time, day or night.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Data Security</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Bank-grade encryption and GDPR compliance ensure your sensitive legal and medical data remains protected.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Strip */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl text-center">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-8">
                                Ready to break the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">language barrier?</span>
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/request" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-50 transition-all shadow-xl shadow-black/20 transform hover:scale-105 group flex items-center justify-center">
                                    Book a Service Now
                                </Link>
                                <button className="w-full sm:w-auto px-10 py-4 border-2 border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer (Simplified) */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Globe2 size={24} className="text-blue-500" />
                        <span className="text-xl font-bold text-white">Lingland</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Lingland Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};
