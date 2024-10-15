import { useState } from 'react';
import { Toast } from './Toast';

type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setToastProps(props);
    setTimeout(() => setToastProps(null), 3000);
  };

  return { 
    toast: showToast, 
    ToastComponent: toastProps ? <Toast {...toastProps} /> : null
  };
}