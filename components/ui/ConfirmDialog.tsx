import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger: nút xác nhận màu đỏ (thao tác xóa) */
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog xác nhận dùng chung (thay window.confirm). Esc hoặc bấm nền để hủy;
 * focus mặc định vào nút Hủy để Enter không vô tình xác nhận thao tác xóa.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="w-full max-w-[26rem] rounded-[20px] border border-white/10 bg-[var(--lp-surface)] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-start gap-4">
          {tone === 'danger' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-300">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0 pt-0.5">
            <h2 id={titleId} className="font-display text-lg font-bold text-white">
              {title}
            </h2>
            {description && (
              <div id={descId} className="mt-2 text-sm leading-relaxed text-[var(--lp-muted)]">
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-10 bg-white/[0.06] px-4 text-sm font-medium text-white transition hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              tone === 'danger'
                ? 'h-10 bg-[#e5484d] px-4 text-sm font-medium text-white transition hover:bg-[#ec5d62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300'
                : 'mg-btn-primary h-10 px-4 text-sm'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
