import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, Globe, Users, Briefcase, FileText, Settings, ArrowRight, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    shortcut?: string;
    category: 'Navigation' | 'Actions' | 'Recent';
    onSelect: () => void;
}

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const commands: CommandItem[] = [
        { id: '1', title: 'Jobs Board', subtitle: 'View operational workforce', icon: Briefcase, category: 'Navigation', onSelect: () => navigate('/admin/bookings') },
        { id: '2', title: 'Assignment Center', subtitle: 'Allocate interpreters', icon: Users, category: 'Navigation', onSelect: () => navigate('/admin/operations/assignments') },
        { id: '3', title: 'Document Center', subtitle: 'Finance and Invoicing', icon: FileText, category: 'Navigation', onSelect: () => navigate('/admin/finance/documents') },
        { id: '4', title: 'Create New Booking', subtitle: 'Launch booking wizard', icon: Zap, shortcut: 'N', category: 'Actions', onSelect: () => navigate('/admin/bookings/new') },
        { id: '5', title: 'System Data Hub', subtitle: 'Administration tasks', icon: Shield, category: 'Navigation', onSelect: () => navigate('/admin/administration/data') },
        { id: '6', title: 'User Settings', subtitle: 'Preferences & Profiles', icon: Settings, category: 'Navigation', onSelect: () => navigate('/admin/settings') },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === '/' && !isOpen) {
            const activeElement = document.activeElement;
            if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                setIsOpen(true);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-950/40 border border-slate-200 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Search Input Area */}
                <div className="flex items-center px-6 py-5 border-b border-slate-100 dark:border-white/5">
                    <Search className="text-slate-400 mr-4" size={20} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search for pages, actions, or records (Jobs, Clients...)"
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-base font-medium placeholder:text-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Esc</span>
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-6">
                            {['Actions', 'Navigation'].map(cat => {
                                const catItems = filteredCommands.filter(i => i.category === cat);
                                if (catItems.length === 0) return null;
                                return (
                                    <div key={cat} className="space-y-2">
                                        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat}</h3>
                                        <div className="grid grid-cols-1 gap-1">
                                            {catItems.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => { item.onSelect(); setIsOpen(false); }}
                                                    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                                                            <item.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.title}</p>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                                                        </div>
                                                    </div>
                                                    {item.shortcut && (
                                                        <div className="flex items-center space-x-1 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase">{item.shortcut}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={24} />
                            </div>
                            <p className="text-sm text-slate-400 font-medium italic">No results found for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Guide */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-white/10 rounded text-[10px] font-black text-slate-400 bg-white dark:bg-transparent">↵</div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Select</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-white/10 rounded text-[10px] font-black text-slate-400 bg-white dark:bg-transparent">↑↓</div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Navigate</span>
                        </div>
                    </div>
                    <div className="flex items-center text-blue-600 space-x-1.5 cursor-pointer hover:underline decoration-blue-200">
                        <Zap size={12} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Lingland Intelligence v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
