import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmOptions) => {
    setOptions(confirmOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveRef) resolveRef(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveRef) resolveRef(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={options?.title || 'Confirm Action'}
        maxWidth="sm"
      >
        <div className="p-1 space-y-6">
          <div className="flex items-start gap-4">
             <div className={`p-3 rounded-2xl shrink-0 ${
               options?.variant === 'danger' ? 'bg-red-50 text-red-500 shadow-sm' : 
               options?.variant === 'warning' ? 'bg-amber-50 text-amber-500 shadow-sm' : 
               'bg-blue-50 text-blue-500 shadow-sm'
             }`}>
               {options?.variant === 'danger' ? <AlertCircle size={24} /> : <HelpCircle size={24} />}
             </div>
             <div className="flex-1">
               <p className="text-sm font-semibold text-slate-600 leading-relaxed pt-1">
                 {options?.message}
               </p>
             </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={handleCancel} className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {options?.cancelLabel || 'Cancel'}
            </Button>
            <Button 
              variant={options?.variant === 'danger' ? 'danger' : 'primary'} 
              onClick={handleConfirm}
              className={`px-6 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                options?.variant === 'danger' ? 'shadow-red-500/20' : 'shadow-blue-500/20'
              }`}
            >
              {options?.confirmLabel || 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
