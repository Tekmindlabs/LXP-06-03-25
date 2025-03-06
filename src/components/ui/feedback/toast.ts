'use client';

import { toast as sonnerToast, Toaster as ToastProvider } from 'sonner';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const toast = ({
  title,
  description,
  variant = 'default',
  duration = 5000,
}: ToastOptions) => {
  const toastFn = {
    default: sonnerToast,
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
  }[variant];

  toastFn(title, {
    description,
    duration,
  });
};

export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (message: string) => toast({ title: message, variant: 'error' }),
    success: (message: string) => toast({ title: message, variant: 'success' }),
    warning: (message: string) => toast({ title: message, variant: 'warning' }),
    info: (message: string) => toast({ title: message, variant: 'info' }),
  };
};

export { ToastProvider };
export type { ToastOptions };
