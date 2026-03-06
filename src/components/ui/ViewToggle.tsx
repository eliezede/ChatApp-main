import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
    view: 'grid' | 'list';
    onChange: (view: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
    return (
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
                onClick={() => onChange('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${view === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <LayoutGrid size={16} />
                <span className="uppercase tracking-widest text-[10px]">Cards</span>
            </button>
            <button
                onClick={() => onChange('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${view === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <List size={16} />
                <span className="uppercase tracking-widest text-[10px]">List</span>
            </button>
        </div>
    );
};
