'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Threat,
  BIPEvaluation,
  FUDAnalysis,
  RemediationStrategy,
  RiskMatrixCell,
  DashboardStats,
  RiskRating,
  Comment,
  CommentTargetType,
} from '@/types';
import { buildRiskMatrix, getSeverityRating } from '@/lib/scoring';
import { SEED_THREATS, SEED_BIPS, SEED_FUD } from '@/lib/seed-data';

interface RMFStore {
  // State
  threats: Threat[];
  bips: BIPEvaluation[];
  fudAnalyses: FUDAnalysis[];
  isInitialized: boolean;

  // Threat CRUD
  addThreat: (threat: Threat) => void;
  updateThreat: (id: string, updates: Partial<Threat>) => void;
  deleteThreat: (id: string) => void;
  getThreatById: (id: string) => Threat | undefined;

  // BIP CRUD
  addBIP: (bip: BIPEvaluation) => void;
  updateBIP: (id: string, updates: Partial<BIPEvaluation>) => void;
  deleteBIP: (id: string) => void;

  // FUD CRUD
  addFUD: (fud: FUDAnalysis) => void;
  updateFUD: (id: string, updates: Partial<FUDAnalysis>) => void;
  deleteFUD: (id: string) => void;

  // Remediation
  addRemediation: (threatId: string, remediation: RemediationStrategy) => void;
  updateRemediation: (threatId: string, remediationId: string, updates: Partial<RemediationStrategy>) => void;

  // Initialization
  initializeSeedData: () => void;

  // Comments
  comments: Comment[];
  addComment: (comment: Comment) => void;
  deleteComment: (commentId: string, xId: string) => void;
  likeComment: (commentId: string, xId: string) => void;
  getCommentsByTarget: (targetType: CommentTargetType, targetId: string) => Comment[];
  getCommentCount: (targetType: CommentTargetType, targetId: string) => number;

  // Computed
  getRiskMatrix: () => RiskMatrixCell[][];
  getDashboardStats: () => DashboardStats;
}

export const useRMFStore = create<RMFStore>()(
  persist(
    (set, get) => ({
      // Initial state
      threats: [],
      bips: [],
      fudAnalyses: [],
      comments: [],
      isInitialized: false,

      // Threat CRUD
      addThreat: (threat) =>
        set((state) => ({ threats: [...state.threats, threat] })),

      updateThreat: (id, updates) =>
        set((state) => ({
          threats: state.threats.map((t) =>
            t.id === id ? { ...t, ...updates, lastUpdated: new Date().toISOString() } : t
          ),
        })),

      deleteThreat: (id) =>
        set((state) => ({
          threats: state.threats.filter((t) => t.id !== id),
        })),

      getThreatById: (id) => get().threats.find((t) => t.id === id),

      // BIP CRUD
      addBIP: (bip) =>
        set((state) => ({ bips: [...state.bips, bip] })),

      updateBIP: (id, updates) =>
        set((state) => ({
          bips: state.bips.map((b) =>
            b.id === id ? { ...b, ...updates, lastUpdated: new Date().toISOString() } : b
          ),
        })),

      deleteBIP: (id) =>
        set((state) => ({
          bips: state.bips.filter((b) => b.id !== id),
        })),

      // FUD CRUD
      addFUD: (fud) =>
        set((state) => ({ fudAnalyses: [...state.fudAnalyses, fud] })),

      updateFUD: (id, updates) =>
        set((state) => ({
          fudAnalyses: state.fudAnalyses.map((f) =>
            f.id === id ? { ...f, ...updates, lastUpdated: new Date().toISOString() } : f
          ),
        })),

      deleteFUD: (id) =>
        set((state) => ({
          fudAnalyses: state.fudAnalyses.filter((f) => f.id !== id),
        })),

      // Remediation
      addRemediation: (threatId, remediation) =>
        set((state) => ({
          threats: state.threats.map((t) =>
            t.id === threatId
              ? { ...t, remediationStrategies: [...t.remediationStrategies, remediation] }
              : t
          ),
        })),

      updateRemediation: (threatId, remediationId, updates) =>
        set((state) => ({
          threats: state.threats.map((t) =>
            t.id === threatId
              ? {
                  ...t,
                  remediationStrategies: t.remediationStrategies.map((r) =>
                    r.id === remediationId ? { ...r, ...updates } : r
                  ),
                }
              : t
          ),
        })),

      // Comments
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

      // Initialize with seed data
      initializeSeedData: () => {
        const state = get();
        if (!state.isInitialized) {
          set({
            threats: SEED_THREATS,
            bips: SEED_BIPS,
            fudAnalyses: SEED_FUD,
            isInitialized: true,
          });
        }
      },

      // Computed: Risk Matrix
      getRiskMatrix: () => buildRiskMatrix(get().threats),

      // Computed: Dashboard Stats
      getDashboardStats: (): DashboardStats => {
        const { threats, bips, fudAnalyses } = get();
        const criticalHighCount = threats.filter(
          (t) =>
            t.riskRating === RiskRating.CRITICAL ||
            t.riskRating === RiskRating.HIGH
        ).length;
        const totalSeverity = threats.reduce((sum, t) => sum + t.severityScore, 0);
        const activeRemediations = threats.reduce(
          (sum, t) =>
            sum +
            t.remediationStrategies.filter(
              (r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED'
            ).length,
          0
        );
        return {
          totalThreats: threats.length,
          criticalHighCount,
          averageSeverity: threats.length > 0 ? Math.round((totalSeverity / threats.length) * 10) / 10 : 0,
          activeRemediations,
          bipsPending: bips.filter((b) => b.status === 'PROPOSED' || b.status === 'DRAFT').length,
          activeFUD: fudAnalyses.filter((f) => f.status === 'ACTIVE').length,
          mitigatedThreats: threats.filter((t) => t.status === 'MITIGATED').length,
          monitoringThreats: threats.filter((t) => t.status === 'MONITORING').length,
        };
      },
    }),
    {
      name: 'bitcoin-rmf-storage',
      partialize: (state) => ({
        threats: state.threats,
        bips: state.bips,
        fudAnalyses: state.fudAnalyses,
        comments: state.comments,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
