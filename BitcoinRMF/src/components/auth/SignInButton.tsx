'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogOut, Twitter } from 'lucide-react';

interface SignInButtonProps {
  collapsed?: boolean;
}

export default function SignInButton({ collapsed = false }: SignInButtonProps) {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') {
    return (
      <div className="px-3 py-2">
        <div className="h-9 bg-[#2a2a3a] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? `@${session.user.xUsername}` : undefined}
        >
          {session.user.xProfileImage ? (
            <img
              src={session.user.xProfileImage}
              alt={session.user.xUsername || ''}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center text-xs text-[#f7931a] font-bold flex-shrink-0">
              {(session.user.xName || session.user.name || '?').charAt(0)}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {session.user.xName || session.user.name}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                @{session.user.xUsername}
              </p>
            </div>
          )}
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('twitter')}
      className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-[#f7931a]/10 border border-[#2a2a3a] hover:border-[#f7931a]/30 transition-all ${
        collapsed ? 'justify-center' : ''
      }`}
      title={collapsed ? 'Sign in with X' : undefined}
    >
      <Twitter size={16} className="text-white flex-shrink-0" />
      {!collapsed && (
        <span className="text-xs font-medium text-gray-300">Sign in with X</span>
      )}
    </button>
  );
}
