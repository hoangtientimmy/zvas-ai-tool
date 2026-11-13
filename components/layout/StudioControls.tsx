import React, { memo, useCallback, useState } from 'react';
import { CircleHelp, LayoutGrid, Layers2, Sparkles } from 'lucide-react';
import type { ProviderKey, ProviderModelOption } from '../../constants/aiModels';
import { GeminiModelComparisonModal } from './GeminiModelComparisonModal';
import { ga4SelectContent } from '../../utils/gtagEvent';

export type AppView = 'create' | 'merge' | 'multiple';

const VIEW_CONFIG: Record<AppView, { label: string; icon: typeof Sparkles }> = {
  create: { label: 'Tạo ảnh', icon: Sparkles },
  merge: { label: 'Trộn ảnh', icon: Layers2 },
  multiple: { label: 'Hàng loạt', icon: LayoutGrid },
};

export interface StudioControlsProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  getProviderKey: () => ProviderKey;
  selectedModelKey: string;
  availableModelOptions: ProviderModelOption[];
  onModelPreferenceChange: (modelKey: string) => void;
}

/**
 * Tab chế độ (Tạo / Trộn / Hàng loạt) + chọn model — đặt trong panel điều khiển
 * của từng view (chung khối với prompt), thay vì trên header.
 */
function StudioControlsComponent({
  currentView,
  onViewChange,
  getProviderKey,
  selectedModelKey,
  availableModelOptions,
  onModelPreferenceChange,
}: StudioControlsProps) {
  const [modelHelpOpen, setModelHelpOpen] = useState(false);
  const handleTabClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const raw = e.currentTarget.getAttribute('data-view');
      if (raw === 'create' || raw === 'merge' || raw === 'multiple') onViewChange(raw);
    },
    [onViewChange]
  );

  return (
    <div className="space-y-3">
      <nav
        className="grid grid-cols-3 gap-1 rounded-full border border-[var(--lp-border)] bg-[var(--lp-ink)] p-1"
        aria-label="Chế độ làm việc"
      >
        {(['create', 'merge', 'multiple'] as const).map((view) => {
          const { label, icon: Icon } = VIEW_CONFIG[view];
          const active = currentView === view;
          return (
            <button
              key={view}
              type="button"
              data-view={view}
              onClick={handleTabClick}
              aria-current={active ? 'page' : undefined}
              className={`mg-shape-free flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-[var(--mg-chip)] text-[var(--lp-text)]'
                  : 'text-[var(--lp-muted)] hover:bg-white/[0.05] hover:text-[var(--lp-text)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <label htmlFor="studio-model-select" className="mg-eyebrow shrink-0 pl-1">
          Model
        </label>
        <select
          id="studio-model-select"
          value={selectedModelKey}
          onChange={(e) => onModelPreferenceChange(e.target.value)}
          className="h-10 min-w-0 flex-1 cursor-pointer truncate rounded-xl border border-[var(--lp-border)] bg-[var(--lp-ink)] px-3 text-sm text-[var(--lp-text)] outline-none transition focus:border-[var(--lp-border-strong)]"
        >
          {availableModelOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.provider.toUpperCase()} · {option.label}
            </option>
          ))}
        </select>
        {getProviderKey() === 'gemini' && (
          <button
            type="button"
            onClick={() => {
              ga4SelectContent('help', 'model_comparison');
              setModelHelpOpen(true);
            }}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--lp-border)] bg-[var(--lp-ink)] text-[var(--lp-muted)] transition hover:border-[var(--lp-border-strong)] hover:text-white"
            title="So sánh Nano Banana 2.1 và Nano Banana Pro"
            aria-label="Mở hướng dẫn so sánh model Gemini"
          >
            <CircleHelp className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <GeminiModelComparisonModal open={modelHelpOpen} onClose={() => setModelHelpOpen(false)} />
    </div>
  );
}

export const StudioControls = memo(StudioControlsComponent);
