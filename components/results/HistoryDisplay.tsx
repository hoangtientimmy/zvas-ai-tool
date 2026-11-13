import React, { memo } from 'react';
import type { GeneratedImage } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

interface HistoryDisplayProps {
  images: GeneratedImage[];
  onImageSelect: (image: GeneratedImage) => void;
  onUseAsInput: (image: GeneratedImage) => void;
  onDownload: (image: GeneratedImage) => void;
  onClear?: () => void;
}

function HistoryDisplayInner({ images, onImageSelect, onUseAsInput, onDownload, onClear }: HistoryDisplayProps) {
  if (images.length === 0) {
    return (
        <div className="h-full px-4 pb-4">
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--lp-faint)]">Lịch sử trống</span>
          </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2.5 flex items-center justify-between px-4">
        <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--lp-muted)]">Gần đây (10 hình mới nhất)</span>
        {onClear ? (
            <button 
                onClick={onClear}
                className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--lp-muted)] transition-colors hover:bg-white/[0.05] hover:text-red-300"
            >
                Xóa lịch sử
            </button>
        ) : null}
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 gap-2.5 overflow-x-auto px-4 pb-4">
        {images.map((image, index) => (
          <div 
            key={`${image.imageUrl}-${image.prompt}`}
            className="flex-shrink-0 group relative aspect-square h-full bg-black rounded-lg overflow-hidden border border-white/10 hover:border-white/40 transition-all cursor-pointer [content-visibility:auto] [contain-intrinsic-size:96px_64px]"
          >
            <img 
                src={image.imageUrl} 
                alt={image.prompt} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                onClick={() => onImageSelect(image)}
            />
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); onUseAsInput(image); }}
                    className="p-1.5 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 transform hover:scale-110 transition-all"
                    title="Dùng làm phôi"
                >
                    <SparklesIcon className="w-3 h-3" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDownload(image); }}
                    className="p-1.5 bg-[var(--mg-chip)] rounded-full text-white hover:bg-white/25 transform hover:scale-110 transition-all"
                    title="Tải xuống JPG"
                >
                    <DownloadIcon className="w-3 h-3" />
                </button>
            </div>
            
            {/* Index Badge */}
            <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-xs font-semibold text-gray-300">
                #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const HistoryDisplay = memo(HistoryDisplayInner);
