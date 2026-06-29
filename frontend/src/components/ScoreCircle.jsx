import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreCircle({ score }) {
  // SVG properties for circle
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color/text
  let colorClass = 'from-accentNeon to-emerald-500';
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  let text = 'Excellent Fit';
  let textColor = 'text-accentNeon';

  if (score < 60) {
    colorClass = 'from-accentRose to-red-500';
    glowColor = 'rgba(244, 63, 94, 0.2)';
    text = 'Critical Mismatch';
    textColor = 'text-accentRose';
  } else if (score < 80) {
    colorClass = 'from-amber-400 to-amber-600';
    glowColor = 'rgba(245, 158, 11, 0.2)';
    text = 'Fair Alignment';
    textColor = 'text-amber-400';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: glowColor, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      ></div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-start" style={{ stopColor: score < 60 ? '#f43f5e' : score < 80 ? '#f59e0b' : '#10b981' }} />
              <stop offset="100%" className="stop-color-end" style={{ stopColor: score < 60 ? '#ef4444' : score < 80 ? '#d97706' : '#059669' }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Central Score Text */}
        <div className="absolute text-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl font-extrabold text-white tracking-tight"
          >
            {score}
          </motion.span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Score</span>
        </div>
      </div>

      <div className="text-center mt-4 z-10">
        <h4 className={`text-base font-bold tracking-wide ${textColor}`}>
          {text}
        </h4>
        <p className="text-xs text-slate-400 mt-1">Overall Match Score</p>
      </div>
    </div>
  );
}
