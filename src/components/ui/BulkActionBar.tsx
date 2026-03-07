import React from 'react';
import { X, CheckCircle, XCircle, Trash2, UserMinus, UserPlus, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export interface BulkAction {
    label: string;
    icon?: React.ElementType;
    onClick: (ids: string[]) => void;
    variant?: 'default' | 'danger' | 'warning' | 'success';
    disabled?: boolean;
}

interface BulkActionBarProps {
    selectedCount: number;
    totalCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
    onSelectAll?: () => void;
    isLoading?: boolean;
    entityLabel?: string;
}

const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
};

/**
 * BulkActionBar — Phase 5 Table System
 * Floats above the table when rows are selected.
 * Provides fast batch operations with visual feedback.
 */
export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    totalCount,
    actions,
    onClearSelection,
    onSelectAll,
    isLoading,
    entityLabel = 'item',
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-700">
                {/* Selection info */}
                <div className="flex items-center gap-2.5 pr-3 border-r border-slate-700">
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-[11px] font-black">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-bold text-white/90">
                        {selectedCount} {entityLabel}{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                    {onSelectAll && selectedCount < totalCount && (
                        <button
                            onClick={onSelectAll}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors underline underline-offset-2"
                        >
                            Select all {totalCount}
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => action.onClick([])} // IDs passed externally
                                disabled={action.disabled || isLoading}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[action.variant || 'default']}`}
                            >
                                {Icon && <Icon size={13} />}
                                {action.label}
                            </button>
                        );
                    })}
                </div>

                {/* Clear */}
                <button
                    onClick={onClearSelection}
                    className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Clear selection"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
