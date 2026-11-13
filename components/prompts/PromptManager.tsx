
import React, { useCallback, useState } from 'react';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { Dices } from 'lucide-react';
import { generateRandomPrompt } from '../../utils/promptGenerator';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface PromptManagerProps {
  prompts: string[];
  setPrompts: React.Dispatch<React.SetStateAction<string[]>>;
  hasImage: boolean;
}

export const PromptManager: React.FC<PromptManagerProps> = React.memo(({ prompts, setPrompts, hasImage }) => {
  const addPrompt = useCallback(() => {
    setPrompts((prev) => [...prev, '']);
  }, [setPrompts]);

  const handleRandomPrompt = useCallback(() => {
    const randomText = generateRandomPrompt();
    setPrompts((prev) =>
      prev.length === 1 && prev[0].trim() === '' ? [randomText] : [...prev, randomText]
    );
  }, [setPrompts]);

  const removePrompt = useCallback((index: number) => {
    setPrompts((prev) => prev.filter((_, i) => i !== index));
  }, [setPrompts]);

  // Mô tả đã có nội dung → hỏi lại trước khi xóa; mô tả trống thì xóa luôn.
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);
  const requestRemove = useCallback((index: number) => {
    if (prompts[index]?.trim()) setPendingRemove(index);
    else removePrompt(index);
  }, [prompts, removePrompt]);
  const cancelRemove = useCallback(() => setPendingRemove(null), []);
  const confirmRemove = useCallback(() => {
    if (pendingRemove !== null) removePrompt(pendingRemove);
    setPendingRemove(null);
  }, [pendingRemove, removePrompt]);

  const updatePrompt = useCallback((index: number, value: string) => {
    setPrompts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, [setPrompts]);

  const placeholderText = hasImage 
    ? "VD: Biến hậu cảnh thành..."
    : "VD: Một con mèo...";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="mg-eyebrow">Mô tả (Prompt)</h2>
        <button
          onClick={handleRandomPrompt}
          className="flex items-center space-x-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20 hover:border-cyan-400/40"
          title="Tạo prompt ngẫu nhiên"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Random</span>
        </button>
      </div>
      <div className="space-y-2">
        {prompts.map((prompt, index) => (
          <div key={index} className="relative">
            <textarea
              value={prompt}
              onChange={(e) => updatePrompt(index, e.target.value)}
              placeholder={placeholderText}
              rows={5}
              className="w-full bg-[var(--lp-ink)] border border-[var(--lp-border)] rounded-xl pl-3 pr-9 py-2 text-base focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none placeholder-gray-500"
            />
            {prompts.length > 1 && (
                <button
                type="button"
                onClick={() => requestRemove(index)}
                className="absolute top-3 right-2 p-1 rounded-md text-gray-400 hover:text-red-400 transition-colors"
                aria-label={`Xóa mô tả ${index + 1}`}
                title="Xóa mô tả"
                >
                <TrashIcon className="w-5 h-5" />
                </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addPrompt}
        className="mt-2 flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        <span>Thêm mô tả</span>
      </button>
      <ConfirmDialog
        open={pendingRemove !== null}
        title="Xóa mô tả này?"
        description={
          pendingRemove !== null ? (
            <>
              <p className="line-clamp-3 italic text-[var(--lp-text)]/80">{`“${(prompts[pendingRemove] ?? '').trim().slice(0, 120)}${(prompts[pendingRemove] ?? '').trim().length > 120 ? '…' : ''}”`}</p>
              <p className="mt-2">Nội dung mô tả sẽ bị xóa khỏi danh sách.</p>
            </>
          ) : null
        }
        confirmLabel="Xóa mô tả"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
});
