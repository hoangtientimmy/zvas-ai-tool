import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AiSparkIcon } from '../icons/AiSparkIcon';
import { HERO_IMAGE, shuffledSamples } from '../../lib/sampleImages';
import {
  ArrowRight,
  BarChart3,
  Layers,
  LogIn,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface LandingPageProps {
  onLoginClick: () => void;
  sessionNotice?: string | null;
}

/*
 * Phong cách Magnific: nền #101010, panel #1a1a1a, accent xanh #4f69f2 cho nút chính.
 * Shape system (locked):
 *   pills / buttons / badges  -> rounded-full
 *   cards / panels / images   -> rounded-2xl  (16px)
 *   icon tiles                -> rounded-xl    (12px)
 * Accent (locked): teal (--lp-accent) only. Photographic tiles carry their own
 * colour; no second UI accent anywhere on the page.
 *
 * Imagery: ảnh mẫu nội bộ (lib/sampleImages — thumbnail thư viện style + ảnh OG), xáo ngẫu
 * nhiên mỗi lần tải trang; thay bằng ảnh do studio tạo khi có. (Cũ: picsum placeholders standing in for real generated
 * outputs. Swap the seeds for actual sample renders before launch.
 */

const TRUST_POINTS = [
  {
    icon: Zap,
    label: 'Đa provider',
    detail: 'Gemini, OpenAI và Seedance trong cùng một studio.',
  },
  {
    icon: ShieldCheck,
    label: 'Phân quyền RBAC',
    detail: 'Admin, editor và analytics, đúng vai trò đúng việc.',
  },
  {
    icon: BarChart3,
    label: 'Analytics chi phí',
    detail: 'Theo dõi chi phí và xu hướng dùng thật, không chỉ demo.',
  },
];

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: 'Biến brief thành visual',
    body: 'Từ mô tả ngắn tới bộ biến thể quảng cáo, một luồng làm việc chung cho marketing và design.',
    image: null,
  },
  {
    icon: Layers,
    title: 'Workflow linh hoạt',
    body: 'Text-to-image, chỉnh từ ảnh gốc, tham chiếu style, merge và batch trong cùng một studio.',
    image: null,
  },
  {
    icon: Palette,
    title: 'Style có kiểm soát',
    body: 'Thư viện phong cách cùng tùy chọn nền và viền, giữ output nhất quán với brand.',
    image: null,
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Đăng nhập',
    desc: 'Dùng tài khoản do quản trị cấp để vào đúng không gian làm việc của bạn.',
  },
  {
    n: '2',
    title: 'Tạo trong studio',
    desc: 'Nhập prompt, thêm ảnh gốc và tùy chọn, rồi generate ra các biến thể.',
  },
  {
    n: '3',
    title: 'Đo lường và lặp',
    desc: 'Xem lịch sử cá nhân; admin theo dõi analytics và chi phí theo thời gian thực.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, sessionNotice }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal for below-the-fold sections. Honors reduced motion, cleans up.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.lp-reveal'));
    if (els.length === 0) return;

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const [draftPrompt, setDraftPrompt] = useState('');
  // 9 ảnh dải mẫu + 4 ảnh lưới card lớn + 3 ảnh card Style — xáo mỗi lần tải trang.
  const samples = useMemo(() => shuffledSamples(16), []);

  return (
    <div
      ref={rootRef}
      className="landing-premium relative min-h-[100dvh] overflow-x-hidden bg-[var(--lp-void)] font-sans text-[var(--lp-text)] antialiased"
    >
      {/* Navigation — phẳng, trong suốt trên hero (kiểu Magnific) */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[var(--lp-void)]">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight text-white">AI Image ZVAS</span>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-[var(--lp-text)]/80 transition hover:text-white sm:inline-flex"
            >
              Tính năng
            </a>
            <a
              href="#how"
              className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-[var(--lp-text)]/80 transition hover:text-white sm:inline-flex"
            >
              Cách hoạt động
            </a>
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 text-sm font-medium text-[#1a1a1a] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Đăng nhập
            </button>
          </nav>
        </div>
      </header>

      {/* Hero — ảnh nền full-bleed + lớp tối, nội dung căn giữa */}
      <section className="relative isolate overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-black/65" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[var(--lp-void)]"
          aria-hidden
        />

        <div className="mx-auto flex max-w-[60rem] flex-col items-center px-5 pb-24 pt-28 text-center sm:px-8 sm:pt-32 md:pb-32">
          {sessionNotice ? (
            <div
              role="alert"
              className="mb-6 w-full rounded-2xl border border-amber-500/35 bg-black/60 px-4 py-3 text-left text-sm text-amber-50/95 backdrop-blur"
            >
              {sessionNotice}
            </div>
          ) : null}

          <span className="lp-anim-hero rounded-full bg-[var(--mg-chip)] px-3 py-[7px] text-xs font-semibold uppercase tracking-[0.02em] text-[var(--lp-text)]">
            Studio tạo ảnh AI
          </span>

          <h1 className="lp-anim-hero lp-anim-hero-delay font-display mt-6 max-w-[22ch] text-balance text-[2.25rem] font-bold leading-[1.02] tracking-[-0.025em] text-[#f5f5f5] sm:text-[3.25rem] lg:text-[3.75rem]">
            Hình ảnh thương hiệu, tạo trong vài giây
          </h1>
          <p className="lp-anim-hero lp-anim-hero-delay mt-6 max-w-[40rem] text-pretty text-base leading-[1.55] text-[#f5f5f5]/[0.88] sm:text-lg">
            Gemini, OpenAI và Seedance trong cùng một studio. Tạo ảnh từ prompt, từ ảnh tham chiếu, hoặc cả hai — rồi tiếp tục
            chỉnh sửa, ghép ảnh và tạo hàng loạt ngay trên một trang.
          </p>

          {/* Ô prompt kiểu Magnific — bấm Tạo ảnh để đăng nhập vào studio */}
          <form
            className="lp-anim-panel mt-10 w-full max-w-[40rem] rounded-[20px] border border-white/10 bg-[#1a1a1a] p-4 pb-3 text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            onSubmit={(e) => {
              e.preventDefault();
              onLoginClick();
            }}
          >
            <label htmlFor="landing-prompt" className="sr-only">
              Mô tả hình ảnh bạn muốn tạo
            </label>
            <textarea
              id="landing-prompt"
              rows={3}
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder="Mô tả hình ảnh bạn muốn tạo"
              className="block w-full resize-none bg-transparent px-1.5 py-1 text-base leading-6 text-[#f5f5f5] placeholder:text-[#8a8a8a] focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--lp-muted)]">Cần đăng nhập để tạo ảnh</span>
              <button
                type="submit"
                className="mg-btn-primary inline-flex h-10 items-center gap-2 rounded-full pl-[18px] pr-[22px] text-[14.5px] font-semibold"
              >
                <AiSparkIcon className="h-4 w-4 shrink-0" />
                Tạo ảnh
              </button>
            </div>
          </form>
          <p className="mt-3 w-full max-w-[40rem] text-left text-xs text-[var(--lp-muted)]">Tài khoản do quản trị cấp. Không cần thẻ thanh toán.</p>
        </div>
      </section>

      {/* Dải ảnh mẫu */}
      <section className="relative pb-6">
        <h2 className="mg-eyebrow text-center">Các team sáng tạo đang tạo ảnh theo cách này</h2>
        <div className="mt-6 flex gap-3 overflow-hidden px-3 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          {samples.slice(0, 9).map((src, i) => (
            <div key={i} className="aspect-[4/5] w-44 shrink-0 overflow-hidden rounded-2xl sm:w-56">
              <img
                src={src}
                alt="Ảnh mẫu tạo bởi studio ZVAS"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="relative mx-auto max-w-[76rem] px-5 pb-20 sm:px-8 md:pb-24">
        {/* Trust strip */}
        <section className="lp-reveal mt-20 grid gap-px overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-border)] sm:grid-cols-3 md:mt-24">
          {TRUST_POINTS.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex gap-3 bg-[var(--lp-surface)] p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mg-chip)]">
                <Icon className="h-4 w-4 text-white" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-[13px] leading-snug text-[var(--lp-muted)]">{detail}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Features */}
        <section id="features" className="mt-28 scroll-mt-24 md:mt-36">
          <div className="lp-reveal max-w-3xl">
            <p className="mg-eyebrow">Tính năng</p>
            <h2 className="font-display mt-4 text-balance text-4xl font-bold leading-[1.02] tracking-[-0.025em] text-white md:text-[3.25rem]">
              Từ một câu mô tả, một bức ảnh, hoặc cả hai
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--lp-muted)] md:text-lg">
              Tập trung vào output đẹp và vận hành rõ ràng, từ người tạo ảnh đến người quản trị.
            </p>
          </div>

          <div className="lp-reveal mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <article className="group relative flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-3xl md:col-span-2 md:row-span-2">
              {/* Lưới 2×2 ảnh mẫu: thumbnail nhỏ ghép lại thay vì phóng to một ảnh (tránh mờ) */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 transition duration-700 group-hover:scale-[1.03]" aria-hidden>
                {samples.slice(9, 13).map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ))}
              </div>
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,16,16,0)_35%,rgba(16,16,16,0.92)_100%)]"
                aria-hidden
              />
              <div className="relative p-8">
                <p className="mg-eyebrow text-white/70">01 · Từ prompt</p>
                <h3 className="font-display mt-3 text-[1.75rem] font-bold leading-tight text-white">{VALUE_PROPS[0].title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80 md:text-base">{VALUE_PROPS[0].body}</p>
              </div>
            </article>

            <article className="flex flex-col rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-7">
              <p className="mg-eyebrow">02 · Workflow</p>
              <h3 className="font-display mt-3 text-xl font-bold text-white">{VALUE_PROPS[1].title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lp-muted)]">{VALUE_PROPS[1].body}</p>
            </article>

            <article className="flex flex-col overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-surface)]">
              <div className="grid h-32 grid-cols-3 gap-1 overflow-hidden" aria-hidden>
                {samples.slice(13, 16).map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ))}
              </div>
              <div className="flex flex-1 flex-col p-7 pt-5">
                <p className="mg-eyebrow">03 · Style</p>
                <h3 className="font-display mt-3 text-xl font-bold text-white">{VALUE_PROPS[2].title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lp-muted)]">{VALUE_PROPS[2].body}</p>
              </div>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mt-28 scroll-mt-24 md:mt-36" aria-labelledby="how-heading">
          <div className="lp-reveal max-w-3xl">
            <p className="mg-eyebrow">Cách hoạt động</p>
            <h2
              id="how-heading"
              className="font-display mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.025em] text-white md:text-[3.25rem]"
            >
              Ba bước, một studio
            </h2>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-border)] md:grid-cols-3">
            {STEPS.map(({ n, title, desc }, i) => (
              <li
                key={n}
                className="lp-reveal bg-[var(--lp-void)] p-7"
                style={{ '--lp-reveal-delay': `${i * 90}ms` } as React.CSSProperties}
              >
                <span className="font-mono text-xs font-semibold text-[var(--lp-muted)]">0{n}.</span>
                <p className="font-display mt-4 text-lg font-bold text-white">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lp-muted)]">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="mt-28 md:mt-36">
          <div className="lp-reveal relative overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-surface)] px-6 py-16 text-center md:px-16 md:py-20">
            <h2 className="font-display mx-auto max-w-2xl text-balance text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-white md:text-5xl">
              Sẵn sàng cho batch creative tiếp theo?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--lp-muted)] md:text-base">
              Đăng nhập bằng tài khoản được cấp để vào studio; giao diện và công cụ hiển thị theo vai trò của bạn.
            </p>
            <button
              type="button"
              onClick={onLoginClick}
              className="mg-btn-primary group mt-10 inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-base font-semibold"
            >
              <LogIn className="h-5 w-5" aria-hidden />
              <span>Đăng nhập vào studio</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </section>

        <footer className="mt-20 border-t border-[var(--lp-border)] pt-8 text-center text-xs text-[var(--lp-faint)]">
          AI Image ZVAS. Studio tạo ảnh AI cho marketing, design và sản phẩm.
        </footer>
      </div>
    </div>
  );
};
