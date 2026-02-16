'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { MessageSquare, X as XIcon } from 'lucide-react';
import { CommentTargetType, Comment } from '@/types';
import { useUIStore } from '@/lib/store';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { v4 as uuidv4 } from 'uuid';

interface SharePrompt {
  content: string;
  url: string;
}

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { data: session } = useSession();
  const { addComment, getCommentsByTarget } = useUIStore();
  const [sharePrompt, setSharePrompt] = useState<SharePrompt | null>(null);

  const dismissShare = useCallback(() => setSharePrompt(null), []);

  useEffect(() => {
    if (!sharePrompt) return;
    const timer = setTimeout(dismissShare, 8000);
    return () => clearTimeout(timer);
  }, [sharePrompt, dismissShare]);

  const allComments = getCommentsByTarget(targetType, targetId);
  const topLevelComments = allComments
    .filter((c) => c.parentId === null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleSubmit(content: string) {
    if (!session?.user) return;
    const comment: Comment = {
      id: uuidv4(),
      targetType,
      targetId,
      author: {
        xId: session.user.xId!,
        xUsername: session.user.xUsername!,
        xName: session.user.xName || session.user.name || 'Anonymous',
        xProfileImage: session.user.xProfileImage || '',
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: null,
      likes: 0,
      likedBy: [],
    };
    addComment(comment);
    setSharePrompt({ content, url: window.location.href });
  }

  function buildXIntentUrl(prompt: SharePrompt): string {
    const params = new URLSearchParams({
      text: prompt.content,
      url: prompt.url,
      hashtags: 'Bitcoin,BitcoinRMF',
    });
    return `https://x.com/intent/tweet?${params.toString()}`;
  }

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-[#f7931a]" />
        <h2 className="text-sm font-semibold text-white">
          Discussion ({allComments.length})
        </h2>
      </div>

      {/* Comment form or sign-in CTA */}
      {session ? (
        <div className="mb-4 pb-4 border-b border-[#2a2a3a]">
          <CommentForm onSubmit={handleSubmit} />
        </div>
      ) : (
        <button
          onClick={() => signIn('twitter')}
          className="w-full mb-4 py-3 px-4 border border-[#2a2a3a] rounded-lg text-sm text-gray-500 hover:text-white hover:border-[#f7931a]/30 hover:bg-[#f7931a]/5 transition-all text-center"
        >
          Sign in with X to join the discussion
        </button>
      )}

      {/* Share to X prompt */}
      {sharePrompt && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <a
            href={buildXIntentUrl(sharePrompt)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismissShare}
            className="flex items-center gap-2 text-sm text-[#1d9bf0] hover:text-[#1d9bf0]/80 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share your take on X
          </a>
          <button
            onClick={dismissShare}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Comments list */}
      {topLevelComments.length > 0 ? (
        <div className="divide-y divide-[#2a2a3a]/50">
          {topLevelComments.map((comment) => {
            const replies = allComments.filter((c) => c.parentId === comment.id);
            return (
              <CommentCard
                key={comment.id}
                comment={comment}
                replies={replies}
                allComments={allComments}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-600 text-center py-4">
          No comments yet. Be the first to share your analysis.
        </p>
      )}
    </div>
  );
}
