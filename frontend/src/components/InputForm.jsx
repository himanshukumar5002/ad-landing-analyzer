import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaFileImage, FaPlus, FaTrash, FaTimes, FaSearch, FaMagic, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa';
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
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none"></div>

        {/* Dynamic Glow Orbs */}
        <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          activeTab === 'single' ? 'bg-emerald-500/5' : 'bg-purple-500/5'
        }`}></div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 w-fit mx-auto border border-slate-200/60 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative cursor-pointer ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Single Ad Match
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('multiple')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative cursor-pointer ${
              activeTab === 'multiple'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Multiple Ads Cluster (Bonus)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Ad Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <FaMagic className={activeTab === 'single' ? 'text-emerald-400' : 'text-purple-400'} />
                {activeTab === 'single' ? 'Advertisement Copy' : 'Advertisement Variations'}
              </label>
            </div>

            {/* Error Message for OCR */}
            <AnimatePresence>
              {ocrError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center justify-between shadow-md"
                >
                  <span className="flex items-center gap-2">⚠️ {ocrError}</span>
                  <button type="button" onClick={() => setOcrError('')} className="hover:text-rose-800 text-rose-400 transition-colors">
                    <FaTimes />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Split Input & Image Upload Dropzone */}
            {activeTab === 'single' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left: Textarea Copy */}
                <div className="md:col-span-2">
                  <textarea
                    value={adText}
                    onChange={(e) => setAdText(e.target.value)}
                    placeholder="Paste your ad copy here (e.g. '🔥 50% OFF Running Shoes + Free Shipping Today')"
                    rows={6}
                    className="w-full h-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 text-sm leading-relaxed shadow-sm"
                    required
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Right: Upload screenshot dropzone */}
                <div className="flex flex-col">
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
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 group min-h-[150px] ${
                      isOcrLoading
                        ? 'border-emerald-500/20 bg-emerald-500/5 cursor-wait'
                        : 'border-slate-200 bg-slate-50 hover:border-emerald-500/40 hover:bg-white'
                    }`}
                  >
                    {isOcrLoading ? (
                      <div className="space-y-3">
                        <FaSpinner className="animate-spin text-3xl text-emerald-400 mx-auto" />
                        <span className="text-xs font-bold text-slate-400 block">AI Reading Screenshot...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FaCloudUploadAlt className="text-3xl text-slate-500 group-hover:text-emerald-400 transition-colors mx-auto group-hover:scale-110 duration-300" />
                        <span className="text-xs font-bold text-slate-300 block">OCR Image Upload</span>
                        <span className="text-[10px] text-slate-500 leading-normal block max-w-[150px] mx-auto">Drop screenshot here to extract copy text</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Multiple copy fields */}
            {activeTab === 'multiple' && (
              <div className="space-y-3">
                {adTexts.map((text, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleMultipleAdChange(idx, e.target.value)}
                      placeholder={`Ad Variation #${idx + 1} (e.g. Price-focused, Luxury angle, Speed angle)`}
                      className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 text-sm shadow-sm"
                      required
                      disabled={isAnalyzing}
                    />
                    {adTexts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdField(idx)}
                        className="p-3.5 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-950/50 hover:text-rose-300 transition-colors cursor-pointer"
                        disabled={isAnalyzing}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-4 items-center">
                  {adTexts.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddAdField}
                      className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors py-2 px-3 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 cursor-pointer"
                      disabled={isAnalyzing}
                    >
                      <FaPlus />
                      <span>Add Angle Variation</span>
                    </button>
                  )}
                  
                  {/* OCR trigger for multiple mode */}
                  <label
                    htmlFor="ad-image-upload"
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors py-2 px-3 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer"
                  >
                    <FaFileImage />
                    <span>Upload Image for OCR</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Landing Page Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <FaGlobe className={activeTab === 'single' ? 'text-emerald-400' : 'text-purple-400'} />
              Landing Page URL
            </label>
            <input
              type="url"
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              placeholder="https://brand.com/shoes"
              className={`w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200 text-sm shadow-sm ${
                activeTab === 'single' ? 'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50' : 'focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50'
              }`}
              required
              disabled={isAnalyzing}
            />
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isAnalyzing || isOcrLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white tracking-wide transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer btn-neon ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]'
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
