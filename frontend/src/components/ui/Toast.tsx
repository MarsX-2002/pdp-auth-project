import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const toastColors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
};

const Toast: React.FC<ToastProps> = ({
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg',
        'transition-all duration-300 ease-in-out',
        toastColors[type],
        'border-2 animate-slide-in-right'
      )}
    >
      <span className="mr-2 text-xl">{toastIcons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Toast Manager Component
interface ToastManagerProps {
  messages: Array<{
    id: string;
    message: string;
    type?: ToastType;
  }>;
  onRemove: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ 
  messages, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {messages.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: ToastType;
  }>>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast
  };
};

export default Toast;
