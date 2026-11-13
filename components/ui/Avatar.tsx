import React, { useState } from 'react';

/** Màu nền ổn định theo tên (cùng tên → cùng màu), tông trung tính hợp nền tối. */
const TONES = ['#3b4a8f', '#5a3f7a', '#2f6b5e', '#7a4a3a', '#4a5560', '#6b5a2f', '#3a5f7a'];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function toneOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export interface AvatarProps {
  name: string;
  photoURL?: string | null;
  className?: string;
}

/**
 * Ảnh đại diện; không có ảnh (hoặc ảnh lỗi) thì hiện chữ cái đầu tạo tại chỗ —
 * không gọi dịch vụ ngoài (trước đây dùng ui-avatars.com, lộ tên người dùng ra bên thứ ba).
 */
export const Avatar: React.FC<AvatarProps> = ({ name, photoURL, className = 'h-8 w-8 text-xs' }) => {
  const [failed, setFailed] = useState(false);
  if (photoURL && !failed) {
    return (
      <img
        src={photoURL}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full border border-white/10 object-cover ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{ backgroundColor: toneOf(name || '?') }}
      className={`flex shrink-0 select-none items-center justify-center rounded-full border border-white/10 font-semibold text-white ${className}`}
    >
      {initialsOf(name || '?')}
    </span>
  );
};
