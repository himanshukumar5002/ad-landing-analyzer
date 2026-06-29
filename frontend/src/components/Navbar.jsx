import React from 'react';
import { FaGithub, FaAward } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-darkBg/75 border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Branding */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accentNeon to-accentPurple rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-darkBg p-2 rounded-lg text-accentNeon">
              <FaAward className="text-xl animate-pulse" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
            AdMatch<span className="text-accentNeon font-medium">.ai</span>
          </span>
        </div>

        {/* Action Button */}
        <div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <FaGithub className="text-lg" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
