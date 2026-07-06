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
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 font-sans">

      <div className="mx-auto flex min-h-screen w-full max-w-7xl  mt-20 mb-10">


        {/* LEFT SIDE: Visual Content Box */}
        <div className="hidden lg:flex  flex-col justify-between w-1/2 p-12 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 border-r border-slate-800 relative overflow-hidden">
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
            &copy; 2026 TaskVision Inc. Powered by Next.js & Django.
          </p>
        </div>

        {/* RIGHT SIDE: Interactive Dynamic Form Layer */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-6 sm:p-12 relative">
          <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="space-y-2 text-center mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Access your dashboard configuration' : 'Get started with your free workspace today'}
              </p>
            </div>

            {/* --- PRO-LEVEL DEMO CREDENTIALS TRIGGER --- */}
            <div className="mb-6 flex flex-col items-center justify-center">
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
                className="group relative flex items-center justify-center gap-2 px-4 py-2 w-full text-xs font-mono font-medium tracking-wider text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 active:bg-indigo-500/20 border border-dashed border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition duration-150 ease-in-out"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Quick Inject Demo Workspace
              </button>
            </div>
            {/* ------------------------------------------- */}

            {error && (
              <div className="p-3 mb-6 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field used both for Login and Sign In */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="alex_mercer"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email field (Only rendered on dynamic Registration view) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alex@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm text-slate-100 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Password input section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm text-slate-100 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-150 text-sm"
              >
                {loading ? 'Processing Transaction...' : isLogin ? 'Authenticate Workspace' : 'Initialize Account'}
              </button>
            </form>

            {/* Toggle Button */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  useAuthStore.setState({ error: null }); // Clean out previous messages
                }}
                className="text-sm text-slate-400 "
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <span className="text-indigo-400">sign up</span>
                  </>
                ) : (
                  <>
                    Already configured?{' '}
                    <span className="text-indigo-400">sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}