/**
 * Ảnh mẫu nội bộ cho các vùng trang trí (landing, modal đăng nhập) khi chưa có
 * ảnh thật: dùng 23 thumbnail của thư viện phong cách (do ZVAS tạo, đi kèm repo),
 * không phụ thuộc dịch vụ ảnh ngoài. Thay bằng ảnh do studio tạo khi có.
 */
const MODULES = import.meta.glob<string>('../assets/images/styles/*.webp', {
  eager: true,
  import: 'default',
});

export const SAMPLE_IMAGES: string[] = Object.keys(MODULES)
  .sort()
  .map((k) => MODULES[k]);

/** Ảnh nền hero (ảnh OG của ZVAS trong /public). */
export const HERO_IMAGE = '/og-image.jpeg';

/** `count` ảnh xáo ngẫu nhiên (mỗi lần gọi một thứ tự khác); lặp lại nếu cần nhiều hơn số ảnh có. */
export function shuffledSamples(count: number): string[] {
  const pool = [...SAMPLE_IMAGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (pool.length === 0) return [];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}
