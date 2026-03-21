import React, { useState, useEffect } from 'react';
import { Mail, Edit2, Save, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../context/ToastContext';
import { EmailTemplate, EMAIL_VARIABLES, BookingStatus } from '../../../types';
import { EmailService } from '../../../services/emailService';

export const AdminEmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({'BOOKINGS': true});
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [testRecipient, setTestRecipient] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        const data = await EmailService.getTemplates();
        setTemplates(data);
        setLoading(false);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate({ ...template });
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        try {
            await EmailService.saveTemplate(editingTemplate);
            showToast('Template saved successfully', 'success');
            setEditingTemplate(null);
            fetchTemplates();
        } catch (error) {
            showToast('Failed to save template', 'error');
        }
    };

    const handleSendTest = async () => {
        if (!editingTemplate || !testRecipient) {
            showToast('Please enter a recipient email', 'info');
            return;
        }
        setSendingTest(true);
        try {
            await EmailService.sendTestEmail(editingTemplate, testRecipient);
            showToast('Test email queued. Check "mail" logs.', 'success');
        } catch (error) {
            showToast('Failed to send test email', 'error');
        } finally {
            setSendingTest(false);
        }
    };

    const insertVariable = (variable: string) => {
        if (!editingTemplate) return;

        // Simplistic insertion at the end, but in a real app, this would use cursor position
        const inputElement = document.getElementById('bodyTextarea') as HTMLTextAreaElement;
        if (inputElement) {
            const start = inputElement.selectionStart;
            const end = inputElement.selectionEnd;
            const currentBody = editingTemplate.body;
            const newBody = currentBody.substring(0, start) + variable + currentBody.substring(end);
            setEditingTemplate({ ...editingTemplate, body: newBody });

            // Reset cursor focus
            setTimeout(() => {
                inputElement.focus();
                inputElement.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        } else {
            setEditingTemplate({ ...editingTemplate, body: editingTemplate.body + ' ' + variable });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Templates</h1>
                    <p className="text-slate-500 mt-1">Manage automated communications sent to clients, interpreters, and applicants.</p>
                </div>
            </div>

            <div className="space-y-10">
                {Object.entries(
                    templates.reduce((acc, template) => {
                        const cat = template.category || 'UNCATEGORIZED';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(template);
                        return acc;
                    }, {} as Record<string, EmailTemplate[]>)
                ).map(([category, catTemplates]) => {
                    const isExpanded = expandedCategories[category];
                    return (
                        <div key={category} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 capitalize">
                                    {category.toLowerCase()} Templates
                                </h2>
                                <div className="text-slate-400">
                                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </button>
                            
                            {isExpanded && (
                                <div className="p-6 bg-white dark:bg-slate-900">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {catTemplates.map(template => (
                                            <Card key={template.id} className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col hover:border-blue-500 transition-colors cursor-pointer" onClick={() => handleEdit(template)}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                                                            <Mail size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                                                            <div className="text-xs font-semibold text-slate-500 mt-0.5">Triggers on: {template.triggerStatus}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={template.recipientType === 'CLIENT' ? 'info' : template.recipientType === 'INTERPRETER' ? 'warning' : 'neutral'}>
                                                            TO: {template.recipientType}
                                                        </Badge>
                                                        {template.isActive ? (
                                                            <Badge variant="success">Active</Badge>
                                                        ) : (
                                                            <Badge variant="neutral">Disabled</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        <strong>Subj:</strong> {template.subject}
                                                    </p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {editingTemplate && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto animate-slide-in-right shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 size={20} className="text-blue-500" />
                                Edit Template
                            </h2>
                            <button
                                onClick={() => setEditingTemplate(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Template Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingTemplate.name}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editingTemplate.category || 'BOOKINGS'}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="BOOKINGS">Bookings</option>
                                        <option value="APPLICATIONS">Applications</option>
                                        <option value="INVOICING">Invoicing</option>
                                        <option value="SYSTEM">System</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Recipient Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editingTemplate.recipientType}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, recipientType: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="CLIENT">Client</option>
                                        <option value="INTERPRETER">Interpreter</option>
                                        <option value="APPLICANT">Applicant</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingTemplate.subject}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <label>
                                        Message Body <span className="text-red-500">*</span>
                                    </label>

                                    {/* Variable Inserter Dropdown - Simplified for mock */}
                                    <div className="relative group">
                                        <button className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                            <Plus size={14} /> Insert Variable
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 hidden group-hover:block z-50 h-48 overflow-y-auto">
                                            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2 px-2">Click to insert</div>
                                            {editingTemplate.allowedVariables.map(v => (
                                                <div
                                                    key={v}
                                                    onClick={() => insertVariable(v)}
                                                    className="px-2 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 rounded mb-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600"
                                                >
                                                    {v}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 mb-2">Use markdown or HTML for text formatting: **bold**, `_italics_`, `&lt;br&gt;`.</p>
                                <textarea
                                    id="bodyTextarea"
                                    value={editingTemplate.body}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                    rows={15}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingTemplate.isActive}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
                                />
                                <label htmlFor="isActive" className="font-medium text-slate-900 dark:text-white cursor-pointer select-none">
                                    Template is Active
                                </label>
                            </div>

                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-4 sticky bottom-0">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        placeholder="test-email@example.com"
                                        value={testRecipient}
                                        onChange={(e) => setTestRecipient(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <Button
                                    onClick={handleSendTest}
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2 whitespace-nowrap"
                                    disabled={sendingTest}
                                >
                                    {sendingTest ? <Spinner size="sm" /> : <Mail size={16} />}
                                    Send Test
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={() => setEditingTemplate(null)} variant="secondary" className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Save size={18} />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
