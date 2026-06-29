import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserFriends, FaGift, FaHeading, FaEye, FaMousePointer, 
  FaShieldAlt, FaComments, FaDollarSign, FaListUl, FaQuestionCircle, 
  FaShippingFast, FaDesktop, FaChevronDown, FaChevronUp, FaInfoCircle, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import ScoreCircle from './ScoreCircle';
import RecommendationCard from './RecommendationCard';
import EvidenceViewer from './EvidenceViewer';

export default function Dashboard({ result, adText, landingUrl, mode }) {
  const [expandedCard, setExpandedCard] = useState(null);

  // If in Multiple Ads mode (Clustered view)
  if (result.clusters) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Ad Angle Clustering & Alignment Report
          </h2>
          <p className="text-sm text-slate-400">
            Analyzing landing page: <span className="text-slate-300 underline font-semibold">{landingUrl}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {result.clusters.map((cluster, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-gradient rounded-3xl p-6 border border-white/5 relative overflow-hidden glow-card-purple"
            >
              <div className="absolute top-0 right-0 px-4 py-2 bg-purple-500/10 border-b border-l border-white/5 rounded-bl-2xl">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Angle #{idx + 1}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{cluster.angle}</h3>
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">Cluster Ad Copies:</span>
                    <ul className="space-y-1.5 pl-1.5">
                      {cluster.ad_texts.map((text, i) => (
                        <li key={i} className="text-slate-300 italic border-l-2 border-purple-500/30 pl-3">"{text}"</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/5 w-fit min-w-[150px]">
                  <div className="text-left flex-1">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Match Score</span>
                    <span className={`text-3xl font-extrabold ${
                      cluster.overall_fit_score >= 80 ? 'text-emerald-400' : cluster.overall_fit_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {cluster.overall_fit_score}%
                    </span>
                  </div>
                  <div className="w-1.5 h-12 rounded bg-slate-800 relative overflow-hidden">
                    <div 
                      className={`w-full rounded absolute bottom-0 left-0 transition-all duration-1000 ${
                        cluster.overall_fit_score >= 80 ? 'bg-emerald-500' : cluster.overall_fit_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ height: `${cluster.overall_fit_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Cluster Analysis</h4>
                <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-2xl border border-white/5 leading-relaxed">
                  {cluster.analysis}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Tailored Adjustments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cluster.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{rec.title}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                          rec.priority.toLowerCase() === 'high' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-slate-800/40 text-slate-400 border-white/5'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal mb-3">{rec.description}</p>
                      <div className="flex gap-4 text-[9px] text-slate-500 font-bold uppercase">
                        <span>Impact: <span className="text-emerald-400">{rec.impact}</span></span>
                        <span>Effort: <span className="text-amber-400">{rec.effort}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Single Ad analysis layout mapping
  const categories = [
    { key: 'persona_match', title: 'Persona Match', icon: <FaUserFriends /> },
    { key: 'offer_match', title: 'Offer Match', icon: <FaGift /> },
    { key: 'headline_continuity', title: 'Headline Continuity', icon: <FaHeading /> },
    { key: 'visual_continuity', title: 'Visual Continuity', icon: <FaEye /> },
    { key: 'cta', title: 'CTA Consistency', icon: <FaMousePointer /> },
    { key: 'trust_signals', title: 'Trust Signals', icon: <FaShieldAlt /> },
    { key: 'social_proof', title: 'Social Proof & Reviews', icon: <FaComments /> },
    { key: 'pricing', title: 'Pricing Consistency', icon: <FaDollarSign /> },
    { key: 'benefits_match', title: 'Benefits Match', icon: <FaListUl /> },
    { key: 'objection_handling', title: 'Objection Handling', icon: <FaQuestionCircle /> },
    { key: 'shipping', title: 'Shipping Visibility', icon: <FaShippingFast /> },
    { key: 'above_fold', title: 'Above Fold Experience', icon: <FaDesktop /> },
  ];

  // Scoring styles helper
  const getScoreStyles = (score) => {
    if (score >= 80) return { 
      text: 'text-emerald-400', 
      bg: 'bg-emerald-500/5', 
      border: 'border-emerald-500/20', 
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
      barColor: 'bg-emerald-500' 
    };
    if (score >= 60) return { 
      text: 'text-amber-400', 
      bg: 'bg-amber-400/5', 
      border: 'border-amber-400/20', 
      badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20', 
      barColor: 'bg-amber-500' 
    };
    return { 
      text: 'text-rose-400', 
      bg: 'bg-rose-500/5', 
      border: 'border-rose-500/20', 
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', 
      barColor: 'bg-rose-500' 
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Top Section: circular score and executive summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <ScoreCircle score={result.overall_score} />
        
        {/* Summary Card */}
        <div className="md:col-span-2 card-gradient rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden glow-card">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <FaInfoCircle className="text-emerald-400" />
              Executive Audit Summary
            </span>
            <h3 className="text-xl font-extrabold text-white mb-3">Continuity Assessment Report</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>
          <div className="text-xs text-slate-400 border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
            <span>Target: <span className="text-slate-300 underline font-semibold">{landingUrl}</span></span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">PRO Audit</span>
          </div>
        </div>
      </div>

      {/* Grid of Dimension Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
            Continuous Audit Breakdown
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Click cards to expand recommendations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ key, title, icon }) => {
            const data = result[key];
            if (!data) return null;
            const style = getScoreStyles(data.score);
            const isExpanded = expandedCard === key;
            const isCritical = data.score < 60;

            return (
              <motion.div
                key={key}
                layout
                onClick={() => setExpandedCard(isExpanded ? null : key)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden card-gradient ${
                  isExpanded ? 'lg:col-span-2 border-white/20' : 'hover:border-white/10 hover:scale-[1.01]'
                } ${isCritical && !isExpanded ? 'mismatch-pulse' : ''}`}
              >
                {/* Decorative border highlight for critical */}
                {isCritical && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                )}

                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 text-slate-200">
                    <span className="text-lg text-emerald-400">{icon}</span>
                    <span className="font-bold text-sm tracking-wide">{title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${style.badge}`}>
                    {data.score}
                  </span>
                </div>

                {/* Match bar progress indicator */}
                <div className="w-full bg-slate-950/60 rounded-full h-1 overflow-hidden mt-3 mb-3">
                  <div className={`h-full rounded-full transition-all duration-1000 ${style.barColor}`} style={{ width: `${data.score}%` }}></div>
                </div>

                <p className={`text-xs text-slate-400 leading-normal ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                  <span className="font-semibold text-slate-300 block mb-0.5">Evidence:</span>
                  {data.evidence}
                </p>

                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 pt-4 border-t border-white/5 space-y-3"
                  >
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-amber-400 block mb-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-[10px]" />
                        Optimized Recommendation:
                      </span>
                      {data.recommendation}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                      <span>Scanner Confidence: <span className="text-emerald-400">{Math.round(data.confidence * 100)}%</span></span>
                      {isCritical && <span className="text-rose-400 flex items-center gap-1">⚠️ High Friction Point</span>}
                    </div>
                  </motion.div>
                )}

                <div className="absolute bottom-3 right-3 text-slate-600 text-xs">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
          Top 5 Implementation Improvements
        </h3>
        <div className="space-y-4">
          {result.top_recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} index={index} />
          ))}
        </div>
      </div>

      {/* Evidence Split-Screen Viewer */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
          Source Material Alignment
        </h3>
        <EvidenceViewer 
          adText={adText} 
          landingPageData={{
            title: result.headline_continuity?.evidence.substring(0, 150) || "Scraped Title",
            heroHeading: result.above_fold?.evidence.substring(0, 150) || "Scraped Heading",
            subheading: result.persona_match?.evidence.substring(0, 150) || "Scraped Description",
            cta: result.cta?.evidence.substring(0, 150) || "Scraped CTA",
            pricing: result.pricing?.evidence.substring(0, 100) || "Scraped Pricing",
            discount: result.offer_match?.evidence.substring(0, 100) || "Scraped Discounts",
            reviews: result.social_proof?.evidence.substring(0, 100) || "Scraped Reviews",
            testimonials: result.social_proof?.evidence.substring(0, 100) || "Scraped Testimonials",
            productDescription: result.benefits_match?.evidence.substring(0, 250) || "Scraped Details",
            shipping: result.shipping?.evidence.substring(0, 100) || "Scraped Shipping",
            refundPolicy: result.objection_handling?.evidence.substring(0, 100) || "Scraped Refunds",
            trustBadges: result.trust_signals?.evidence.substring(0, 100) || "Scraped Seals"
          }} 
        />
      </div>
    </div>
  );
}
