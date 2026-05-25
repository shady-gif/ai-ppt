import { PresentationTheme } from './types';

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    id: 'minimal',
    name: 'Neo Minimalist',
    description: 'Clean stone backdrop, sophisticated gray details, high-contrast crisp headers.',
    bgClass: 'bg-[#f7f7f5]',
    cardBgClass: 'bg-white border-stone-200/80 shadow-sm',
    textPrimaryClass: 'text-stone-900',
    textSecondaryClass: 'text-stone-500',
    accentClass: 'bg-stone-900 text-white',
    accentHoverClass: 'hover:bg-stone-800',
    borderClass: 'border-stone-200',
    fontFamilyHead: 'font-display select-none tracking-tight font-bold',
    fontFamilyBody: 'font-sans leading-relaxed tracking-normal',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300'
  },
  {
    id: 'midnight-tech',
    name: 'Midnight Tech',
    description: 'Dark cyber aesthetic with deep backgrounds, crisp glowing cards and vibrant neon details.',
    bgClass: 'bg-[#0a0b0d]',
    cardBgClass: 'bg-[#12141c] border-purple-500/15 shadow-purple-500/5 shadow-md',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-stone-400',
    accentClass: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20',
    accentHoverClass: 'hover:bg-indigo-500',
    borderClass: 'border-stone-800',
    fontFamilyHead: 'font-mono select-none tracking-tight font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300',
    fontFamilyBody: 'font-sans leading-relaxed text-stone-300',
    badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/20'
  },
  {
    id: 'sage-pastel',
    name: 'Earthy Sage',
    description: 'Soft pastels, serene mint and sage tones, gentle forest details for creative or eco pitches.',
    bgClass: 'bg-[#f2f6f3]',
    cardBgClass: 'bg-white border-emerald-900/10 shadow-sm',
    textPrimaryClass: 'text-emerald-950',
    textSecondaryClass: 'text-emerald-800/70',
    accentClass: 'bg-emerald-800 text-white',
    accentHoverClass: 'hover:bg-emerald-700',
    borderClass: 'border-emerald-100',
    fontFamilyHead: 'font-display select-none font-bold tracking-tight text-emerald-900',
    fontFamilyBody: 'font-sans leading-relaxed text-emerald-900/80',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100'
  },
  {
    id: 'peach-sunset',
    name: 'Sunset Peach',
    description: 'Terracotta text and warm cream details that evoke cozy and playful design systems.',
    bgClass: 'bg-[#fdf9f4]',
    cardBgClass: 'bg-white border-amber-900/10 shadow-sm',
    textPrimaryClass: 'text-stone-800',
    textSecondaryClass: 'text-amber-900/60',
    accentClass: 'bg-amber-600 text-white',
    accentHoverClass: 'hover:bg-amber-700',
    borderClass: 'border-amber-100',
    fontFamilyHead: 'font-display select-none font-extrabold tracking-tight text-amber-950',
    fontFamilyBody: 'font-sans leading-relaxed text-stone-700',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/50'
  },
  {
    id: 'academic-editorial',
    name: 'Academic Editorial',
    description: 'Classic serif headlines, warm ivory and sepia margins. Ideal for detailed research notes.',
    bgClass: 'bg-[#f4ebe1]',
    cardBgClass: 'bg-[#fdfbf7] border-amber-900/15 shadow-sm',
    textPrimaryClass: 'text-amber-950',
    textSecondaryClass: 'text-stone-600',
    accentClass: 'bg-[#6d4c41] text-white',
    accentHoverClass: 'hover:bg-[#5d4037]',
    borderClass: 'border-amber-900/20',
    fontFamilyHead: 'font-serif select-none tracking-normal font-bold italic text-amber-950',
    fontFamilyBody: 'font-sans leading-relaxed text-stone-800',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-900/30'
  }
];

export function getTheme(themeId: string): PresentationTheme {
  return PRESENTATION_THEMES.find(t => t.id === themeId) || PRESENTATION_THEMES[0];
}
