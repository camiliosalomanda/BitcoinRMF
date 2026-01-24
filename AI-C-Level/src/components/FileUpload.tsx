'use client';

/**
 * File Upload Component
 * Drag-and-drop file upload for executive analysis
 */

import React, { useState, useRef, useCallback } from 'react';
import { ExecutiveRole } from '@/types/executives';

interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: string;
  uploadedAt: string;
  path: string;
}

interface FileUploadProps {
  executive?: ExecutiveRole;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  compact?: boolean;
}

// File type icons
const FILE_ICONS: Record<string, string> = {
  document: '📄',
  spreadsheet: '📊',
  image: '🖼️',
  presentation: '📽️',
  default: '📎',
};

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  executive,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  compact = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Upload a single file
  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append('file', file);
    if (executive) {
      formData.append('executive', executive);
    }

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

      const data = await response.json();
      return data.file;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      return null;
    } finally {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  // Handle file selection
  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    // Check max files
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    for (const file of fileArray) {
      const uploaded = await uploadFile(file);
      if (uploaded) {
        setUploadedFiles((prev) => [...prev, uploaded]);
        onUploadComplete?.(uploaded);
      }
    }

    setIsUploading(false);
  };

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const { files } = e.dataTransfer;
      if (files?.length) {
        handleFiles(files);
      }
    },
    [uploadedFiles.length, maxFiles]
  );

  // Handle click to select
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files?.length) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  // Remove uploaded file
  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Get file icon
  const getFileIcon = (category: string) => {
    return FILE_ICONS[category] || FILE_ICONS.default;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact upload button */}
        <button
          onClick={handleClick}
          disabled={isUploading || uploadedFiles.length >= maxFiles}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Attach File
        </button>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg text-sm"
              >
                <span>{getFileIcon(file.category)}</span>
                <span className="max-w-[150px] truncate">{file.originalName}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp,.ppt,.pptx"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp,.ppt,.pptx"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDragging ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <svg
              className={`w-6 h-6 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-gray-700 font-medium">
              {isDragging ? 'Drop files here' : 'Drag and drop files, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, Word, Excel, Images, PowerPoint up to 20MB
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload progress */}
      {Object.entries(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-700 truncate">{name}</p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">{getFileIcon(file.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.category}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File type hints */}
      {executive && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Recommended for {executive}:</span>{' '}
          {executive === 'CFO' && 'Financial statements, P&L reports, balance sheets, budgets'}
          {executive === 'CMO' && 'Marketing reports, campaign data, brand assets, analytics'}
          {executive === 'COO' && 'Process documents, operational data, inventory reports'}
          {executive === 'CHRO' && 'Resumes, org charts, HR policies, performance reviews'}
          {executive === 'CTO' && 'Technical specs, architecture diagrams, security audits'}
          {executive === 'CCO' && 'Compliance docs, audit reports, policy documents'}
        </div>
      )}
    </div>
  );
}
