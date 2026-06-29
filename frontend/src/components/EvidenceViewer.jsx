import React from 'react';
import { FaAd, FaLink } from 'react-icons/fa';

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
    if (!adText) return <span className="text-slate-500">No ad copy provided.</span>;

    const tokens = adText.split(/(\s+)/);

    return tokens.map((token, index) => {
      if (/^\s+$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      const cleanWord = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim().toLowerCase();
      
      if (!cleanWord || cleanWord.length < 2 || ['and', 'the', 'for', 'with', 'but', 'you', 'your', 'our', 'this'].includes(cleanWord)) {
        return <span key={index} className="text-slate-400">{token}</span>;
      }

      const isMatch = corpus.includes(cleanWord);

      if (isMatch) {
        return (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/30 font-semibold cursor-help hover:bg-emerald-500/20 transition-colors"
            title={`Matched: '${cleanWord}' was found in the landing page.`}
          >
            {token}
          </span>
        );
      } else {
        return (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-rose-500/10 text-rose-400 border-b border-rose-500/30 font-semibold cursor-help hover:bg-rose-500/20 transition-colors"
            title={`Mismatch: '${cleanWord}' was not found in the landing page.`}
          >
            {token}
          </span>
        );
      }
    });
  };

  // Generate fake lines for scanner aesthetics
  const getLineNumbers = () => {
    if (!adText) return [1];
    const linesCount = Math.max(1, adText.split('\n').length);
    return Array.from({ length: linesCount + 3 }, (_, i) => i + 1);
  };

  return (
    <div className="w-full bg-slate-950/60 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 grid-bg opacity-[0.02] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Continuity Scanner Dashboard
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Matched Keywords
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Friction Words
          </span>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 relative z-10">
        
        {/* Left: Interactive Copy Scanner */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <FaAd className="text-base" />
            <span>Ad Creative Copy</span>
          </div>

          <div className="terminal-window rounded-2xl flex p-4 text-xs font-mono min-h-[250px] max-h-[300px] overflow-y-auto leading-relaxed relative">
            {/* Line numbers for tech feel */}
            <div className="text-slate-600 select-none text-right pr-4 border-r border-white/5 flex flex-col gap-0.5">
              {getLineNumbers().map(num => (
                <span key={num}>{num}</span>
              ))}
            </div>
            {/* Highlighter copy content */}
            <div className="pl-4 text-slate-300 flex-1 whitespace-pre-wrap">
              {renderHighlightedAdCopy()}
            </div>
          </div>
        </div>

        {/* Right: Parsed Landing Page */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <FaLink className="text-sm" />
            <span>Parsed Page Assets</span>
          </div>

          <div className="terminal-window rounded-2xl p-5 min-h-[250px] max-h-[300px] overflow-y-auto space-y-4 text-xs">
            {landingPageData ? (
              <>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Page Title Tag</span>
                  <span className="text-slate-200 font-medium">{landingPageData.title}</span>
                </div>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Primary Header (H1)</span>
                  <span className="text-slate-200 font-medium">{landingPageData.heroHeading}</span>
                </div>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Page Subtitle</span>
                  <span className="text-slate-300 leading-relaxed">{landingPageData.subheading}</span>
                </div>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Action CTA Elements</span>
                  <span className="text-emerald-400 font-semibold">{landingPageData.cta}</span>
                </div>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Price / Discounts</span>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">Price Points: {landingPageData.pricing}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">Offers: {landingPageData.discount}</span>
                  </div>
                </div>
                <div className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Main Product Copy</span>
                  <p className="text-slate-400 leading-relaxed line-clamp-3">{landingPageData.productDescription}</p>
                </div>
                <div className="last:border-b-0 last:pb-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Shipping & Return Guarantees</span>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                    <div>• Shipping: {landingPageData.shipping}</div>
                    <div>• Returns: {landingPageData.refundPolicy}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 py-12">
                No scraping data parsed.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
