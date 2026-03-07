import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'modal' | 'drawer' | 'wizard';
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  // Wizard specific
  steps?: { title: string; active: boolean }[];
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  type = 'modal',
  children,
  footer,
  maxWidth = 'md',
  steps,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  isLoading
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock scroll for modal/wizard, but maybe not for drawer as per spec?
  // Spec says: "Does NOT block background scrolling" for Drawers.
  useEffect(() => {
    if (isOpen && type !== 'drawer') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, type]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  if (type === 'drawer') {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-auto"
          onClick={onClose}
        />
        <div
          className="absolute right-0 top-0 h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 pointer-events-auto flex flex-col"
          style={{ width: '35vw', minWidth: '420px', maxWidth: '720px' }}
        >
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {children}
          </div>

          {/* Drawer Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'wizard') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Wizard Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
              {steps && (
                <div className="flex items-center space-x-2">
                  {steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <div className={`flex items-center space-x-2 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step.active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{step.title}</span>
                      </div>
                      {i < steps.length - 1 && <div className="w-4 h-[1px] bg-slate-200 dark:bg-slate-800" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Wizard Content */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="w-full max-w-4xl animate-fade-in">
              {children}
            </div>
          </div>

          {/* Wizard Footer */}
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky bottom-0 z-10">
            <button
              onClick={onBack}
              disabled={!onBack || isLoading}
              className="flex items-center px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} className="mr-1" />
              {backLabel}
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={onNext}
                disabled={!onNext || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : nextLabel}
                {!isLoading && <ChevronRight size={18} className="ml-2" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          className={`inline-block align-bottom bg-white dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full border border-slate-200 dark:border-slate-800 ${maxWidthClasses[maxWidth]} animate-in zoom-in-95 duration-200`}
        >
          <div className="px-6 pt-6 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              {children}
            </div>
          </div>

          {footer && (
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-100 dark:border-slate-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};