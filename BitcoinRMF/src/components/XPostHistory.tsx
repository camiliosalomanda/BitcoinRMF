'use client';

import { useXPosts, type XPost } from '@/hooks/useXPosts';
import { CheckCircle, XCircle, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

const TRIGGER_LABELS: Record<string, string> = {
  threat_signal: 'Threat',
  fud_signal: 'FUD',
  bip_status_change: 'BIP Change',
  bip_evaluation: 'BIP Eval',
  community_publish: 'Community',
  weekly_summary: 'Weekly',
  vulnerability_status_change: 'Vuln',
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  posted: { icon: CheckCircle, color: 'text-green-400', label: 'Posted' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  abandoned: { icon: AlertTriangle, color: 'text-gray-500', label: 'Abandoned' },
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PostRow({ post }: { post: XPost }) {
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const triggerLabel = TRIGGER_LABELS[post.trigger_type] || post.trigger_type;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors">
      <StatusIcon size={14} className={`mt-0.5 shrink-0 ${statusCfg.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a2a] text-sky-400 font-medium">
            {triggerLabel}
          </span>
          <span className={`text-[10px] ${statusCfg.color}`}>{statusCfg.label}</span>
          {post.retry_count > 0 && (
            <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
              <RotateCcw size={8} /> {post.retry_count}
            </span>
          )}
          <span className="text-[10px] text-gray-600 ml-auto">
            {formatTimeAgo(post.posted_at || post.created_at)}
          </span>
        </div>
        {post.status === 'failed' && post.error_message && (
          <p className="text-[10px] text-red-400/70 mt-1 truncate">{post.error_message}</p>
        )}
      </div>
    </div>
  );
}

export default function XPostHistory() {
  const { data: posts = [], isLoading } = useXPosts(15);

  const posted = posts.filter((p) => p.status === 'posted').length;
  const failed = posts.filter((p) => p.status === 'failed').length;
  const abandoned = posts.filter((p) => p.status === 'abandoned').length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-800/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-600 text-xs">
        No X posts yet. Posts will appear here when automation is active.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-[10px]">
        <span className="text-green-400">{posted} posted</span>
        {failed > 0 && <span className="text-red-400">{failed} failed</span>}
        {abandoned > 0 && <span className="text-gray-500">{abandoned} abandoned</span>}
        <span className="text-gray-600 ml-auto">{posts.length} recent</span>
      </div>

      {/* Post list */}
      <div className="space-y-2">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
