'use client';

import { Twitter } from 'lucide-react';

interface ShareToXButtonProps {
  text: string;
  url?: string;
  hashtags?: string[];
}

export default function ShareToXButton({ text, url, hashtags }: ShareToXButtonProps) {
  const params = new URLSearchParams({ text });
  if (url) {
    params.set('url', url);
  }
  if (hashtags?.length) {
    params.set('hashtags', hashtags.join(','));
  }

  return (
    <a
      href={`https://x.com/intent/tweet?${params.toString()}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-[#2a2a3a] rounded-lg hover:text-sky-400 hover:border-sky-400/30 transition-colors"
      title="Share to X"
    >
      <Twitter size={14} />
      Share
    </a>
  );
}
