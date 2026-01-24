/**
 * Documents Store
 * Manages generated files and documents from executives
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExecutiveRole } from '@/types/executives';

export interface GeneratedDocument {
  id: string;
  filename: string;
  content: string;
  fileType: 'markdown' | 'csv' | 'json' | 'txt';
  executive: ExecutiveRole | 'boardroom';
  category: 'meeting-minutes' | 'report' | 'template' | 'analysis' | 'other';
  createdAt: Date;
  description?: string;
}

interface DocumentsState {
  documents: GeneratedDocument[];
  addDocument: (doc: Omit<GeneratedDocument, 'id' | 'createdAt'>) => string;
  removeDocument: (id: string) => void;
  getDocumentsByExecutive: (executive: ExecutiveRole | 'boardroom') => GeneratedDocument[];
  getDocumentById: (id: string) => GeneratedDocument | undefined;
  clearAllDocuments: () => void;
}

function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (doc) => {
        const id = generateId();
        const newDoc: GeneratedDocument = {
          ...doc,
          id,
          createdAt: new Date(),
        };
        set((state) => ({
          documents: [newDoc, ...state.documents],
        }));
        return id;
      },

      removeDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },

      getDocumentsByExecutive: (executive) => {
        return get().documents.filter((d) => d.executive === executive);
      },

      getDocumentById: (id) => {
        return get().documents.find((d) => d.id === id);
      },

      clearAllDocuments: () => {
        set({ documents: [] });
      },
    }),
    {
      name: 'bizai-documents',
    }
  )
);

// Helper function to download a document
export function downloadDocument(doc: GeneratedDocument): void {
  const mimeTypes: Record<string, string> = {
    markdown: 'text/markdown',
    csv: 'text/csv',
    json: 'application/json',
    txt: 'text/plain',
  };

  const blob = new Blob([doc.content], { type: mimeTypes[doc.fileType] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper function to copy content to clipboard
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}
