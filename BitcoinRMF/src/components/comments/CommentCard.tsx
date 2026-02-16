'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { Comment, CommentTargetType } from '@/types';
import { useUIStore } from '@/lib/store';
import CommentForm from './CommentForm';
import { v4 as uuidv4 } from 'uuid';

interface CommentCardProps {
  comment: Comment;
  replies: Comment[];
  allComments: Comment[];
  depth?: number;
  onReplyPosted?: (content: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommentCard({ comment, replies, allComments, depth = 0, onReplyPosted }: CommentCardProps) {
  const { data: session } = useSession();
  const { deleteComment, likeComment, addComment } = useUIStore();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwner = session?.user?.xId === comment.author.xId;
  const isLiked = session?.user?.xId ? comment.likedBy.includes(session.user.xId) : false;

  function handleDelete() {
    if (session?.user?.xId) {
      deleteComment(comment.id, session.user.xId);
    }
  }

  function handleLike() {
    if (session?.user?.xId) {
      likeComment(comment.id, session.user.xId);
    }
  }

  function handleReply(content: string) {
    if (!session?.user) return;
    const newComment: Comment = {
      id: uuidv4(),
      targetType: comment.targetType,
      targetId: comment.targetId,
      author: {
        xId: session.user.xId!,
        xUsername: session.user.xUsername!,
        xName: session.user.xName || session.user.name || 'Anonymous',
        xProfileImage: session.user.xProfileImage || '',
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: comment.id,
      likes: 0,
      likedBy: [],
    };
    addComment(newComment);
    setShowReplyForm(false);
    onReplyPosted?.(content);
  }

  return (
    <div className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-[#2a2a3a]' : ''}>
      <div className="py-3">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2">
          {comment.author.xProfileImage ? (
            <img
              src={comment.author.xProfileImage}
              alt={comment.author.xUsername}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#2a2a3a] flex items-center justify-center text-[10px] text-gray-500">
              {comment.author.xName.charAt(0)}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white">{comment.author.xName}</span>
            <a
              href={`https://x.com/${comment.author.xUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-500 hover:text-[#f7931a] transition-colors"
            >
              @{comment.author.xUsername}
            </a>
            <span className="text-[10px] text-gray-600">&middot;</span>
            <span className="text-[10px] text-gray-600">{timeAgo(comment.createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={!session}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              isLiked
                ? 'text-red-400 hover:text-red-300'
                : 'text-gray-600 hover:text-gray-400'
            } disabled:cursor-not-allowed`}
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
            {comment.likes > 0 && comment.likes}
          </button>

          {session && depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              <MessageSquare size={12} />
              Reply
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors ml-auto"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to @${comment.author.xUsername}...`}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {replies.map((reply) => {
        const nestedReplies = allComments.filter((c) => c.parentId === reply.id);
        return (
          <CommentCard
            key={reply.id}
            comment={reply}
            replies={nestedReplies}
            allComments={allComments}
            depth={depth + 1}
            onReplyPosted={onReplyPosted}
          />
        );
      })}
    </div>
  );
}
