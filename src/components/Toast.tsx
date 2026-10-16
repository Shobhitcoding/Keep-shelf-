import React, { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform translate-y-0 opacity-100 ${
            toast.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : toast.type === 'info'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-stone-900 text-stone-50 border-stone-800'
          }`}
        >
          <span>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-3 text-stone-400 hover:text-stone-200 text-xs px-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
