import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import InputForm from '../components/InputForm';
import LoadingOverlay from '../components/LoadingOverlay';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaInfoCircle } from 'react-icons/fa';

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
        // For multiple ads, concatenate them to display or represent as primary ad text in split viewer
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
    <div className="min-h-screen bg-darkBg text-slate-100 hero-gradient flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-accentNeon/10 text-accentNeon border border-accentNeon/20 uppercase tracking-widest">
              AI Conversion Audit Pipeline
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white"
          >
            Bridge the Gap Between <br />
            <span className="bg-gradient-to-r from-accentNeon via-teal-400 to-accentPurple bg-clip-text text-transparent">
              Ad Click & Conversion
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Instantly audit how well your landing page satisfies the promises made in your ad copies. 
            Identify cognitive friction, messaging mismatches, and discover actionable CRO improvements.
          </motion.p>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1">
          <AnimatePresence mode="wait">
            {/* 1. Analyzing Loading Screen */}
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

            {/* 2. Error Display Container */}
            {!isAnalyzing && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto card-gradient border border-rose-500/20 bg-rose-950/20 rounded-3xl p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                  <FaExclamationTriangle className="text-2xl" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Pipeline Execution Error</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">{error}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    Modify Form
                  </button>
                  <button
                    onClick={() => handleStartAnalysis({ mode: currentMode, adText: currentAdText, landingUrl: currentLandingUrl })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accentRose to-red-500 hover:shadow-lg text-white transition-all flex items-center gap-2"
                  >
                    <FaRedo className="text-xs" />
                    <span>Retry Pipeline</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. Input Form Screen */}
            {!isAnalyzing && !error && !result && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <InputForm onStartAnalysis={handleStartAnalysis} isAnalyzing={isAnalyzing} />
              </motion.div>
            )}

            {/* 4. Results Dashboard Screen */}
            {!isAnalyzing && !error && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Reset Bar */}
                <div className="flex justify-between items-center max-w-5xl mx-auto border-b border-white/5 pb-4">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <FaInfoCircle className="text-accentNeon" />
                    Report generated in real-time.
                  </span>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 transition-all"
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
