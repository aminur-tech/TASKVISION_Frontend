"use client";
import { useState, useSyncExternalStore } from 'react';
import { Menu, X, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import NavLink from '../ui/NavLink';
import Link from 'next/link';

function useHydrated() {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};

      const timeoutId = window.setTimeout(callback, 0);
      return () => window.clearTimeout(timeoutId);
    },
    () => true,
    () => false
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isHydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto w-full md:w-11/12 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform select-none">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              A
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">TaskApp</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/tasks">Tasks</NavLink>
            <NavLink href="/annotations">Annotations</NavLink>
          </div>

          {/* User Auth Action Group (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {!isHydrated ? (
              <div className="h-9 w-24 rounded-xl bg-slate-800/40 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full bg-slate-900 p-1.5 pr-3 border border-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-200 select-none"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <span>{user.username}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-slate-900 p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link 
                      href="/settings" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 -mr-2 text-slate-400 hover:text-white active:scale-95 transition-transform touch-manipulation"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-slate-950 px-4 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Navigation Links Group */}
          <div className="space-y-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block rounded-xl px-3 py-2.5 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.06] transition-all">
              Dashboard
            </Link>
            <Link href="/tasks" onClick={() => setIsOpen(false)} className="block rounded-xl px-3 py-2.5 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.06] transition-all">
              Tasks
            </Link>
            <Link href="/annotations" onClick={() => setIsOpen(false)} className="block rounded-xl px-3 py-2.5 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.06] transition-all">
              Annotations
            </Link>
          </div>

          {/* User Section Line Separator & Account Control Block */}
          <div className="pt-4 border-t border-white/[0.06]">
            {!isHydrated ? (
              <div className="h-12 w-full rounded-xl bg-slate-800/40 animate-pulse" />
            ) : user ? (
              <div className="space-y-3.5">
                {/* Mobile Identity Tag */}
                <div className="flex items-center gap-3 px-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold text-white uppercase shrink-0">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{user.username}</span>
                    <span className="text-xs text-slate-500 truncate">Authenticated Account</span>
                  </div>
                </div>

                {/* Mobile Account Sub-actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    href="/settings" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-white/[0.06] px-4 py-3 text-sm font-medium text-slate-300 active:bg-white/[0.02] transition-colors touch-manipulation"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400 active:bg-rose-500/20 transition-colors touch-manipulation"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/10 active:scale-[0.99] transition-all touch-manipulation"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}