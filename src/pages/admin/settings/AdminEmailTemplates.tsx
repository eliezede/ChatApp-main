import React, { useState, useEffect } from 'react';
import { Mail, Edit2, Save, X, Plus } from 'lucide-react';
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
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
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
                    <p className="text-slate-500 mt-1">Manage automated communications sent to clients and interpreters.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
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
                                <Badge variant={template.recipientType === 'CLIENT' ? 'info' : 'warning'}>
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

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex gap-3 sticky bottom-0">
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
            )}
        </div>
    );
};
