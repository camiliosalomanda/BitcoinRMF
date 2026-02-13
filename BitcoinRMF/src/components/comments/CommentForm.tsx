'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send, X } from 'lucide-react';

const MAX_LENGTH = 500;

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({ onSubmit, onCancel, placeholder = 'Share your analysis...', autoFocus = false }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');

  const charCount = content.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = content.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isOverLimit) return;
    onSubmit(content.trim());
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {session?.user?.xProfileImage && (
        <img
          src={session.user.xProfileImage}
          alt={session.user.xUsername || ''}
          className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
        />
      )}
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-[#f7931a]/50 transition-colors"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] ${isOverLimit ? 'text-red-400' : 'text-gray-600'}`}>
            {charCount}/{MAX_LENGTH}
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={12} />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isEmpty || isOverLimit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7931a] hover:bg-[#f7931a]/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-colors"
            >
              <Send size={12} />
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
