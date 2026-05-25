import React from 'react';
import { Slide, SlideLayoutType, VisualSuggestion } from '../types';
import LucideIcon from './LucideIcon';

interface SlideEditorProps {
  slide: Slide;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onDeleteSlide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const LAYOUT_OPTIONS: Array<{ id: SlideLayoutType; label: string; icon: string; desc: string }> = [
  { id: 'cover', label: 'Cover Slide', icon: 'Home', desc: 'Hero introduction with massive display headline.' },
  { id: 'content_bullet', label: 'Standard Points', icon: 'ListOrdered', desc: 'Clean lists paired with small decorative highlights.' },
  { id: 'split_media', label: 'Split Media', icon: 'SquareHalf', desc: 'Left textual outline, right resizable illustration card.' },
  { id: 'big_stat', label: 'Famous Statistic', icon: 'Percent', desc: 'Screaming jumbo numerical layout for indicators.' },
  { id: 'quote', label: 'Quotes Card', icon: 'Quote', desc: 'Clean, centered text in dramatic elegant serif blocks.' },
  { id: 'timeline', label: 'Process Steps', icon: 'ListStart', desc: 'Grid progress points indicating sequential steps.' },
  { id: 'comparison', label: 'A/B Comparison', icon: 'Columns2', desc: 'Side-by-side grids contrasting pros vs cons.' },
  { id: 'conclusion', label: 'Wrap-up Closing', icon: 'CheckSquare', desc: 'CTA callouts, wrap ups, and final details.' }
];

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  onUpdateSlide,
  onDeleteSlide,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const [imagePrompt, setImagePrompt] = React.useState('');
  const [isGeneratingImg, setIsGeneratingImg] = React.useState(false);
  const [generateError, setGenerateError] = React.useState('');

  const handleLayoutSelect = (layoutId: SlideLayoutType) => {
    onUpdateSlide({ ...slide, layout: layoutId });
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImg(true);
    setGenerateError('');

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: '16:9' }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        onUpdateSlide({
          ...slide,
          image: {
            src: data.imageUrl,
            alt: imagePrompt,
            widthPercent: 100
          }
        });
        setImagePrompt('');
      } else {
        setGenerateError(data.errorMsg || 'Failed to replace image');
      }
    } catch (err: any) {
      setGenerateError(err.message || String(err));
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-800">
      
      {/* 1. Slide Action Controls Block */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-gray-400 font-bold block">Current Segment</span>
          <h3 className="text-sm font-bold text-gray-900">Modify Elements</h3>
        </div>
        
        {/* Rearrange & Delete controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition`}
            title="Move slide up"
          >
            <LucideIcon name="ChevronUp" size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition`}
            title="Move slide down"
          >
            <LucideIcon name="ChevronDown" size={14} />
          </button>
          <button
            onClick={onDeleteSlide}
            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition ml-2"
            title="Delete this slide"
          >
            <LucideIcon name="Trash2" size={14} />
          </button>
        </div>
      </div>

      {/* 2. Choose Presentation Layout Template */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-widest text-gray-500 font-black flex items-center gap-1.5">
          <LucideIcon name="Layers" size={12} className="text-indigo-600" />
          <span>Layout Template</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_OPTIONS.map((layout) => {
            const isSelected = slide.layout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => handleLayoutSelect(layout.id)}
                className={`p-2.5 rounded-xl text-left border transition duration-150 flex flex-col gap-1.5 group select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-gray-900 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-850'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LucideIcon 
                    name={layout.icon} 
                    size={14} 
                    className={isSelected ? 'text-indigo-600 font-bold' : 'text-gray-400 group-hover:text-gray-600'} 
                  />
                  <span className="text-[11px] font-bold tracking-tight">{layout.label}</span>
                </div>
                <span className="text-[9px] leading-tight opacity-75 hidden xs:block">{layout.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Replacement / Generative AI Image Section */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <label className="text-xs font-mono uppercase tracking-widest text-gray-500 font-black flex items-center gap-1.5">
          <LucideIcon name="Sparkles" size={12} className="text-indigo-600" />
          <span>Generative AI Visualizer</span>
        </label>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {slide.image 
              ? "This slide currently features a visual asset. Describe what you'd like to replace it with to generate a new custom illustration/photo."
              : "Generate an aesthetic photorealistic background or vector art illustration for this slide."}
          </p>

          <form onSubmit={handleGenerateImage} className="space-y-2">
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g. Minimal vector landscape, clean organic sage theme, cyberpunk low poly..."
              rows={2}
              className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
            />
            
            {generateError && (
              <span className="text-[10px] text-red-500 block">{generateError}</span>
            )}

            <button
              type="submit"
              disabled={isGeneratingImg || !imagePrompt.trim()}
              className="w-full py-1.5 rounded-lg text-xs font-medium font-mono text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              {isGeneratingImg ? (
                <>
                  <LucideIcon name="Loader" size={12} className="animate-spin text-white" />
                  Generating Visuals...
                </>
              ) : (
                <>
                  <LucideIcon name="Sparkles" size={12} />
                  Update Slide Asset
                </>
              )}
            </button>
          </form>

          {slide.image && (
            <button
              onClick={() => {
                const { image: _, ...rest } = slide;
                onUpdateSlide(rest);
              }}
              className="w-full text-center text-[10px] font-mono text-red-500 hover:text-red-600 hover:underline block"
            >
              Remove absolute visual asset
            </button>
          )}
        </div>
      </div>

      {/* 4. Optional Slide Footnote / Highlight Annotation */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <label className="text-xs font-mono uppercase tracking-widest text-gray-500 font-black flex items-center gap-1.5">
          <LucideIcon name="FileText" size={12} className="text-indigo-600" />
          <span>Footer Annotation / Takeaway</span>
        </label>
        <input
          type="text"
          value={slide.highlight || ''}
          onChange={(e) => onUpdateSlide({ ...slide, highlight: e.target.value })}
          placeholder="e.g. Key quote, source footnote, website..."
          className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2.5 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

    </div>
  );
};
export default SlideEditor;
