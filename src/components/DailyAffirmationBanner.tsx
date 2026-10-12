import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote, Heart, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { DAILY_AFFIRMATIONS, getDayOfYear } from '../data/affirmations';
import { sqliteStorage } from '../db/sqliteStorage';

interface DailyAffirmationBannerProps {
  isDarkMode: boolean;
  onOpenLikedVault?: () => void;
}

export const DailyAffirmationBanner: React.FC<DailyAffirmationBannerProps> = ({
  isDarkMode,
  onOpenLikedVault,
}) => {
  const todayDayIndex = getDayOfYear() - 1;
  const [index, setIndex] = useState(todayDayIndex);
  const [isRotating, setIsRotating] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    setLikedIds(sqliteStorage.getLikedAffirmationIds());
  }, []);

  const current = DAILY_AFFIRMATIONS[index % DAILY_AFFIRMATIONS.length];
  const isFavorited = likedIds.includes(current.id);
  const isToday = index % DAILY_AFFIRMATIONS.length === todayDayIndex;

  const handleNext = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
      setIsRotating(false);
    }, 120);
  };

  const handlePrev = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + DAILY_AFFIRMATIONS.length) % DAILY_AFFIRMATIONS.length);
      setIsRotating(false);
    }, 120);
  };

  const handleJumpToToday = () => {
    setIndex(todayDayIndex);
  };

  const toggleFavorite = async () => {
    await sqliteStorage.toggleLikedAffirmation(current.id);
    setLikedIds(sqliteStorage.getLikedAffirmationIds());
  };

  return (
    <section
      aria-label="Daily Affirmation"
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
        isDarkMode
          ? 'bg-[#181A1E] border-slate-700/80 text-white'
          : 'bg-white border-slate-300 text-slate-950'
      }`}
    >
      {/* Top Bar: Title, 24-hr Day Badge, and Action Buttons */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
            <Quote className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Recovery Reflection</span>
            <span aria-hidden="true" className={isDarkMode ? 'text-slate-400' : 'text-slate-400'}>·</span>
            <span className="text-amber-400 font-bold">{current.category}</span>
          </div>

          {isToday ? (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Today’s Wisdom
            </span>
          ) : (
            <button
              onClick={handleJumpToToday}
              className={`text-[10px] font-semibold underline ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Like / Heart Button */}
          <button
            onClick={toggleFavorite}
            aria-label={isFavorited ? 'Remove from liked affirmations' : 'Like affirmation and save to profile'}
            title={isFavorited ? 'Liked (saved in your profile)' : 'Like this affirmation'}
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-transform active:scale-95 ${
              isFavorited
                ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                : isDarkMode
                ? 'text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Previous Day */}
          <button
            onClick={handlePrev}
            aria-label="Previous affirmation"
            title="Previous affirmation"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-all ${
              isDarkMode
                ? 'text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next Day */}
          <button
            onClick={handleNext}
            aria-label="Next affirmation"
            title="Next affirmation"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-all ${
              isDarkMode
                ? 'text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Open Liked Vault shortcut */}
          {onOpenLikedVault && (
            <button
              onClick={onOpenLikedVault}
              title={`View ${likedIds.length} liked affirmations in profile`}
              className={`min-h-[36px] px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isDarkMode
                  ? 'text-amber-400 hover:bg-slate-800'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">{likedIds.length} Liked</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Quote Body (High contrast white in dark mode) */}
      <p
        className={`text-lg sm:text-xl font-bold leading-relaxed tracking-normal my-2.5 transition-opacity ${
          isRotating ? 'opacity-40' : 'opacity-100'
        } ${isDarkMode ? 'text-white drop-shadow-xs' : 'text-slate-950'}`}
      >
        &ldquo;{current.text}&rdquo;
      </p>

      {/* Bottom Metadata: Author, Day of 365, and 24h Cycle note */}
      <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
        isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-700'
      }`}>
        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          — {current.author}
        </span>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono tabular-nums font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-700'
          }`}>
            Day {current.day} of 365
          </span>
          <span className={`text-[11px] font-medium hidden sm:inline ${
            isDarkMode ? 'text-slate-200' : 'text-slate-500'
          }`}>
            · 24h cycle
          </span>
        </div>
      </div>
    </section>
  );
};
