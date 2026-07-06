"use client"

import { FaLinkedin, FaSquareGithub, FaSquareTwitter } from "react-icons/fa6";


export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 xl:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                A
              </div>
              <span className="text-md font-semibold text-white tracking-tight">TaskApp</span>
            </div>
            <p className="text-sm max-w-xs">
              Streamlining annotation architectures and task scheduling pipelines around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><FaSquareTwitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><FaSquareGithub className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><FaLinkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Product</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support System</a></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Stay Updated</h3>
              <p className="mt-4 text-sm">Get technical Changelogs delivered straight to your box.</p>
              <form className="mt-4 flex max-w-md gap-2">
                <input 
                  type="email" 
                  required 
                  placeholder="you@domain.com" 
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button type="submit" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Row bar */}
        <div className="mt-12 border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} TaskApp Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}