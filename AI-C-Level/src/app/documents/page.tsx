'use client';

/**
 * Documents Page
 * Professional dark theme - manage generated documents
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ExecutiveRole } from '@/types/executives';
import { useDocumentsStore, downloadDocument, GeneratedDocument } from '@/lib/documentsStore';

const EXECUTIVE_INFO: Record<ExecutiveRole | 'boardroom', { color: string; name: string; gradient: string }> = {
  CFO: { color: '#10B981', name: 'Alex (CFO)', gradient: 'from-emerald-500 to-teal-500' },
  CMO: { color: '#8B5CF6', name: 'Jordan (CMO)', gradient: 'from-violet-500 to-purple-500' },
  COO: { color: '#F59E0B', name: 'Morgan (COO)', gradient: 'from-amber-500 to-orange-500' },
  CHRO: { color: '#EC4899', name: 'Taylor (CHRO)', gradient: 'from-pink-500 to-rose-500' },
  CTO: { color: '#3B82F6', name: 'Riley (CTO)', gradient: 'from-blue-500 to-indigo-500' },
  CCO: { color: '#6366F1', name: 'Casey (CCO)', gradient: 'from-indigo-500 to-violet-500' },
  boardroom: { color: '#0EA5E9', name: 'Boardroom', gradient: 'from-cyan-500 to-blue-500' },
};

const ExecutiveIcons: Record<ExecutiveRole | 'boardroom', React.ReactNode> = {
  CFO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CMO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  COO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CHRO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CTO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  CCO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  boardroom: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};

const FileTypeIcons: Record<string, React.ReactNode> = {
  markdown: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  csv: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  json: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  txt: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
};

function DocumentCard({ doc, onView, onDownload, onDelete }: { 
  doc: GeneratedDocument;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const execInfo = EXECUTIVE_INFO[doc.executive];
  const createdAt = typeof doc.createdAt === 'string' ? new Date(doc.createdAt) : doc.createdAt;

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${execInfo.gradient}`}
            style={{ boxShadow: `0 4px 12px ${execInfo.color}30` }}
          >
            {FileTypeIcons[doc.fileType] || FileTypeIcons.txt}
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">{doc.filename}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: execInfo.color }}>
                  {ExecutiveIcons[doc.executive]}
                </span>
                {execInfo.name}
              </span>
              <span>•</span>
              <span>{createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <span className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded-lg border border-white/10 uppercase tracking-wide">
          {doc.fileType}
        </span>
      </div>
      
      {doc.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{doc.description}</p>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DocumentViewer({ doc, onClose }: { doc: GeneratedDocument; onClose: () => void; }) {
  const execInfo = EXECUTIVE_INFO[doc.executive];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${execInfo.gradient}`}
            >
              {ExecutiveIcons[doc.executive]}
            </div>
            <div>
              <h3 className="font-medium text-white">{doc.filename}</h3>
              <p className="text-xs text-gray-500">{execInfo.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-white/[0.02] rounded-xl p-4 border border-white/5">{doc.content}</pre>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={() => downloadDocument(doc)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { documents, removeDocument } = useDocumentsStore();
  const [filter, setFilter] = useState<'all' | ExecutiveRole | 'boardroom'>('all');
  const [viewingDoc, setViewingDoc] = useState<GeneratedDocument | null>(null);

  const filteredDocs = filter === 'all' ? documents : documents.filter(d => d.executive === filter);
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
    const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#0a0f1a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">Documents</h1>
                <p className="text-sm text-gray-500">Executive-generated files and reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{documents.length} documents</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-gray-500">Filter by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              All
            </button>
            {(Object.keys(EXECUTIVE_INFO) as (ExecutiveRole | 'boardroom')[]).map((exec) => {
              const info = EXECUTIVE_INFO[exec];
              return (
                <button
                  key={exec}
                  onClick={() => setFilter(exec)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === exec 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="w-4 h-4 rounded flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                    {ExecutiveIcons[exec]}
                  </span>
                  {exec === 'boardroom' ? 'Boardroom' : exec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents Grid */}
        {sortedDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Documents are generated when executives create reports, analyses, or exports. Start a conversation to generate your first document.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onView={() => setViewingDoc(doc)}
                onDownload={() => downloadDocument(doc)}
                onDelete={() => removeDocument(doc.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
}
