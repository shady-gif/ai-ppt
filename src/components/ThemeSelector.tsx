import React from 'react';
import { PRESENTATION_THEMES } from '../themes';
import LucideIcon from './LucideIcon';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelectTheme
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <span className="text-xs uppercase tracking-widest font-mono text-gray-400 font-bold block">Aesthetics Engine</span>
        <h3 className="text-sm font-bold text-gray-900">Visual Vibe</h3>
      </div>

      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 font-sans">
        {PRESENTATION_THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`w-full p-3 rounded-xl text-left border transition-all duration-200 relative group flex items-start gap-3 select-none ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 text-gray-900 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              {/* Highlight Dot or Indicator */}
              <div className="mt-0.5">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-gray-50'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </div>
              </div>

              {/* Theme description details */}
              <div className="flex-1 min-w-0 pr-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-display tracking-tight text-gray-950">{theme.name}</span>
                  {isSelected && (
                    <span className="text-[9px] font-mono uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                <p className="text-[10px] text-gray-500 leading-normal line-clamp-2">
                  {theme.description}
                </p>

                {/* Micro Theme Preview Palette cards */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="flex -space-x-1">
                    <span className={`w-3.5 h-3.5 rounded-full border border-gray-200/50 ${theme.bgClass}`} />
                    <span className={`w-3.5 h-3.5 rounded-full border border-gray-200/50 ${theme.cardBgClass}`} />
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-gray-200/50" />
                  </div>
                  <span className="text-[8px] font-mono text-gray-400 font-bold uppercase tracking-tighter">
                    {theme.id === 'academic-editorial' ? 'Serif Paired' : 'Sans-Serif Classic'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
