
import React from 'react';
import { ChevronRight, Palette, X } from 'lucide-react';
import { getStyleDisplayName } from '../../lib/styleGuide';

interface PromptOptionsProps {
  options: {
    styleSimplified: boolean;
    keepStyle: boolean;
    keepStartImageStyle: boolean;
    forceRemoveBackground: boolean;
    backgroundRemovalStrength: 'soft' | 'strong';
  };
  onOptionChange: (option: keyof PromptOptionsProps['options']) => void;
  backgroundStyle: string;
  onBackgroundChange: (style: string) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  
  outlineType: 'none' | 'white' | 'black';
  onOutlineTypeChange: (type: 'none' | 'white' | 'black') => void;
  outlineThickness: 'thin' | 'normal' | 'thick';
  onOutlineThicknessChange: (thickness: 'thin' | 'normal' | 'thick') => void;

  hasReferenceImages: boolean;
  hasStartImage: boolean;
  onShowStyleGuide: () => void;
  onBackgroundRemovalStrengthChange: (strength: 'soft' | 'strong') => void;
}

export const PromptOptions: React.FC<PromptOptionsProps> = ({ 
    options, onOptionChange, backgroundStyle, onBackgroundChange, 
    selectedStyle, onStyleChange, hasReferenceImages, hasStartImage, onShowStyleGuide,
    outlineType, onOutlineTypeChange, outlineThickness, onOutlineThicknessChange,
    onBackgroundRemovalStrengthChange
}) => {
  const selectedStyleName = getStyleDisplayName(selectedStyle);
  return (
    <div className="w-full">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
             <label className="col-span-2 mg-eyebrow">Style & Background</label>
            
            <div className="flex items-stretch overflow-hidden rounded-xl border border-[var(--lp-border)] bg-[var(--lp-ink)] text-base transition-colors hover:border-white/25 focus-within:border-white/40">
                <button
                    type="button"
                    onClick={onShowStyleGuide}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 pl-3 pr-2 text-left"
                    title="Mở thư viện phong cách"
                    aria-haspopup="dialog"
                >
                    <Palette className={`h-4 w-4 shrink-0 ${selectedStyleName ? 'text-[var(--lp-accent)]' : 'text-[var(--lp-muted)]'}`} aria-hidden />
                    <span className={`min-w-0 flex-1 truncate ${selectedStyleName ? 'text-[var(--lp-text)]' : 'text-gray-400'}`}>
                        {selectedStyleName || 'Chọn Style'}
                    </span>
                    {!selectedStyleName && <ChevronRight className="h-4 w-4 shrink-0 text-[var(--lp-muted)]" aria-hidden />}
                </button>
                {selectedStyleName && (
                    <button
                        type="button"
                        onClick={() => onStyleChange('')}
                        className="flex flex-shrink-0 cursor-pointer items-center px-3 text-gray-400 hover:text-white"
                        aria-label={`Bỏ chọn style ${selectedStyleName}`}
                        title="Bỏ chọn style"
                    ><X className="h-4 w-4" aria-hidden /></button>
                )}
            </div>
            
            <div className="relative w-full">
                <select
                id="backgroundStyle"
                value={backgroundStyle}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="w-full bg-[var(--lp-ink)] border border-[var(--lp-border)] rounded-xl py-2 pl-3 pr-9 text-base text-gray-300 focus:border-white/40 outline-none appearance-none truncate cursor-pointer"
                >
                <option value="none">Mặc định</option>
                <option value="black">Nền Đen</option>
                <option value="white">Nền Trắng</option>
                <option value="transparent">Trong suốt</option>
                </select>
            </div>
        </div>

        {/* Outline Section */}
        <div className="flex flex-col gap-2 pt-2">
            <label className="mg-eyebrow">Viền Chủ Thể (Outline)</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="relative w-full">
                    <select
                        value={outlineType}
                        onChange={(e) => onOutlineTypeChange(e.target.value as any)}
                        className="w-full bg-[var(--lp-ink)] border border-[var(--lp-border)] rounded-xl py-2 pl-3 pr-9 text-base text-gray-300 focus:border-white/40 outline-none appearance-none truncate cursor-pointer"
                    >
                        <option value="none">Không viền</option>
                        <option value="white">Viền Trắng</option>
                        <option value="black">Viền Đen</option>
                    </select>
                </div>
                <div className="relative w-full">
                    <select
                        value={outlineThickness}
                        disabled={outlineType === 'none'}
                        onChange={(e) => onOutlineThicknessChange(e.target.value as any)}
                        className={`w-full bg-[var(--lp-ink)] border border-[var(--lp-border)] rounded-xl py-2 pl-3 pr-9 text-base text-gray-300 focus:border-white/40 outline-none appearance-none truncate cursor-pointer ${outlineType === 'none' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="thin">Mỏng</option>
                        <option value="normal">Vừa</option>
                        <option value="thick">Dày</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Simplify Checkbox Row */}
        <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-3 p-2 rounded-xl border border-[var(--lp-border)] hover:bg-white/[0.04] cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    checked={options.styleSimplified}
                    onChange={() => onOptionChange('styleSimplified')}
                    className="w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-gray-800 flex-shrink-0"
                />
                <span className="text-sm text-gray-300 font-medium">Đơn giản hóa</span>
            </label>
            {backgroundStyle === 'transparent' ? (
              <div className="flex flex-col gap-2 p-2 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.06]">
                <label className="flex items-center space-x-3 cursor-pointer transition-colors">
                    <input
                        type="checkbox"
                        checked={options.forceRemoveBackground}
                        onChange={() => onOptionChange('forceRemoveBackground')}
                        className="w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-gray-800 flex-shrink-0"
                    />
                    <span className="text-sm text-cyan-200 font-medium">Force remove background</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-cyan-300/80">Strength</span>
                  <select
                    value={options.backgroundRemovalStrength}
                    onChange={(e) => onBackgroundRemovalStrengthChange(e.target.value as 'soft' | 'strong')}
                    disabled={!options.forceRemoveBackground}
                    className={`bg-[var(--lp-ink)] border border-[var(--lp-border)] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      !options.forceRemoveBackground ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="soft">Soft</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl border border-[var(--lp-border)] text-xs text-gray-500 flex items-center">
                Bật nền trong suốt để dùng Force remove background.
              </div>
            )}
        </div>

        {/* Keep Style Row */}
        <div className="border-t border-gray-700 pt-2 mt-0.5">
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center space-x-2 p-2 rounded-xl border border-[var(--lp-border)] transition-colors ${hasStartImage ? 'hover:bg-gray-700/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                <input
                    type="checkbox"
                    checked={options.keepStartImageStyle}
                    onChange={() => hasStartImage && onOptionChange('keepStartImageStyle')}
                    disabled={!hasStartImage}
                    className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-gray-800 flex-shrink-0"
                />
                <span className="text-xs text-gray-300 font-bold uppercase leading-tight">Giữ style ảnh gốc</span>
            </label>

            <label className={`flex items-center space-x-2 p-2.5 rounded-xl border border-[var(--lp-border)] transition-colors ${hasReferenceImages ? 'hover:bg-gray-700/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                <input
                    type="checkbox"
                    checked={options.keepStyle}
                    onChange={() => hasReferenceImages && onOptionChange('keepStyle')}
                    disabled={!hasReferenceImages}
                    className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-gray-800 flex-shrink-0"
                />
                <span className="text-xs text-gray-300 font-bold uppercase leading-tight">Giữ style tham chiếu</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
