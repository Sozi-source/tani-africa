import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showConfirmButton?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showConfirmButton = false,
  confirmText = 'Confirm',
  onConfirm,
  showCancelButton = true,
  cancelText = 'Cancel',
  size = 'md',
  isLoading = false,
  confirmDisabled = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all"
      onClick={handleBackdropClick}
    >
      <div
        className={twMerge(
          'w-full rounded-xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200',
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-maroon-50 to-white rounded-t-xl">
            <h3 className="text-lg font-semibold text-maroon-800">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-maroon-100 hover:text-maroon-600"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          {showCancelButton && (
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          {showConfirmButton && onConfirm && (
            <Button 
              variant="primary" 
              onClick={onConfirm} 
              loading={isLoading}
              disabled={confirmDisabled || isLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};