"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  helperText?: string;
  confirmLabel: string;
  confirmColor?: 'red' | 'orange';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  tone?: 'danger' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  helperText,
  confirmLabel,
  confirmColor = 'red',
  onConfirm,
  onCancel,
  loading,
  tone = 'danger',
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    cancelButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmClasses =
    confirmColor === 'orange'
      ? 'bg-orange-500 hover:bg-orange-600'
      : 'bg-[#F40009] hover:bg-red-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" role="dialog" aria-modal="true">
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              tone === 'warning' ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-600'
            }`}
          >
            <span className="text-3xl">{tone === 'warning' ? '!' : '⚠️'}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 whitespace-pre-line">{description}</p>
          {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>

        <div className="flex items-center justify-center space-x-3 mt-8">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {tone === 'warning' ? 'Cancelar' : 'No, Cancelar'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white font-semibold ${confirmClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}