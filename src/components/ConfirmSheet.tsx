import React from 'react';
import { X } from 'lucide-react';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#242422] p-6 shadow-xl border-t sm:border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7a7a74] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#5c5c56] dark:text-[#a8a8a0]">
          {description}
        </p>
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer ${
              variant === 'danger'
                ? 'bg-[#b91c1c] text-white dark:bg-red-600'
                : 'bg-[#1a1a18] text-white dark:bg-[#f0efe8] dark:text-[#1a1a18]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
