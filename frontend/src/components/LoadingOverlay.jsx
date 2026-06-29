import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaSearchPlus, FaRobot, FaClipboardCheck, FaGlobeAmericas } from 'react-icons/fa';

export default function LoadingOverlay() {
  const [step, setStep] = useState(0);

  const steps = [
    { text: 'Targeting landing page URL and parsing HTML structure...', icon: <FaGlobeAmericas className="text-blue-400" /> },
    { text: 'Scraping page layout, primary CTAs, and pricing options...', icon: <FaSearchPlus className="text-accentNeon" /> },
    { text: 'Structuring advertising messaging and assets...', icon: <FaClipboardCheck className="text-amber-400" /> },
    { text: 'Running LangChain GPT-4 reasoning pipeline to identify mismatches...', icon: <FaRobot className="text-accentPurple" /> },
    { text: 'Generating conversion rate optimization report and recommendations...', icon: <FaSpinner className="text-rose-400 animate-spin" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4500); // Progress through steps every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center card-gradient rounded-3xl min-h-[350px] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-72 h-72 bg-accentNeon/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative mb-8">
        {/* Glowing ring animation */}
        <div className="absolute -inset-4 bg-gradient-to-r from-accentNeon via-accentPurple to-rose-500 rounded-full blur opacity-40 animate-spin" style={{ animationDuration: '6s' }}></div>
        <div className="relative bg-darkBg p-6 rounded-full border border-white/10 shadow-2xl flex items-center justify-center w-24 h-24">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-4xl text-accentNeon"
          >
            {steps[step].icon}
          </motion.div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3">Analyzing ad-to-page matching fit</h3>
      
      <div className="max-w-md mx-auto space-y-4">
        {/* Loading Description */}
        <p className="text-sm text-slate-400 min-h-[40px] transition-all duration-300">
          {steps[step].text}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-accentNeon via-accentPurple to-rose-500 h-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === step 
                  ? 'bg-accentNeon w-5' 
                  : idx < step 
                    ? 'bg-emerald-600/60' 
                    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
