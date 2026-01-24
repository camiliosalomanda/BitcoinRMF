'use client';

/**
 * User Menu Component
 * Displays user info and sign out option
 */

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface UserMenuProps {
  isCollapsed?: boolean;
}

export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm"
          title={session.user.name || 'User'}
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-20">
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-gray-300 truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-20">
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
