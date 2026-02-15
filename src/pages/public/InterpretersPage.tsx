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

const InterpretersPage = () => {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-200">
            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center cursor-pointer group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                                <Globe2 size={22} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white transition-colors">Lingland</span>
                        </Link>

                        <div className="hidden md:flex space-x-1 items-center">
                            <Link to="/why-us" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors">Why Us</Link>
                            <Link to="/services" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors">Services</Link>
                            <Link to="/interpreters" className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-white/10">Interpreters</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <Link
                                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'CLIENT' ? '/client/dashboard' : '/interpreter/dashboard'}
                                    className="px-6 py-2.5 text-sm font-bold rounded-full bg-white text-blue-900 hover:bg-blue-50 transition-all shadow-lg"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-white hover:text-blue-200 transition-colors">Log in</Link>
                                    <Link to="/request" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30">Book Interpreter</Link>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-white/5 p-4 space-y-4 shadow-2xl animate-in slide-in-from-top duration-300">
                        <Link to="/why-us" className="block px-4 py-2 text-base font-bold text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Why Us</Link>
                        <Link to="/services" className="block px-4 py-2 text-base font-bold text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                        <Link to="/interpreters" className="block px-4 py-2 text-base font-bold text-white bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Interpreters</Link>
                        <div className="pt-4 border-t border-white/5 space-y-4">
                            {user ? (
                                <Link
                                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'CLIENT' ? '/client/dashboard' : '/interpreter/dashboard'}
                                    className="block w-full text-center py-3 bg-white text-blue-900 font-bold rounded-xl"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="block w-full text-center py-3 text-base font-bold text-white" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                                    <Link to="/request" className="block w-full text-center py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0,transparent_70%)] pointer-events-none"></div>
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
                        <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center group transform hover:scale-105">
                            Book a Service Now <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/apply" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center">
                            Work with Lingland
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- QUALITY & STANDARDS --- */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">Our Quality Standards</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">We maintain the highest level of service through rigorous vetting and continuous monitoring.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all group">
                                <div className={`w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- HYBRID SECTION --- */}
            <section className="py-24 bg-white/5 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* For Clients */}
                        <div className="space-y-8">
                            <div className="inline-block px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest">For Clients</div>
                            <h2 className="text-4xl font-black text-white">Trust your most critical <span className="text-blue-400">conversations</span> to us.</h2>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Our interpreters are not just linguists; they are subject matter experts. From courtroom proceedings to medical consultations, we ensure every word is conveyed with absolute precision.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-slate-300">
                                    <CheckCircle2 size={20} className="text-blue-500" />
                                    <span className="font-bold">24/7 Global Availability</span>
                                </div>
                                <div className="flex items-center space-x-3 text-slate-300">
                                    <CheckCircle2 size={20} className="text-blue-500" />
                                    <span className="font-bold">Industry Specific Expertise</span>
                                </div>
                                <div className="flex items-center space-x-3 text-slate-300">
                                    <CheckCircle2 size={20} className="text-blue-500" />
                                    <span className="font-bold">Enterprise APIs & Portal</span>
                                </div>
                            </div>
                            <Link to="/request" className="inline-flex items-center text-blue-400 font-bold hover:text-blue-300 group">
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
                                <Link to="/apply" className="block w-full text-center py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20 group">
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
