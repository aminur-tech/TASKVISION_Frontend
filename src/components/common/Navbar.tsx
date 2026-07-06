"use client";
import { useState, useSyncExternalStore } from 'react';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0  z-50  border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto w-full md:w-11/12 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              A
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">TaskApp</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/tasks">Tasks</NavLink>
            <NavLink href="/annotations">Annotations</NavLink>
          </div>

          {/* User Auth Action Group */}
          <div className="hidden md:flex items-center gap-4">
            {!isHydrated ? (
              <div className="h-9 w-24 rounded-xl bg-slate-800/70" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full bg-slate-900 p-1.5 pr-3 border border-white/[0.08] hover:border-white/20 transition-all text-sm text-slate-200"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <span>{user.username}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-slate-900 p-1 shadow-xl ring-1 ring-black/5">
                    <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
              
                <Link href="/auth" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          <a href="/dashboard" className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">Dashboard</a>
          <a href="/tasks" className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">Tasks</a>
          <a href="/annotations" className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">Annotations</a>
        </div>
      )}
    </nav>
  );
}