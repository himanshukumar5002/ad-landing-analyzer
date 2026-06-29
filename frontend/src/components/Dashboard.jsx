import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserFriends, FaGift, FaHeading, FaEye, FaMousePointer, 
  FaShieldAlt, FaComments, FaDollarSign, FaListUl, FaQuestionCircle, 
  FaShippingFast, FaDesktop, FaChevronDown, FaChevronUp, FaInfoCircle
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
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Ad Angle Clustering & Alignment Report
          </h2>
          <p className="text-sm text-slate-400">
            Analyzing landing page: <span className="text-slate-300 underline">{landingUrl}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {result.clusters.map((cluster, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-gradient rounded-3xl p-6 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-4 py-2 bg-accentPurple/10 border-b border-l border-white/5 rounded-bl-2xl">
                <span className="text-xs font-bold text-accentPurple uppercase tracking-wider">
                  Angle #{idx + 1}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{cluster.angle}</h3>
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-300">Cluster Ad copies:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {cluster.ad_texts.map((text, i) => (
                        <li key={i} className="text-slate-300 italic">"{text}"</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 w-fit">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Match Score</span>
                    <span className={`text-2xl font-extrabold ${
                      cluster.overall_fit_score >= 80 ? 'text-accentNeon' : cluster.overall_fit_score >= 60 ? 'text-amber-400' : 'text-accentRose'
                    }`}>
                      {cluster.overall_fit_score}%
                    </span>
                  </div>
                  <div className="w-1.5 h-10 rounded bg-slate-800">
                    <div className="w-full rounded h-full bg-accentPurple" style={{ height: `${cluster.overall_fit_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Cluster Analysis</h4>
                <p className="text-sm text-slate-300 bg-white/5 p-4 rounded-xl leading-relaxed">
                  {cluster.analysis}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tailored Adjustments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cluster.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{rec.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.priority.toLowerCase() === 'high' ? 'bg-red-950 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal mb-3">{rec.description}</p>
                      <div className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase">
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
    if (score >= 80) return { text: 'text-accentNeon', bg: 'bg-accentNeon/5', border: 'border-accentNeon/20', badge: 'bg-accentNeon/10 text-accentNeon' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20', badge: 'bg-amber-400/10 text-amber-400' };
    return { text: 'text-accentRose', bg: 'bg-accentRose/5', border: 'border-accentRose/20', badge: 'bg-accentRose/10 text-accentRose' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Top Section: circular score and executive summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <ScoreCircle score={result.overall_score} />
        
        {/* Summary Card */}
        <div className="md:col-span-2 card-gradient rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accentNeon/5 rounded-full blur-3xl"></div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <FaInfoCircle />
              Executive Audit Summary
            </span>
            <h3 className="text-lg font-bold text-white mb-3">Conversion & Continuity Analysis</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>
          <div className="text-xs text-slate-400 border-t border-white/5 pt-4 mt-4">
            Auditing landing page: <span className="text-slate-300 underline font-semibold">{landingUrl}</span>
          </div>
        </div>
      </div>

      {/* Grid of Dimension Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-wide uppercase">
          Continuous Audit Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ key, title, icon }) => {
            const data = result[key];
            if (!data) return null;
            const style = getScoreStyles(data.score);
            const isExpanded = expandedCard === key;

            return (
              <motion.div
                key={key}
                layout
                onClick={() => setExpandedCard(isExpanded ? null : key)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden card-gradient ${
                  isExpanded ? 'lg:col-span-2 row-span-2 border-white/20' : 'hover:border-white/10 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 text-slate-200">
                    <span className="text-lg text-accentNeon">{icon}</span>
                    <span className="font-bold text-sm tracking-wide">{title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${style.badge}`}>
                    {data.score}
                  </span>
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
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-amber-400 block mb-1">Recommendation:</span>
                      {data.recommendation}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">
                      Confidence Level: <span className="text-emerald-400">{Math.round(data.confidence * 100)}%</span>
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
        <h3 className="text-base font-bold text-white tracking-wide uppercase">
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
        <h3 className="text-base font-bold text-white tracking-wide uppercase">
          Source Material Alignment
        </h3>
        {/* We recreate the scraper format to send to evidence viewer */}
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
