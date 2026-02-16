'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Comment,
  CommentAuthor,
  CommentTargetType,
} from '@/types';

interface UIStore {
  // Comments (localStorage for now)
  comments: Comment[];
  addComment: (comment: Comment) => void;
  deleteComment: (commentId: string, xId: string) => void;
  likeComment: (commentId: string, xId: string) => void;
  getCommentsByTarget: (targetType: CommentTargetType, targetId: string) => Comment[];
  getCommentCount: (targetType: CommentTargetType, targetId: string) => number;
  getUniqueAuthors: () => CommentAuthor[];
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      comments: [],

      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),

      deleteComment: (commentId, xId) =>
        set((state) => ({
          comments: state.comments.filter(
            (c) => !(c.id === commentId && c.author.xId === xId)
          ),
        })),

      likeComment: (commentId, xId) =>
        set((state) => ({
          comments: state.comments.map((c) => {
            if (c.id !== commentId) return c;
            const alreadyLiked = c.likedBy.includes(xId);
            return {
              ...c,
              likedBy: alreadyLiked
                ? c.likedBy.filter((id) => id !== xId)
                : [...c.likedBy, xId],
              likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
            };
          }),
        })),

      getCommentsByTarget: (targetType, targetId) =>
        get().comments.filter(
          (c) => c.targetType === targetType && c.targetId === targetId
        ),

      getCommentCount: (targetType, targetId) =>
        get().comments.filter(
          (c) => c.targetType === targetType && c.targetId === targetId
        ).length,

      getUniqueAuthors: () => {
        const seen = new Set<string>();
        const authors: CommentAuthor[] = [];
        for (const c of get().comments) {
          if (!seen.has(c.author.xId)) {
            seen.add(c.author.xId);
            authors.push(c.author);
          }
        }
        return authors;
      },
    }),
    {
      name: 'bitcoin-rmf-ui',
      partialize: (state) => ({
        comments: state.comments,
      }),
    }
  )
);
