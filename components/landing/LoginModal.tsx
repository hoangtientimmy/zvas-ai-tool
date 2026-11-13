import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { shuffledSamples } from '../../lib/sampleImages';
import { X } from 'lucide-react';
import { resolveLoginEmail } from '../../utils/authCredentials';
import { useLoginContactText } from '../../hooks/usePublicSettings';

/** Tỉ lệ khung cho 3 cột ảnh (ảnh lấy ngẫu nhiên từ ảnh mẫu nội bộ). */
const GALLERY_RATIOS: string[][] = [
  ['aspect-[3/4]', 'aspect-[3/4]', 'aspect-square', 'aspect-[3/4]'],
  ['aspect-square', 'aspect-[3/4]', 'aspect-[3/4]', 'aspect-[6/5]'],
  ['aspect-[6/5]', 'aspect-[3/4]', 'aspect-[3/4]', 'aspect-square'],
];

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  loginError?: string | null;
  isLoggingIn?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  onLogin,
  loginError,
  isLoggingIn,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const contactText = useLoginContactText(open);
  // Xáo lại mỗi lần mở modal.
  const gallery = useMemo(() => {
    const pics = shuffledSamples(12);
    return GALLERY_RATIOS.map((col, ci) => col.map((ratio, ti) => ({ ratio, src: pics[ci * 4 + ti] })));
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void onLogin(resolveLoginEmail(username), password);
    },
    [username, password, onLogin],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = username.trim().length > 0 && password.length > 0 && !isLoggingIn;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-[62rem] md:h-[min(44rem,calc(100dvh-3rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] md:grid-cols-[1fr_1fr]"
      >
        {/* Lưới ảnh mẫu — 3 cột chạy chậm ngược chiều nhau */}
        <div className="relative hidden overflow-hidden py-0 pl-3 md:block" aria-hidden>
          <div className="grid h-full grid-cols-3 gap-2.5">
            {gallery.map((col, ci) => (
              <div key={ci} className="relative overflow-hidden">
                <div className={`flex flex-col gap-2.5 ${ci === 1 ? 'mg-gallery-down' : 'mg-gallery-up'}`}>
                  {[...col, ...col].map((tile, ti) => (
                    <div key={ti} className={`overflow-hidden rounded-2xl ${tile.ratio}`}>
                      <img
                        src={tile.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#121212] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#121212] to-transparent" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/90 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" strokeWidth={2.25} />
        </button>

        <div className="flex min-h-0 flex-col justify-center overflow-y-auto px-6 py-14 sm:px-10 lg:px-12">
          <h2
            id="login-title"
            className="font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.03em] text-white lg:text-[2.75rem]"
          >
            Sẵn sàng sáng tạo?
          </h2>
          <p className="mt-4 max-w-[26rem] text-base leading-[1.6] text-[var(--lp-muted)] sm:text-[17px]">
            Gemini, OpenAI và Seedance trong một studio. Workflow cho team marketing và design, có phân quyền và analytics.
          </p>

          {loginError && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-500/35 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-50/95"
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <label htmlFor="login-username" className="sr-only">
              Tên đăng nhập
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              required
              disabled={isLoggingIn}
              autoFocus
              className="h-12 w-full rounded-xl border border-white/15 bg-transparent px-4 text-base text-white placeholder:text-[#8a8a8a] outline-none transition focus:border-white/40 disabled:opacity-50"
            />
            <label htmlFor="login-password" className="sr-only">
              Mật khẩu
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              disabled={isLoggingIn}
              className="h-12 w-full rounded-xl border border-white/15 bg-transparent px-4 text-base text-white placeholder:text-[#8a8a8a] outline-none transition focus:border-white/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition ${
                canSubmit ? 'mg-btn-primary' : 'cursor-not-allowed bg-white/[0.06] text-[#8a8a8a]'
              }`}
            >
              {isLoggingIn ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-8 whitespace-pre-line text-[15px] text-[var(--lp-muted)]">
            Chưa có tài khoản? <span className="font-semibold text-white">Liên hệ quản trị để được cấp</span>
            {contactText ? `\n${contactText}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
