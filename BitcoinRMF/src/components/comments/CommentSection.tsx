'use client';

import { useSession, signIn } from 'next-auth/react';
import { MessageSquare } from 'lucide-react';
import { CommentTargetType, Comment } from '@/types';
import { useRMFStore } from '@/lib/store';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { v4 as uuidv4 } from 'uuid';

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { data: session } = useSession();
  const { addComment, getCommentsByTarget } = useRMFStore();

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
