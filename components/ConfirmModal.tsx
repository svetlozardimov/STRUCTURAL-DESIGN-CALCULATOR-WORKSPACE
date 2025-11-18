
import React from 'react';
import Button from './common/Button';
import { AlertIcon } from './icons';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-bunker-900 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 border border-bunker-100 dark:border-bunker-700">
        <div className="flex items-center gap-3 mb-4 text-amber-500 dark:text-amber-400">
            <AlertIcon className="w-8 h-8" />
            <h3 className="text-xl font-bold text-bunker-800 dark:text-bunker-100">Потвърждение</h3>
        </div>
        
        <p className="text-bunker-600 dark:text-bunker-300 mb-8 text-base leading-relaxed">
            {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="min-w-[100px]">
            Отказ
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
                onConfirm();
                onClose();
            }}
            className="min-w-[100px]"
          >
            Потвърди
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
