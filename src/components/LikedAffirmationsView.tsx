import React, { useState } from 'react';
import { Heart, Quote, Search, Trash2, Bookmark, Sparkles, Filter, Check, Share2, Copy } from 'lucide-react';
import { DAILY_AFFIRMATIONS } from '../data/affirmations';
import { sqliteStorage } from '../db/sqliteStorage';
import { Affirmation } from '../types';

interface LikedAffirmationsViewProps {
  isDarkMode: boolean;
  onClose?: () => void;
  onAffirmationToggled?: () => void;
}

export const LikedAffirmationsView: React.FC<LikedAffirmationsViewProps> = ({
  isDarkMode,
  onClose,
  onAffirmationToggled,
}) => {
  const [likedIds, setLikedIds] = useState<string[]>(
    sqliteStorage.getLikedAffirmationIds()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const likedList = DAILY_AFFIRMATIONS.filter((aff) => likedIds.includes(aff.id));

  const filteredLiked = likedList.filter((aff) => {
    const matchesSearch =
      aff.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || aff.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUnlike = async (id: string) => {
    await sqliteStorage.toggleLikedAffirmation(id);
    const updated = sqliteStorage.getLikedAffirmationIds();
    setLikedIds(updated);
    if (onAffirmationToggled) onAffirmationToggled();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', 'Resilience', 'Freedom', 'Compassion', 'Clarity', 'Grounding'];

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className={`p-4 rounded-2xl border ${
        isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-rose-50/50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Liked Affirmations Vault
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-500">
            {likedList.length} Saved
          </span>
        </div>
        <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Your personal sanctuary of recovery wisdom. Revisit these whenever you need grounding or strength.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-hidden transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List of Saved Affirmations */}
      {filteredLiked.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#14161A] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Bookmark className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
          <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {likedList.length === 0 ? 'No liked affirmations yet' : 'No matches found'}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
            {likedList.length === 0
              ? 'Tap the heart icon on any daily reflection on your dashboard to save it here forever.'
              : 'Try clearing your search query or choosing another category filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredLiked.map((aff) => (
            <div
              key={aff.id}
              className={`p-4 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-[#14161A] border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-amber-500 dark:text-amber-400">
                  {aff.category} · Day {aff.day} of 365
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(aff.text, aff.id)}
                    title="Copy affirmation"
                    className={`p-1.5 rounded-lg transition-colors ${
                      copiedId === aff.id
                        ? 'text-emerald-500'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {copiedId === aff.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleUnlike(aff.id)}
                    title="Remove from liked"
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className={`text-sm font-semibold leading-relaxed ${
                isDarkMode ? 'text-white' : 'text-slate-950'
              }`}>
                &ldquo;{aff.text}&rdquo;
              </p>

              <div className="mt-2 text-xs text-slate-400">
                — {aff.author}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
