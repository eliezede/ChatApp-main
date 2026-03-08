import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatService } from '../../services/chatService';
import { StorageService } from '../../services/api';
import { ChatThread, ChatMessage } from '../../types';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Search, Send, MessageSquare, Hash, FileIcon, ImageIcon, Paperclip, Check, ChevronLeft } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';

export const InterpreterMessages = () => {
    const { user } = useAuth();
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        return ChatService.subscribeToThreads(user.id, (data) => {
            setThreads(data);
            setLoading(false);
        });
    }, [user]);

    useEffect(() => {
        if (!activeThreadId) return;
        const unsubscribe = ChatService.subscribeToMessages(activeThreadId, setMessages);
        return () => unsubscribe();
    }, [activeThreadId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeThreadId || !user) return;

        const thread = threads.find(t => t.id === activeThreadId);
        const recipientId = thread?.participants.find(p => p !== user.id) || '';

        const text = inputText;
        setInputText('');

        await ChatService.sendMessage(
            activeThreadId,
            user.id,
            user.displayName || 'Interpreter',
            text,
            recipientId
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeThreadId || !user) return;

        setIsUploading(true);
        try {
            const path = `chats/${activeThreadId}/${Date.now()}_${file.name}`;
            const url = await StorageService.uploadFile(file, path);

            const thread = threads.find(t => t.id === activeThreadId);
            const recipientId = thread?.participants.find(p => p !== user.id) || '';
            const type = file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT';

            await ChatService.sendMessage(
                activeThreadId,
                user.id,
                user.displayName || 'Interpreter',
                '',
                recipientId,
                { url, type }
            );
        } finally {
            setIsUploading(false);
        }
    };

    const filteredThreads = threads.filter(t => {
        const otherParticipantId = t.participants.find(p => p !== user?.id);
        const otherName = t.participantNames[otherParticipantId!] || '';
        return otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const activeThread = threads.find(t => t.id === activeThreadId);

    return (
        <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-50 animate-in fade-in duration-700">
            <PageHeader
                title="Communication Hub"
                subtitle="Manage end-to-end encrypted chats with operations and clients."
            />

            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
                {/* Threads Sidebar */}
                <div className="w-full lg:w-80 flex flex-col bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden shrink-0 h-[600px] lg:h-auto">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search threads..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="py-12 flex justify-center"><Spinner size="md" /></div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                {searchTerm ? 'No matches' : 'No active threads'}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredThreads.map(t => {
                                    const otherParticipantId = t.participants.find(p => p !== user?.id);
                                    const otherName = t.participantNames[otherParticipantId!] || 'Admin';
                                    const isSelected = activeThreadId === t.id;
                                    const unread = t.unreadCount[user?.id!] || 0;

                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                setActiveThreadId(t.id);
                                                if (user) ChatService.resetUnread(t.id, user.id);
                                            }}
                                            className={`p-4 cursor-pointer transition-all group flex gap-3 ${isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 shadow-sm shrink-0">
                                                {otherName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={`text-xs truncate font-black ${isSelected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                                                        {otherName}
                                                    </p>
                                                    {unread > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">{unread}</span>}
                                                </div>
                                                {t.bookingId && (
                                                    <div className="flex items-center text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">
                                                        <Hash size={8} className="mr-0.5" /> REF: {t.bookingId.replace('booking-', '')}
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-bold text-slate-500 truncate">{t.lastMessage || 'New session'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden h-[600px] lg:h-auto">
                    {activeThreadId ? (
                        <>
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-black shadow-sm">
                                        {activeThread?.participantNames[activeThread.participants.find(p => p !== user?.id)!]?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">
                                            {activeThread?.participantNames[activeThread.participants.find(p => p !== user?.id)!]}
                                        </h3>
                                        <div className="flex items-center text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shadow-sm shadow-emerald-500/50"></div>
                                            Encrypted Session
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-slate-50/30">
                                {messages.map((m, idx) => {
                                    const isMe = m.senderId === user?.id;
                                    const nextMessage = messages[idx + 1];
                                    const isLastInGroup = !nextMessage || nextMessage.senderId !== m.senderId;

                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md font-medium ${isMe
                                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                                        : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                                                    }`}>
                                                    {m.fileUrl && (
                                                        <div className="mb-2">
                                                            {m.fileType === 'IMAGE' ? (
                                                                <img src={m.fileUrl} alt="attachment" className="rounded-xl max-w-full h-auto cursor-pointer border border-white/20 shadow-sm" onClick={() => window.open(m.fileUrl, '_blank')} />
                                                            ) : (
                                                                <a href={m.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center p-2.5 rounded-xl text-xs font-bold ${isMe ? 'bg-black/10 hover:bg-black/20 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                                                    <FileIcon size={14} className="mr-2" /> View Attachment
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {m.text && <p className="leading-relaxed">{m.text}</p>}
                                                </div>
                                                {isLastInGroup && (
                                                    <div className={`flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400`}>
                                                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && <Check size={10} className="text-blue-500" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50 shrink-0 border border-slate-200 shadow-sm"
                                    >
                                        <Paperclip size={18} />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        placeholder={isUploading ? "Uploading..." : "Type your transmission..."}
                                        disabled={isUploading}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || isUploading}
                                        className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                                    >
                                        <Send size={16} className="-ml-1" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                                <MessageSquare size={24} className="text-slate-300" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Comms Center</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">Select an active thread from the sidebar to coordinate with the operations team.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
