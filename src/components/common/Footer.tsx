"use client"

import { FaLinkedin, FaSquareGithub, FaSquareTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 md:px-1 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                A
              </div>
              <span className="text-md font-semibold text-white tracking-tight">TaskApp</span>
            </div>
            <p className="text-sm max-w-sm sm:max-w-md lg:max-w-xs leading-relaxed">
              Streamlining annotation architectures and task scheduling pipelines around the world.
            </p>
            <div className="flex space-x-4 pt-1">
              <a href="#" className="hover:text-white transition-colors p-1 -m-1" aria-label="Twitter"><FaSquareTwitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors p-1 -m-1" aria-label="GitHub"><FaSquareGithub className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors p-1 -m-1" aria-label="LinkedIn"><FaLinkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Product</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Resources</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors block py-0.5">Support System</a></li>
              </ul>
            </div>
            <div className="sm:col-span-3 md:col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Stay Updated</h3>
              <p className="mt-4 text-sm max-w-sm md:max-w-none">Get technical Changelogs delivered straight to your box.</p>
              <form className="mt-4 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  required 
                  placeholder="you@domain.com" 
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button type="submit" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 active:scale-95 transition-all shrink-0">
                  Join
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Row Bar */}
        <div className="mt-16 border-t border-white/[0.06] pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} TaskApp Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}