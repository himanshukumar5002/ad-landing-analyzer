import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import InputForm from '../components/InputForm';
import LoadingOverlay from '../components/LoadingOverlay';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, FaRedo, FaServer, FaCheckCircle, 
  FaRobot, FaBolt, FaShieldAlt, FaChartLine, FaUserCheck 
} from 'react-icons/fa';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [currentAdText, setCurrentAdText] = useState('');
  const [currentLandingUrl, setCurrentLandingUrl] = useState('');
  const [currentMode, setCurrentMode] = useState('single');

  const handleStartAnalysis = async (data) => {
    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setCurrentLandingUrl(data.landingUrl);
    setCurrentMode(data.mode);

    try {
      if (data.mode === 'single') {
        setCurrentAdText(data.adText);
        const analysisResult = await apiService.analyzeFit(data.adText, data.landingUrl);
        setResult(analysisResult);
      } else {
        setCurrentAdText(data.adTexts.join(' \nAND\n '));
        const analysisResult = await apiService.analyzeMultiple(data.adTexts, data.landingUrl);
        setResult(analysisResult);
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.detail || err.message;
      
      if (serverMessage.includes('timeout') || err.code === 'ECONNABORTED') {
        setError('The request timed out. This often happens because the landing page scraping took too long or OpenAI API experienced latency. Please try again.');
      } else if (serverMessage.includes('URL') || serverMessage.includes('scraped')) {
        setError(`Scraping Failed: We couldn't fetch content from the provided URL. Please verify that the website is online and public, or try another URL.`);
      } else {
        setError(`Analysis Failed: ${serverMessage}. Make sure the backend server is running and your API keys are configured properly.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setCurrentAdText('');
    setCurrentLandingUrl('');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-800 flex flex-col relative grid-bg overflow-x-hidden">
      {/* Curved background vector effect like the screenshot */}
      <div className="absolute top-0 left-0 w-full h-[550px] hero-glow pointer-events-none z-0"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-12 z-10 relative">
        
        {/* 1. Hero Title & Subtitle exactly matching screenshot style */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-tight text-slate-700 font-light"
          >
            Smart Ads. <span className="font-extrabold text-slate-900">Real Results.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Audit and optimize every ad creative. Match your messaging, manage budget allocation, and drive conversion results in one single dashboard.
          </motion.p>
        </div>

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* Analyzing Loading Screen */}
            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto"
              >
                <LoadingOverlay />
              </motion.div>
            )}

            {/* Error Display Container */}
            {!isAnalyzing && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto card-gradient border border-rose-200/50 bg-rose-50 rounded-3xl p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-200/30">
                  <FaExclamationTriangle className="text-2xl animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Pipeline Execution Error</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">{error}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                  >
                    Modify Form
                  </button>
                  <button
                    onClick={() => handleStartAnalysis({ mode: currentMode, adText: currentAdText, landingUrl: currentLandingUrl })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-lg text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FaRedo className="text-xs" />
                    <span>Retry Pipeline</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Input Form Screen */}
            {!isAnalyzing && !error && !result && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <InputForm onStartAnalysis={handleStartAnalysis} isAnalyzing={isAnalyzing} />

                {/* 2. Feature badges mirroring screenshot structure at the bottom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8 border-t border-slate-200/60 relative">
                  <div className="flex flex-col items-center text-center space-y-4 p-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-800 text-3xl">
                      <FaShieldAlt />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Media Buying Partner</h4>
                      <p className="text-xs text-slate-400 max-w-[220px]">Certified conversion optimization standards for target delivery.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 p-4 border-y md:border-y-0 md:border-x border-slate-200/60">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-800 text-3xl">
                      <FaChartLine />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Precision Budgeting</h4>
                      <p className="text-xs text-slate-400 max-w-[220px]">Identify copy alignment errors to reduce CPC click waste.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 p-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-800 text-3xl">
                      <FaUserCheck />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Trusted Ad Audits</h4>
                      <p className="text-xs text-slate-400 max-w-[220px]">Expert continuity scanner to verify user click expectations.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Dashboard Screen */}
            {!isAnalyzing && !error && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Reset Bar */}
                <div className="flex justify-between items-center max-w-5xl mx-auto border-b border-slate-200 pb-4">
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Audit Scan Complete
                  </span>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all cursor-pointer hover:scale-105"
                  >
                    New Analysis
                  </button>
                </div>

                <Dashboard 
                  result={result} 
                  adText={currentAdText} 
                  landingUrl={currentLandingUrl} 
                  mode={currentMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
