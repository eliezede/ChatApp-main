import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Globe2, CheckCircle2, ArrowRight, ShieldCheck,
    Clock, MapPin, Video, Phone, FileText, ChevronRight,
    MessageSquare, Star, Users, Menu, X
} from 'lucide-react';

export const ServicesPage = () => {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between transition-all">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Globe2 size={24} />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">Lingland</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Home</Link>
                        <Link to="/services" className="text-sm font-bold text-blue-600">Services</Link>
                        <Link to="/interpreters" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Interpreters</Link>
                        <Link to="/why-us" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Why Us</Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <Link
                                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'CLIENT' ? '/client/dashboard' : '/interpreter/dashboard'}
                                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black hover:shadow-lg transition-all"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Log in</Link>
                                    <Link to="/request" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 hover:shadow-lg transition-all">
                                        Book Now
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
                        <Link to="/" className="block px-4 py-2 text-base font-bold text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link to="/services" className="block px-4 py-2 text-base font-bold text-blue-600 bg-blue-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                        <Link to="/interpreters" className="block px-4 py-2 text-base font-bold text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Interpreters</Link>
                        <Link to="/why-us" className="block px-4 py-2 text-base font-bold text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Why Us</Link>
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            {user ? (
                                <Link
                                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'CLIENT' ? '/client/dashboard' : '/interpreter/dashboard'}
                                    className="block w-full text-center py-3 bg-slate-900 text-white font-bold rounded-xl"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="block w-full text-center py-3 text-base font-bold text-slate-900" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                                    <Link to="/request" className="block w-full text-center py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32 lg:pt-32 lg:pb-48">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900"></div>
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in">
                        Global Language Solutions
                    </span>
                    <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        Breaking barriers with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">precision and speed</span>.
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Expert interpretation and translation services powered by certified professionals and enterprise-grade technology.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:shadow-blue-600/25 shadow-xl transition-all flex items-center justify-center group">
                            Get a Free Quote <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#services" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center">
                            Explore Services
                        </a>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section id="services" className="relative z-20 -mt-20 px-4 lg:px-8 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                        {/* Service Card 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group">
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
                            <Link to="/request" className="inline-flex items-center text-purple-600 font-bold hover:text-purple-700">
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
            <section className="py-20 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-8">Ready to break the language barrier?</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 shadow-xl transition-all">
                            Book a Service Now
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                            Contact Sales
                        </button>
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
