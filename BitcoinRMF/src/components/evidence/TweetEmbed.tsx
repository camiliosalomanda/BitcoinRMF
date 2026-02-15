'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useRef, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';

interface TweetEmbedProps {
  url: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

let widgetScriptLoaded = false;

function loadWidgetScript() {
  if (widgetScriptLoaded) return;
  widgetScriptLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://platform.twitter.com/widgets.js';
  script.async = true;
  document.body.appendChild(script);
}

export default function TweetEmbed({ url }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['oembed', url],
    queryFn: () =>
      apiClient<{ html: string }>('/api/x/oembed', {
        params: { url },
      }),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  useEffect(() => {
    if (data?.html) {
      loadWidgetScript();
      // Give the DOM time to render, then hydrate
      const timer = setTimeout(() => {
        if (window.twttr && containerRef.current) {
          window.twttr.widgets.load(containerRef.current);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data?.html]);

  if (isLoading) {
    return (
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-800 rounded w-full mb-2" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
      </div>
    );
  }

  if (isError || !data?.html) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 hover:border-[#f7931a]/30 transition-colors"
      >
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">X_POST</span>
        <span className="text-sm text-gray-400 flex-1 truncate">{url}</span>
        <ExternalLink size={14} className="text-gray-600" />
      </a>
    );
  }

  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(data.html, {
      ALLOWED_TAGS: ['blockquote', 'a', 'p', 'br', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'rel', 'target', 'class', 'lang', 'dir', 'data-theme'],
    });
  }, [data.html]);

  return (
    <div
      ref={containerRef}
      className="tweet-embed [&_blockquote]:!border-[#2a2a3a] [&_blockquote]:!bg-transparent"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
