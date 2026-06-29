import React from 'react';
import { FaGithub, FaRocket } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Branding matching the user screenshot */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="text-slate-900 text-xl font-bold flex items-center justify-center">
            <FaRocket className="transform rotate-[15deg] group-hover:rotate-[45deg] transition-transform duration-300" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-800 font-sans">
            Admatch<span className="text-slate-400 font-medium">.Ai</span>
          </span>
        </div>

        {/* GitHub Link */}
        <div>
          <a
            href="https://github.com/himanshukumar5002/ad-landing-analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all duration-200 hover:scale-105"
          >
            <FaGithub className="text-sm" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
