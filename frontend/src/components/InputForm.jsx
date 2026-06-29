import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaFileImage, FaPlus, FaTrash, FaTimes, FaSearch, FaMagic, FaSpinner } from 'react-icons/fa';
import { apiService } from '../services/api';

export default function InputForm({ onStartAnalysis, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'multiple'
  const [adText, setAdText] = useState('');
  const [adTexts, setAdTexts] = useState(['']); // For multiple ads
  const [landingUrl, setLandingUrl] = useState('');
  
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const fileInputRef = useRef(null);

  // Add ad field in multiple mode
  const handleAddAdField = () => {
    if (adTexts.length < 5) {
      setAdTexts([...adTexts, '']);
    }
  };

  // Remove ad field in multiple mode
  const handleRemoveAdField = (index) => {
    if (adTexts.length > 1) {
      const updated = adTexts.filter((_, i) => i !== index);
      setAdTexts(updated);
    }
  };

  const handleMultipleAdChange = (index, value) => {
    const updated = [...adTexts];
    updated[index] = value;
    setAdTexts(updated);
  };

  // Handle OCR file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError('');

    try {
      const data = await apiService.uploadImage(file);
      if (activeTab === 'single') {
        setAdText(data.extracted_text);
      } else {
        // Find first empty or update the last field
        const updated = [...adTexts];
        const emptyIndex = updated.findIndex(t => !t.trim());
        if (emptyIndex !== -1) {
          updated[emptyIndex] = data.extracted_text;
        } else {
          updated.push(data.extracted_text);
        }
        setAdTexts(updated);
      }
    } catch (err) {
      console.error(err);
      setOcrError(err.response?.data?.detail || 'Failed to extract text from the image.');
    } finally {
      setIsOcrLoading(false);
      // Reset input value to allow uploading same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!landingUrl.trim()) return;

    if (activeTab === 'single') {
      if (!adText.trim()) return;
      onStartAnalysis({
        mode: 'single',
        adText: adText,
        landingUrl: landingUrl
      });
    } else {
      const filteredAds = adTexts.filter(t => t.trim());
      if (filteredAds.length === 0) return;
      onStartAnalysis({
        mode: 'multiple',
        adTexts: filteredAds,
        landingUrl: landingUrl
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="card-gradient rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accentNeon/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accentPurple/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tab Selection */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 w-fit mx-auto border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-accentNeon to-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Ad Match
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('multiple')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'multiple'
                ? 'bg-gradient-to-r from-accentPurple to-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Multiple Ads Cluster (Bonus)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ad Inputs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <FaMagic className={activeTab === 'single' ? 'text-accentNeon' : 'text-accentPurple'} />
                {activeTab === 'single' ? 'Advertisement Copy' : 'Advertisement Variations'}
              </label>
              
              {/* Image Upload Trigger */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  id="ad-image-upload"
                  disabled={isOcrLoading || isAnalyzing}
                />
                <label
                  htmlFor="ad-image-upload"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/10 transition-all duration-200 ${
                    isOcrLoading 
                      ? 'bg-white/5 text-slate-500 border-none pointer-events-none'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isOcrLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-accentNeon" />
                      <span>Reading Image...</span>
                    </>
                  ) : (
                    <>
                      <FaFileImage />
                      <span>OCR Screenshot</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Error Message for OCR */}
            <AnimatePresence>
              {ocrError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3 p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center justify-between"
                >
                  <span>{ocrError}</span>
                  <button type="button" onClick={() => setOcrError('')}>
                    <FaTimes />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Ad Inputs based on active tab */}
            {activeTab === 'single' ? (
              <textarea
                value={adText}
                onChange={(e) => setAdText(e.target.value)}
                placeholder="Paste your ad copy here (e.g. '🔥 50% OFF Running Shoes + Free Shipping Today')"
                rows={4}
                className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accentNeon/50 focus:ring-1 focus:ring-accentNeon/50 transition-all duration-200 text-sm"
                required
                disabled={isAnalyzing}
              />
            ) : (
              <div className="space-y-3">
                {adTexts.map((text, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleMultipleAdChange(idx, e.target.value)}
                      placeholder={`Ad variation #${idx + 1} (e.g. Price-focused or Luxury-focused)`}
                      className="flex-1 bg-slate-950/40 border border-white/10 rounded-2xl px-4 py-3.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accentPurple/50 focus:ring-1 focus:ring-accentPurple/50 transition-all duration-200 text-sm"
                      required
                      disabled={isAnalyzing}
                    />
                    {adTexts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdField(idx)}
                        className="p-3.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-950/50 hover:text-red-300 transition-colors"
                        disabled={isAnalyzing}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
                {adTexts.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddAdField}
                    className="flex items-center gap-2 text-xs font-bold text-accentPurple hover:text-purple-400 transition-colors py-1 px-2 border border-accentPurple/20 rounded-lg hover:bg-accentPurple/10"
                    disabled={isAnalyzing}
                  >
                    <FaPlus />
                    <span>Add Angle</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Landing Page Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <FaGlobe className={activeTab === 'single' ? 'text-accentNeon' : 'text-accentPurple'} />
              Landing Page URL
            </label>
            <input
              type="url"
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              placeholder="https://brand.com/shoes"
              className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-4 py-3.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accentNeon/50 focus:ring-1 focus:ring-accentNeon/50 transition-all duration-200 text-sm"
              required
              disabled={isAnalyzing}
            />
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isAnalyzing || isOcrLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white tracking-wide transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-accentNeon via-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-r from-accentPurple via-violet-500 to-indigo-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
            } ${isAnalyzing ? 'opacity-80 cursor-wait' : 'hover:scale-[1.01]'}`}
          >
            {isAnalyzing ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>Running Audit & Conversion Pipeline...</span>
              </>
            ) : (
              <>
                <FaSearch className="text-sm" />
                <span>Analyze Match Quality</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
