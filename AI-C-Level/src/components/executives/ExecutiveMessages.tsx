'use client';

/**
 * Executive Messages Component
 * Displays inter-executive communications and collaboration requests
 */

import React, { useState } from 'react';
import { ExecutiveRole } from '@/types/executives';

// Message types
interface ExecutiveMessage {
  id: string;
  fromExecutive: ExecutiveRole;
  toExecutive: ExecutiveRole | 'all';
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'info' | 'request' | 'approval' | 'alert';
  status: 'pending' | 'read' | 'actioned';
  timestamp: Date;
}

// Executive display info
const EXECUTIVE_INFO: Record<ExecutiveRole, { name: string; icon: string; color: string }> = {
  CFO: { name: 'Alex', icon: '💰', color: '#10B981' },
  CMO: { name: 'Jordan', icon: '📈', color: '#8B5CF6' },
  COO: { name: 'Morgan', icon: '⚙️', color: '#F59E0B' },
  CHRO: { name: 'Taylor', icon: '👥', color: '#EC4899' },
  CTO: { name: 'Riley', icon: '💻', color: '#3B82F6' },
  CCO: { name: 'Casey', icon: '⚖️', color: '#6366F1' },
};

// Priority styles
const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

// Type icons
const TYPE_ICONS = {
  info: 'ℹ️',
  request: '📋',
  approval: '✅',
  alert: '⚠️',
};

interface ExecutiveMessagesProps {
  messages: ExecutiveMessage[];
  onMessageAction?: (messageId: string, action: 'read' | 'action') => void;
  compact?: boolean;
}

export default function ExecutiveMessages({
  messages,
  onMessageAction,
  compact = false,
}: ExecutiveMessagesProps) {
  const [filter, setFilter] = useState<'all' | ExecutiveRole>('all');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.fromExecutive === filter || msg.toExecutive === filter;
  });

  // Sort by timestamp (newest first) and priority
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const urgentCount = messages.filter((m) => m.priority === 'urgent' && m.status === 'pending').length;

  if (compact) {
    return (
      <CompactView
        messages={sortedMessages}
        pendingCount={pendingCount}
        urgentCount={urgentCount}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <h3 className="font-semibold text-gray-900">Executive Communications</h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {pendingCount} pending
              </span>
            )}
            {urgentCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
                {urgentCount} urgent
              </span>
            )}
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | ExecutiveRole)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">All Executives</option>
            {Object.entries(EXECUTIVE_INFO).map(([role, info]) => (
              <option key={role} value={role}>
                {info.icon} {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {sortedMessages.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <span className="text-3xl mb-2 block">🤝</span>
            <p className="text-sm">No executive communications yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Messages will appear here when executives collaborate.
            </p>
          </div>
        ) : (
          sortedMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isExpanded={expandedMessage === message.id}
              onToggle={() =>
                setExpandedMessage(expandedMessage === message.id ? null : message.id)
              }
              onAction={onMessageAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Individual message item
function MessageItem({
  message,
  isExpanded,
  onToggle,
  onAction,
}: {
  message: ExecutiveMessage;
  isExpanded: boolean;
  onToggle: () => void;
  onAction?: (messageId: string, action: 'read' | 'action') => void;
}) {
  const fromInfo = EXECUTIVE_INFO[message.fromExecutive];
  const toInfo = message.toExecutive === 'all' ? null : EXECUTIVE_INFO[message.toExecutive];

  const timeAgo = getTimeAgo(message.timestamp);

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
        message.status === 'pending' ? 'bg-blue-50/30' : ''
      }`}
      onClick={onToggle}
    >
      {/* Message Header */}
      <div className="flex items-start gap-3">
        {/* From Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: fromInfo.color + '20' }}
        >
          {fromInfo.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* From/To Line */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">
              {message.fromExecutive}
            </span>
            <span className="text-gray-400">→</span>
            {toInfo ? (
              <span
                className="font-medium"
                style={{ color: toInfo.color }}
              >
                {message.toExecutive}
              </span>
            ) : (
              <span className="text-gray-500">All Executives</span>
            )}
            <span className="text-gray-400 text-xs ml-auto">{timeAgo}</span>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">{TYPE_ICONS[message.type]}</span>
            <p className="text-sm font-medium text-gray-800 truncate">
              {message.subject}
            </p>
            <span
              className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                PRIORITY_STYLES[message.priority]
              }`}
            >
              {message.priority}
            </span>
          </div>

          {/* Preview (collapsed) */}
          {!isExpanded && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {message.content}
            </p>
          )}

          {/* Full Content (expanded) */}
          {isExpanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Actions */}
              {message.status === 'pending' && onAction && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(message.id, 'read');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Mark as Read
                  </button>
                  {message.type === 'request' || message.type === 'approval' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(message.id, 'action');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Take Action
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {message.status === 'pending' && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}

// Compact view for sidebar/header
function CompactView({
  messages,
  pendingCount,
  urgentCount,
}: {
  messages: ExecutiveMessage[];
  pendingCount: number;
  urgentCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <span>🔗</span>
        <span className="text-sm text-gray-300">Comms</span>
        {pendingCount > 0 && (
          <span
            className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
              urgentCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'
            }`}
          >
            {pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h4 className="font-semibold text-gray-900">Executive Communications</h4>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {messages.slice(0, 5).map((msg) => {
                const fromInfo = EXECUTIVE_INFO[msg.fromExecutive];
                return (
                  <div key={msg.id} className="px-4 py-2 hover:bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{fromInfo.icon}</span>
                      <span>{msg.fromExecutive}</span>
                      <span>→</span>
                      <span>{msg.toExecutive}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{msg.subject}</p>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  No communications yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Export types for use in other components
export type { ExecutiveMessage };
