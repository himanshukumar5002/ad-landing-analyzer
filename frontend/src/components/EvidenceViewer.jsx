import React from 'react';
import { FaAd, FaLink, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function EvidenceViewer({ adText, landingPageData }) {
  // Normalize landing page text to find matching keywords
  const getLandingPageCorpus = () => {
    if (!landingPageData) return '';
    return Object.values(landingPageData)
      .map(val => (typeof val === 'string' ? val.toLowerCase() : JSON.stringify(val).toLowerCase()))
      .join(' ');
  };

  const corpus = getLandingPageCorpus();

  // Helper to split text by word-like tokens and highlight them
  const renderHighlightedAdCopy = () => {
    if (!adText) return <span className="text-slate-400">No ad text provided.</span>;

    // Regex to split by words but preserve punctuation and spacing
    const tokens = adText.split(/(\s+)/);

    return tokens.map((token, index) => {
      // Check if it's whitespace
      if (/^\s+$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      // Clean the word for lookup (remove punctuation)
      const cleanWord = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim().toLowerCase();
      
      // If it's empty after cleaning, just print token
      if (!cleanWord || cleanWord.length < 2 || ['and', 'the', 'for', 'with', 'but', 'you', 'your', 'our', 'this'].includes(cleanWord)) {
        return <span key={index} className="text-slate-300">{token}</span>;
      }

      // Check if word exists in landing page corpus
      const isMatch = corpus.includes(cleanWord);

      if (isMatch) {
        return (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/40 font-semibold cursor-help"
            title={`Matched: '${cleanWord}' was found in the landing page.`}
          >
            {token}
          </span>
        );
      } else {
        return (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 border-b border-rose-500/40 font-semibold cursor-help"
            title={`Mismatch: '${cleanWord}' was not found in the landing page.`}
          >
            {token}
          </span>
        );
      }
    });
  };

  return (
    <div className="w-full bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden shadow-xl">
      {/* Header banner */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Messaging Continuity & Evidence Viewer
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Matched Page Terms
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Missing Page Terms
          </span>
        </div>
      </div>

      {/* Split Screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        {/* Left Screen: Ad Copy */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-accentNeon uppercase tracking-widest">
            <FaAd className="text-base" />
            <span>Advertisement creative</span>
          </div>
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-white/5 min-h-[220px] max-h-[300px] overflow-y-auto leading-relaxed text-sm">
            {renderHighlightedAdCopy()}
          </div>
        </div>

        {/* Right Screen: Landing Page Components */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-accentPurple uppercase tracking-widest">
            <FaLink className="text-sm" />
            <span>Parsed Landing Page Copy</span>
          </div>

          <div className="bg-slate-900/40 rounded-2xl p-5 border border-white/5 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3.5 text-xs">
            {landingPageData ? (
              <>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Page Title</span>
                  <span className="text-slate-200">{landingPageData.title}</span>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Hero Heading (H1)</span>
                  <span className="text-slate-200">{landingPageData.heroHeading}</span>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Subheading</span>
                  <span className="text-slate-200">{landingPageData.subheading}</span>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Primary CTA Buttons</span>
                  <span className="text-slate-200">{landingPageData.cta}</span>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Pricing & Discounts</span>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Price: {landingPageData.pricing}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Promo: {landingPageData.discount}</span>
                  </div>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Product Description snippet</span>
                  <p className="text-slate-300 leading-normal line-clamp-3">{landingPageData.productDescription}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Shipping & Return Terms</span>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                    <div>• Shipping: {landingPageData.shipping}</div>
                    <div>• Guarantee: {landingPageData.refundPolicy}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 py-12">
                No landing page data loaded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
