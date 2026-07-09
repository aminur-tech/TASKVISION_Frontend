'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, loading, error } = useAuthStore();

  // Toggle between Login and Sign Up views
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Field States
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login({ username: formData.username, password: formData.password });
      if (success) router.replace('/tasks');
    } else {
      const success = await register(formData);
      if (success) {
        setIsLogin(true); // Flip over to login cleanly upon success
        setFormData({ username: '', email: '', password: '' });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 font-sans items-center justify-center">
      <div className="flex w-full max-w-7xl min-h-screen lg:min-h-[85vh] lg:my-8 lg:mx-4 rounded-2xl overflow-hidden lg:border lg:border-slate-900 bg-slate-950">

        {/* LEFT SIDE: Visual Content Box (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 border-r border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="flex items-center gap-2 relative z-10">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              TASKVISION
            </span>
          </div>

          <div className="space-y-6 relative z-10 max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight leading-none text-white">
              The Ultimate Canvas for Productivity.
            </h1>
            <p className="text-slate-400 text-lg">
              Manage multi-tier kanban operations and build semantic deep learning annotation masks inside a single environment.
            </p>
          </div>

          <p className="text-xs text-slate-500 relative z-10">
            &copy; {new Date().getFullYear()} TaskVision Inc. Powered by Next.js & Django.
          </p>
        </div>

        {/* RIGHT SIDE: Interactive Dynamic Form Layer */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-8 md:p-12 relative my-auto">
          
          {/* Mobile-Only Header Brand Branding Element */}
          <div className="flex lg:hidden items-center gap-2 mb-8 select-none">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <ShieldCheck size={18} />
            </div>
            <span className="text-sm font-bold tracking-widest text-slate-200">
              TASKVISION
            </span>
          </div>

          <div className="w-full max-w-md p-5 xs:p-8 rounded-2xl bg-slate-900/40 sm:bg-slate-900/50 border border-slate-900 sm:border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="space-y-2 text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-[280px] sm:max-w-none mx-auto">
                {isLogin ? 'Access your dashboard configuration' : 'Get started with your free workspace today'}
              </p>
            </div>

            {/* PRO-LEVEL DEMO CREDENTIALS TRIGGER */}
            <div className="mb-5 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isLogin) {
                    setFormData({
                      username: 'aminur_pro',
                      email: '',
                      password: '12345678'
                    });
                  } else {
                    setFormData({
                      username: 'aminur_pro',
                      email: 'aminurrahman9793@gmail.com',
                      password: '12345678'
                    });
                  }
                }}
                className="group relative flex items-center justify-center gap-2 px-4 py-2.5 w-full text-xs font-mono font-medium tracking-wider text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 active:scale-[0.99] border border-dashed border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all select-none touch-manipulation"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Quick Inject Demo Workspace
              </button>
            </div>

            {error && (
              <div className="p-3.5 mb-5 text-xs sm:text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl leading-relaxed animate-in fade-in zoom-in-95 duration-150">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-0.5">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="alex_mercer"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition text-sm text-slate-100 placeholder:text-slate-700 appearance-none"
                  />
                </div>
              </div>

              {/* Email field (Only rendered on dynamic Registration view) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-0.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition text-sm text-slate-100 placeholder:text-slate-700 appearance-none"
                    />
                  </div>
                </div>
              )}

              {/* Password input section */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-0.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition text-sm text-slate-100 placeholder:text-slate-700 appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 -mr-1 touch-manipulation"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all text-sm select-none touch-manipulation"
              >
                {loading ? 'Processing Transaction...' : isLogin ? 'Authenticate Workspace' : 'Initialize Account'}
              </button>
            </form>

            {/* Toggle Button */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  useAuthStore.setState({ error: null });
                }}
                className="text-xs sm:text-sm text-slate-400 hover:text-slate-300 transition-colors py-1 px-2 touch-manipulation"
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account? <span className="text-indigo-400 font-medium">Sign up</span>
                  </>
                ) : (
                  <>
                    Already configured? <span className="text-indigo-400 font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Footer Copyright Notice */}
          <p className="text-[10px] text-slate-600 mt-8 lg:hidden">
            &copy; {new Date().getFullYear()} TaskVision Inc.
          </p>
        </div>
      </div>
    </div>
  );
}