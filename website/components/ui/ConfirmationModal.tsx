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

  const typeColors = {
    warning: {
      btnClass: 'btn-secondary',
      icon: '⚠️',
    },
    danger: {
      btnClass: 'btn-danger',
      icon: '🚨',
    },
    info: {
      btnClass: 'btn-primary',
      icon: 'ℹ️',
    },
  };

  const currentType = typeColors[type];

  return (
    <div
      className="position-fixed inset-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        top: 0,
        left: 0,
      }}
    >
      <div
        className="bg-white p-4 rounded-3 shadow-lg m-3 animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--gray-200)' }}
      >
        <div className="d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: '24px' }}>{currentType.icon}</span>
          <h5 className="m-0 text-dark" style={{ fontWeight: 700 }}>{title}</h5>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {message}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light px-4"
            style={{ borderRadius: '20px', fontWeight: 600, fontSize: '14px' }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${currentType.btnClass} px-4`}
            style={{ borderRadius: '20px', fontWeight: 700, fontSize: '14px' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
