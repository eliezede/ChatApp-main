import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: 'white' | 'blue' | 'slate' | 'emerald' | 'indigo' | 'amber';
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  variant = 'white',
  className = ''
}) => {
  const variants = {
    white: {
      card: "bg-white border-slate-200 text-slate-600",
      icon: "bg-blue-50 text-blue-600",
      title: "text-slate-900",
      text: "text-slate-500"
    },
    blue: {
      card: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl border-blue-500",
      icon: "bg-white/20 text-white",
      title: "text-white",
      text: "text-blue-50"
    },
    slate: {
      card: "bg-slate-50 border-slate-200 text-slate-600",
      icon: "bg-slate-200 text-slate-600",
      title: "text-slate-900",
      text: "text-slate-500"
    },
    emerald: {
      card: "bg-emerald-50 border-emerald-100 text-emerald-700",
      icon: "bg-emerald-100 text-emerald-600",
      title: "text-emerald-900",
      text: "text-emerald-700"
    },
    indigo: {
      card: "bg-indigo-50 border-indigo-100 text-indigo-700",
      icon: "bg-indigo-100 text-indigo-600",
      title: "text-indigo-900",
      text: "text-indigo-700"
    },
    amber: {
      card: "bg-amber-50 border-amber-100 text-amber-700",
      icon: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      text: "text-amber-700"
    }
  };

  const current = variants[variant] || variants.white;

  return (
    <div className={`rounded-2xl p-6 border ${current.card} ${className} relative overflow-hidden`}>
      {variant === 'blue' && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      )}
      
      <div className="flex items-center mb-4 relative z-10">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${current.icon}`}>
            <Icon size={18} />
          </div>
        )}
        <h3 className={`font-bold ${current.title}`}>{title}</h3>
      </div>
      
      <div className={`text-sm space-y-3 relative z-10 ${current.text}`}>
        {children}
      </div>
    </div>
  );
};
