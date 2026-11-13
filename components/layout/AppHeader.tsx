import React, { memo } from 'react';
import type { User } from 'firebase/auth';
import { Avatar } from '../ui/Avatar';
import {
  BarChart3,
  Key,
  LogOut,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../../hooks/useAuthAndProfile';

// Tab chế độ + chọn model đã chuyển vào panel điều khiển (StudioControls).
export type { AppView } from './StudioControls';

export interface AppHeaderProps {
  user: User;
  userProfile: UserProfile | null;
  onSelectApiKey: () => void | Promise<void>;
  pendingUsersCount: number;
  onOpenAdminSettings: () => void;
  onOpenAdminUsers: () => void;
  /** Role `advice`: mở dashboard chỉ tab Analytics */
  onOpenAdminAnalytics: () => void;
  /** Preload dashboard chunk trên hover/focus để mở mượt lần đầu. */
  onPrefetchAdminDashboard: () => void;
  onLogout: () => void | Promise<void>;
  /** Mở trang/modal quản lý phiên đăng nhập đa thiết bị. */
  onOpenSessions?: () => void;
  /** Logo: làm mới vùng làm việc (prompt, ảnh, style, kết quả) — không đăng xuất, không xóa analytics. */
  onLogoWorkspaceRefresh: () => void;
}

function AppHeaderComponent({
  user,
  userProfile,
  onSelectApiKey,
  pendingUsersCount,
  onOpenAdminSettings,
  onOpenAdminUsers,
  onOpenAdminAnalytics,
  onPrefetchAdminDashboard,
  onLogout,
  onOpenSessions,
  onLogoWorkspaceRefresh,
}: AppHeaderProps) {

  const showApiKeyButton =
    typeof window !== 'undefined' &&
    !!(window as Window & { aistudio?: { openSelectKey?: () => Promise<void> } }).aistudio?.openSelectKey;

  return (
    <header className="z-20 flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--lp-border)] bg-[var(--lp-void)] px-3 py-2 sm:px-5 sm:py-3">
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <button
          type="button"
          onClick={onLogoWorkspaceRefresh}
          className="group/brand flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl text-left transition-colors hover:bg-[var(--lp-accent-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lp-border-strong)]"
          aria-label="Làm mới vùng làm việc"
          title="Xóa prompt, ảnh đang chọn và tùy chọn style — giữ đăng nhập và dữ liệu analytics"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--lp-void)] transition-transform group-hover/brand:scale-[1.02]">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="font-display truncate text-base font-bold tracking-tight text-[var(--lp-text)] sm:text-lg">
              AI Image ZVAS
            </h1>
            <p className="hidden text-[11px] text-[var(--lp-muted)] sm:block">Studio tạo ảnh AI</p>
          </div>
        </button>

      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
        {showApiKeyButton && (
          <button
            type="button"
            onClick={() => void onSelectApiKey()}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border)] bg-transparent text-[var(--lp-muted)] transition-colors hover:border-[var(--lp-border-strong)] hover:text-[var(--lp-accent)] sm:h-10 sm:w-10"
            title="Đổi API key"
          >
            <Key className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        )}
        {userProfile?.role === 'admin' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenAdminSettings}
              onMouseEnter={onPrefetchAdminDashboard}
              onFocus={onPrefetchAdminDashboard}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border)] bg-transparent text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-accent)] sm:h-10 sm:w-10"
              title="Cấu hình hệ thống"
            >
              <Settings className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
            <button
              type="button"
              onClick={onOpenAdminUsers}
              onMouseEnter={onPrefetchAdminDashboard}
              onFocus={onPrefetchAdminDashboard}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border-strong)] bg-[var(--lp-accent-dim)] text-[var(--lp-accent)] transition-colors hover:bg-[color-mix(in_oklab,var(--lp-accent)_18%,transparent)] sm:h-10 sm:w-10"
              title="Quản trị"
            >
              <ShieldCheck className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              {pendingUsersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--lp-void)] bg-red-500 px-1 text-[9px] font-bold text-white sm:h-5 sm:min-w-[20px] sm:text-[10px]">
                  {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                </span>
              )}
            </button>
          </div>
        )}
        {userProfile?.role === 'advice' && (
          <button
            type="button"
            onClick={onOpenAdminAnalytics}
            onMouseEnter={onPrefetchAdminDashboard}
            onFocus={onPrefetchAdminDashboard}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-200 transition-colors hover:bg-violet-500/20 sm:h-10 sm:w-10"
            title="Analytics (chỉ xem)"
          >
            <BarChart3 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface-elevated)] py-1 pl-1 pr-2 sm:pr-3">
          <Avatar name={user.displayName || user.email || '?'} photoURL={user.photoURL} className="h-7 w-7 text-[11px] sm:h-8 sm:w-8" />
          <span className="hidden max-w-[100px] truncate text-xs font-medium text-[var(--lp-text)] md:inline">
            {user.displayName}
          </span>
        </div>

        {onOpenSessions ? (
          <button
            type="button"
            onClick={onOpenSessions}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border)] bg-transparent text-[var(--lp-muted)] transition-colors hover:border-[var(--lp-border-strong)] hover:text-[var(--lp-accent)] sm:h-10 sm:w-10"
            title="Phiên đăng nhập"
            aria-label="Xem phiên đăng nhập"
          >
            <MonitorSmartphone className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border)] bg-transparent text-[var(--lp-muted)] transition-colors hover:border-red-500/40 hover:text-red-300 sm:h-10 sm:w-10"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </button>
      </div>
    </header>
  );
}

export const AppHeader = memo(AppHeaderComponent);
