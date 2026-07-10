import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateSmoothedPercentages } from '../../utils/marketUtils';

const CATEGORY_COLORS = {
  Breaking: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30', dot: true },
  Economics: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
  Weather: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Sports: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' },
  Crypto: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Science: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
  Culture: { bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500/30' },
  Elections: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
  default: { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500/30' },
};

function getCategoryBanner(category, imageUrl) {
  if (imageUrl && !imageUrl.includes('ui-avatars.com')) return imageUrl;
  const keywords = {
    Breaking: 'breaking+news+newspaper',
    Economics: 'economy+finance+charts',
    Weather: 'weather+clouds+sky',
    Sports: 'sports+stadium+crowd',
    Crypto: 'cryptocurrency+bitcoin+blockchain',
    Science: 'science+space+technology',
    Culture: 'culture+art+music',
    Elections: 'election+democracy+vote',
  };
  const kw = keywords[category] || 'news+event';
  return `https://source.unsplash.com/400x200/?${kw}`;
}

export default function MarketCard({ market }) {
  const navigate = useNavigate();
  const { yes, no, totalVotes } = calculateSmoothedPercentages(market.house_yes_points, market.house_no_points);
  const colors = CATEGORY_COLORS[market.category] || CATEGORY_COLORS.default;

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    if (market.category === 'Weather') {
      const match = market.question.match(/^(.*?) (above|rain over)/i);
      if (match) {
        navigate(`/weather/${match[1]}`);
        return;
      }
    }
    navigate(`/market/${market.id}`);
  };

  const daysLeft = market.end_date
    ? Math.max(0, Math.ceil((new Date(market.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const bannerUrl = getCategoryBanner(market.category, market.image_url);

  return (
    <div
      onClick={handleClick}
      className="bg-[#111317] border border-[#2a2e33] hover:border-[#3a3f45] transition-all rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
    >
      {/* Banner Image */}
      <div className="relative w-full h-36 overflow-hidden">
        <img
          src={bannerUrl}
          alt={market.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${market.category}&background=1a1d23&color=fff&size=400`;
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-[#111317]/40 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#111317]/80 backdrop-blur-sm border ${colors.border} ${colors.text}`}>
            {colors.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {market.category}
          </span>
        </div>

        {/* Days left badge */}
        {daysLeft !== null && daysLeft <= 7 && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#111317]/80 backdrop-blur-sm border border-[#2a2e33] text-slate-400">
              {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Question */}
        <h2 className="text-sm font-semibold text-white mb-3 line-clamp-2 leading-snug group-hover:text-white/80 transition-colors">
          {market.question.replace(/^\[Breaking\]\s*/i, '')}
        </h2>

        {/* Probability bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="text-[#00c853] font-bold">{yes}% Yes</span>
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#2a2e33] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00c853] to-[#00e676]"
              style={{ width: `${yes}%` }}
            />
          </div>
        </div>

        {/* Buttons or Status */}
        <div className="flex gap-2 mt-auto">
          {market.status === 'Resolved' ? (
            <div className={`flex-1 py-2 rounded-lg font-bold text-xs text-center border ${market.winning_outcome === 'YES' ? 'bg-[#00c853]/10 text-[#00c853] border-[#00c853]/30' : market.winning_outcome === 'NO' ? 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {market.winning_outcome ? `Resolved: ${market.winning_outcome}` : 'Cancelled'}
            </div>
          ) : market.status === 'CANCEL' ? (
            <div className="flex-1 py-2 rounded-lg font-bold text-xs text-center bg-slate-800 text-slate-400 border border-slate-700">Cancelled</div>
          ) : new Date(market.end_date) <= new Date() ? (
            <div className="flex-1 py-2 rounded-lg font-bold text-xs text-center bg-slate-800/50 text-slate-400 border border-slate-700">Pending Resolution</div>
          ) : (
            <>
              <button
                onClick={handleClick}
                className="flex-1 bg-[#00c853]/10 hover:bg-[#00c853]/20 text-[#00c853] border border-[#00c853]/30 py-2 rounded-lg font-bold text-xs transition-colors flex justify-between px-3 items-center"
              >
                <span>Yes</span> <span className="font-mono">{yes}%</span>
              </button>
              <button
                onClick={handleClick}
                className="flex-1 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] border border-[#ff3b30]/30 py-2 rounded-lg font-bold text-xs transition-colors flex justify-between px-3 items-center"
              >
                <span>No</span> <span className="font-mono">{no}%</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
