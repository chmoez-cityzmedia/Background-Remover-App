import React from 'react';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const Toast: React.FC<ToastProps> = ({ title, description, variant = 'default' }) => (
  <div className={`fixed bottom-4 right-4 p-4 rounded-md ${variant === 'destructive' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
    <h3 className="font-bold">{title}</h3>
    <p>{description}</p>
  </div>
);