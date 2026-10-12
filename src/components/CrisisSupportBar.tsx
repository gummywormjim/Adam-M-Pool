import React from 'react';
import { PhoneCall, MessageSquare, ExternalLink, LifeBuoy } from 'lucide-react';

interface CrisisSupportBarProps {
  isDarkMode: boolean;
  className?: string;
  variant?: 'banner' | 'modal';
}

export const CrisisSupportBar: React.FC<CrisisSupportBarProps> = ({
  isDarkMode,
  className = '',
  variant = 'banner',
}) => {
  return (
    <aside
      aria-label="24/7 Crisis Support Resources"
      className={`rounded-xl border transition-colors text-xs py-2 px-3 sm:px-3.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs ${
        isDarkMode
          ? 'bg-[#16181D] border-slate-800/90 text-slate-300'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      } ${className}`}
    >
      {/* Label & Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/15 text-rose-500 shrink-0">
          <LifeBuoy className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className="text-[11px] sm:text-xs font-semibold tracking-tight text-slate-400 dark:text-slate-400">
          {variant === 'modal' ? 'Need immediate support?' : '24/7 Crisis Support:'}
        </span>
      </div>

      {/* Action Links */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs">
        {/* Crisis Hotline link */}
        <a
          href="tel:988"
          title="Call or text the 988 Suicide & Crisis Lifeline"
          className="inline-flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 transition-colors py-0.5 px-1.5 rounded-md hover:bg-rose-500/10"
        >
          <PhoneCall className="w-3 h-3 stroke-[2.5]" />
          <span>Crisis Hotline: <strong>988</strong></span>
        </a>

        <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline" aria-hidden="true">
          •
        </span>

        {/* Chat Lifeline link */}
        <a
          href="https://chat.988lifeline.org"
          target="_blank"
          rel="noopener noreferrer"
          title="Open confidential online chat at chat.988lifeline.org"
          className="inline-flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors py-0.5 px-1.5 rounded-md hover:bg-cyan-500/10"
        >
          <MessageSquare className="w-3 h-3 stroke-[2.5]" />
          <span>Chat: <strong>chat.988lifeline.org</strong></span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      </div>
    </aside>
  );
};
