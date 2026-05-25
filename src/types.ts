/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SlideLayoutType = 
  | 'cover' 
  | 'content_bullet' 
  | 'split_media' 
  | 'big_stat' 
  | 'quote' 
  | 'timeline' 
  | 'comparison' 
  | 'conclusion';

export interface VisualSuggestion {
  type: 'chart' | 'icon' | 'image' | 'comparison' | 'timeline';
  label: string;
  data?: Array<{ label: string; value: number }>;
  iconName?: string;
  imagePrompt?: string;
}

export interface SlideImage {
  src: string;
  alt: string;
  widthPercent?: number; // e.g. 50, 100, etc.
}

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayoutType;
  accentText?: string; // a top category, tag, or header line (e.g. "MARKET SEGMENTATION")
  content: string[]; // bullets, key details, columns, or items
  highlight?: string; // a short powerful quote, statistic footnote, or takeaway phrase
  visualSuggestion?: VisualSuggestion;
  image?: SlideImage;
}

export interface PresentationTheme {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  accentHoverClass: string;
  borderClass: string;
  fontFamilyHead: string; // Tailwinds custom or font classes
  fontFamilyBody: string;
  badgeClass: string;
}

export interface Presentation {
  title: string;
  subtitle: string;
  themeId: string;
  slides: Slide[];
}
