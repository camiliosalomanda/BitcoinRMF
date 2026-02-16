'use client';

import { useRef, useState, useCallback, useEffect, type TextareaHTMLAttributes } from 'react';
import { useMentionSearch } from '@/hooks/useMentionSearch';
import { CommentAuthor } from '@/types';
import { Loader2 } from 'lucide-react';

// Match @query at end of text-before-cursor (start of line or after whitespace)
const MENTION_REGEX = /(?:^|\s)@(\w{0,15})$/;

interface MentionTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function MentionTextarea({ value, onChange, ...rest }: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading, search, clear } = useMentionSearch();

  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Detect @mention trigger on every input
  const detectMention = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = value.slice(0, textarea.selectionStart);
    const match = textBeforeCursor.match(MENTION_REGEX);

    if (match) {
      const query = match[1]; // text after @
      setMentionQuery(query);
      setActiveIndex(0);
      search(query);
      positionDropdown(textBeforeCursor);
    } else {
      setMentionQuery(null);
      clear();
    }
  }, [value, search, clear]);

  useEffect(() => {
    detectMention();
  }, [detectMention]);

  // Position dropdown using mirror div technique
  function positionDropdown(textBeforeCursor: string) {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    // Copy textarea styles to mirror
    const computed = window.getComputedStyle(textarea);
    const stylesToCopy = [
      'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
      'wordSpacing', 'textIndent', 'paddingTop', 'paddingRight', 'paddingBottom',
      'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth',
      'borderLeftWidth', 'boxSizing', 'whiteSpace', 'wordWrap', 'overflowWrap',
    ] as const;

    for (const prop of stylesToCopy) {
      mirror.style.setProperty(
        prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
        computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase())
      );
    }
    mirror.style.width = `${textarea.offsetWidth}px`;
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';

    // Find the @ position in text
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const textUpToAt = textBeforeCursor.slice(0, atIndex);

    // Put text up to @ in mirror, then measure a span at @
    mirror.innerHTML = '';
    const textNode = document.createTextNode(textUpToAt);
    const marker = document.createElement('span');
    marker.textContent = '@';
    mirror.appendChild(textNode);
    mirror.appendChild(marker);

    const markerRect = marker.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    setDropdownPos({
      top: markerRect.bottom - textareaRect.top + textarea.scrollTop - textarea.scrollTop + 4,
      left: markerRect.left - textareaRect.left,
    });
  }

  // Insert the selected mention
  function insertMention(author: CommentAuthor) {
    const textarea = textareaRef.current;
    if (!textarea || mentionQuery === null) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    const before = value.slice(0, atIndex);
    const after = value.slice(cursorPos);
    const mention = `@${author.xUsername} `;
    const newValue = before + mention + after;

    // Fire a synthetic change event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, newValue);
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }

    // Also call onChange directly as a fallback for React controlled components
    const syntheticEvent = {
      target: { ...textarea, value: newValue },
      currentTarget: { ...textarea, value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(syntheticEvent);

    setMentionQuery(null);
    clear();

    // Restore cursor after mention
    requestAnimationFrame(() => {
      const newPos = atIndex + mention.length;
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
      textarea.focus();
    });
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || results.length === 0) {
      rest.onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertMention(results[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setMentionQuery(null);
        clear();
        break;
      default:
        rest.onKeyDown?.(e);
    }
  }

  // Click outside to dismiss
  useEffect(() => {
    if (mentionQuery === null) return;

    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMentionQuery(null);
        clear();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [mentionQuery, clear]);

  const showDropdown = mentionQuery !== null && (results.length > 0 || loading);

  return (
    <div ref={containerRef} className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />

      {/* Hidden mirror div for measuring @ position */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          overflow: 'hidden',
          height: 0,
        }}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute z-50 w-64 max-h-52 overflow-y-auto bg-[#16161e] border border-[#2a2a3a] rounded-lg shadow-xl"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {results.map((author, i) => (
            <button
              key={author.xId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent textarea blur
                insertMention(author);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-[#f7931a]/10 text-[#f7931a]'
                  : 'text-gray-300 hover:bg-[#1e1e2e]'
              }`}
            >
              {author.xProfileImage ? (
                <img
                  src={author.xProfileImage}
                  alt=""
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#2a2a3a] flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{author.xName}</div>
                <div className="truncate text-[10px] text-gray-500">@{author.xUsername}</div>
              </div>
            </button>
          ))}
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              Searching X...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
