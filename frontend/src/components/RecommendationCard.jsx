import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaLightbulb, FaExchangeAlt, FaHourglassHalf, FaTrophy, FaUserCheck } from 'react-icons/fa';

export default function RecommendationCard({ recommendation, index }) {
  const { title, description, impact, effort, confidence, priority, reason } = recommendation;

  // Formatting confidence
  const confidencePercent = typeof confidence === 'number' && confidence <= 1.0 
    ? Math.round(confidence * 100) 
    : confidence;

  // Styling maps
  const priorityColors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  const impactColors = {
    high: 'text-emerald-400 bg-emerald-500/5',
    medium: 'text-amber-400 bg-amber-500/5',
    low: 'text-slate-400 bg-slate-500/5'
  };

  const effortColors = {
    high: 'text-red-400 border-red-500/10',
    medium: 'text-amber-400 border-amber-500/10',
    low: 'text-emerald-400 border-emerald-500/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative bg-slate-900/60 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 shadow-lg group overflow-hidden"
    >
      {/* Index Badge */}
      <div className="absolute top-0 right-0 bg-white/5 text-[10px] font-bold text-slate-500 px-3 py-1.5 rounded-bl-xl border-l border-b border-white/5">
        #{index + 1}
      </div>

      {/* Header with Title and Priority */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pr-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg text-white">
            <FaLightbulb className="text-sm" />
          </div>
          <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
            {title}
          </h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityColors[priority.toLowerCase()] || 'bg-white/5 text-slate-400 border-white/10'}`}>
          {priority} Priority
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        {description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5 mb-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <FaTrophy className="text-[10px] text-accentNeon" />
            Impact
          </span>
          <span className={`font-bold ${impactColors[impact.toLowerCase()] || 'text-slate-300'}`}>
            {impact}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <FaHourglassHalf className="text-[10px] text-accentPurple" />
            Effort
          </span>
          <span className={`font-bold border-l-0 ${effortColors[effort.toLowerCase()] || 'text-slate-300'}`}>
            {effort}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <FaUserCheck className="text-[10px] text-accentNeon" />
            Confidence
          </span>
          <span className="font-bold text-emerald-400">
            {confidencePercent}%
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <FaExchangeAlt className="text-[10px] text-slate-500" />
            CRO Reason
          </span>
          <span className="font-medium text-slate-300 truncate">
            {reason.substring(0, 30)}...
          </span>
        </div>
      </div>

      {/* Reason block */}
      <div className="text-xs bg-white/5 border-l-2 border-accentNeon p-3 rounded-r-xl">
        <span className="font-bold text-slate-300 block mb-1">CRO Rationale:</span>
        <span className="text-slate-400 leading-normal">{reason}</span>
      </div>
    </motion.div>
  );
}
