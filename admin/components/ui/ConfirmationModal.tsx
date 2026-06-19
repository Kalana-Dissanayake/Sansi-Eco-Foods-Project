'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const colors = {
    warning: {
      btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
      icon: '⚠️',
      iconBg: 'bg-amber-50 text-amber-500',
    },
    danger: {
      btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: '🚨',
      iconBg: 'bg-red-50 text-red-600',
    },
    info: {
      btn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      icon: 'ℹ️',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  };

  const theme = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${theme.iconBg}`}>
            {theme.icon}
          </div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btn}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
