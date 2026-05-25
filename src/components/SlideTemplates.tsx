import React from 'react';
import { Slide, PresentationTheme } from '../types';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface SlideTemplateProps {
  slide: Slide;
  theme: PresentationTheme;
  isActive: boolean;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onSelectImageReplace?: (slideId: string) => void;
}

// Borderless, high-aesthetic self-adjusting editable text element
interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  placeholder = 'Type here...',
  className = '',
  multiline = false
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    onChange(e.currentTarget.textContent || '');
  };

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        setIsFocused(false);
        onChange(e.currentTarget.textContent || '');
      }}
      className={`relative inline-block outline-none transition-all duration-200 border-b ${
        isFocused 
          ? 'border-indigo-500/50 bg-indigo-500/5 ring-2 ring-indigo-500/10 rounded px-1' 
          : 'border-transparent hover:border-indigo-400/30'
      } ${className}`}
      style={{ minWidth: value === '' ? '50px' : 'auto' }}
    >
      {value}
    </span>
  );
};

export const SlideTemplates: React.FC<SlideTemplateProps> = ({
  slide,
  theme,
  isActive,
  onUpdateSlide,
  onSelectImageReplace
}) => {
  const { title, layout, accentText, content, highlight, visualSuggestion, image } = slide;

  // Specific state/item update shorthand helpers
  const handleTitleChange = (newTitle: string) => {
    onUpdateSlide({ ...slide, title: newTitle });
  };

  const handleAccentChange = (newAccent: string) => {
    onUpdateSlide({ ...slide, accentText: newAccent });
  };

  const handleHighlightChange = (newHighlight: string) => {
    onUpdateSlide({ ...slide, highlight: newHighlight });
  };

  const handleBulletChange = (idx: number, newVal: string) => {
    const nextContent = [...content];
    nextContent[idx] = newVal;
    onUpdateSlide({ ...slide, content: nextContent });
  };

  const handleAddBullet = () => {
    onUpdateSlide({ ...slide, content: [...content, 'New supporting point...'] });
  };

  const handleRemoveBullet = (idx: number) => {
    const nextContent = content.filter((_, i) => i !== idx);
    onUpdateSlide({ ...slide, content: nextContent });
  };

  const handleResizeImage = (sizePercent: number) => {
    if (image) {
      onUpdateSlide({
        ...slide,
        image: { ...image, widthPercent: sizePercent }
      });
    }
  };

  // Helper for rendering Image with sizing & replace triggers
  const renderSlideImage = (isFloatRight: boolean = true) => {
    if (!image) return null;
    const widthClass = 
      image.widthPercent === 30 ? 'w-1/3' : 
      image.widthPercent === 50 ? 'w-1/2' : 
      image.widthPercent === 70 ? 'w-[70%]' : 
      'w-full';

    return (
      <div className={`flex flex-col items-center justify-center p-2 group/image relative max-w-full`}>
        {/* Overlaid Image Edit Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 shadow-md">
          <button 
            onClick={() => onSelectImageReplace && onSelectImageReplace(slide.id)}
            className="p-1 px-2 text-[10px] text-white hover:text-indigo-300 font-mono flex items-center gap-1"
            title="Replace via AI prompt or keyword"
          >
            <LucideIcon name="Sparkles" size={12} /> AI Replace
          </button>
          <span className="text-stone-600">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-stone-400 font-sans px-1">Size:</span>
            {[30, 50, 70, 100].map((size) => (
              <button
                key={size}
                onClick={() => handleResizeImage(size)}
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  (image.widthPercent || 100) === size 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {size}%
              </button>
            ))}
          </div>
        </div>

        {/* Real Image Tag */}
        <div className={`${widthClass} transition-all duration-300 rounded-xl overflow-hidden shadow-lg border ${theme.borderClass} relative aspect-video bg-[#0000000a] flex items-center justify-center`}>
          <img 
            src={image.src} 
            alt={image.alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        {image.alt && (
          <span className="text-[10px] uppercase tracking-wider font-mono opacity-50 mt-1">
            <EditableText value={image.alt} onChange={(val) => onUpdateSlide({ ...slide, image: { ...image, alt: val } })} />
          </span>
        )}
      </div>
    );
  };

  // Safe accent tag renderer
  const renderAccentTag = () => {
    if (accentText === undefined) return null;
    return (
      <div className="mb-4">
        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono font-bold rounded-full border ${theme.badgeClass}`}>
          <EditableText value={accentText} onChange={handleAccentChange} placeholder="SECTION TAG" />
        </span>
      </div>
    );
  };

  // Inside the canvas, we scale/arrange content beautifully based on the active layout pattern.
  return (
    <div className={`w-full h-full flex flex-col justify-between ${theme.fontFamilyBody} ${theme.textPrimaryClass} h-full select-text`}>
      
      {/* 1. COVER LAYOUT */}
      {layout === 'cover' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-6 py-10 relative">
          <div className="absolute top-10 left-10 p-2 opacity-15">
            <LucideIcon name="Sparkles" size={50} />
          </div>
          
          {renderAccentTag()}
          
          <h1 className={`${theme.fontFamilyHead} text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.1] filter drop-shadow-sm max-w-4xl`}>
            <EditableText value={title} onChange={handleTitleChange} placeholder="Presentation Title" />
          </h1>
          
          <p className={`${theme.textSecondaryClass} text-base sm:text-lg md:text-xl max-w-2xl font-light mb-10`}>
            {content[0] ? (
              <EditableText value={content[0]} onChange={(v) => handleBulletChange(0, v)} placeholder="Inspiring subtitle goes here..." />
            ) : (
              <span className="opacity-40 italic cursor-pointer" onClick={handleAddBullet}>+ Add description</span>
            )}
          </p>

          <div className="w-20 h-1 bg-indigo-500 rounded-full mb-8 opacity-60"></div>
          
          {highlight && (
            <div className={`text-xs uppercase tracking-widest font-mono opacity-60`}>
              <EditableText value={highlight} onChange={handleHighlightChange} placeholder="Author, Organization, or Date" />
            </div>
          )}
        </div>
      )}

      {/* 2. STANDARD CONTENT BULLET LAYOUT */}
      {layout === 'content_bullet' && (
        <div className="flex-grow flex flex-col justify-start px-8 py-10">
          {renderAccentTag()}
          
          <h2 className={`${theme.fontFamilyHead} text-2xl sm:text-3xl md:text-4xl mb-6 border-b pb-3 ${theme.borderClass}`}>
            <EditableText value={title} onChange={handleTitleChange} placeholder="Slide Title" />
          </h2>

          <div className="flex-1 grid md:grid-cols-12 gap-8 items-start my-auto">
            <div className={`${visualSuggestion ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
              {content.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 group relative pl-2">
                  <div className="mt-1.5 text-indigo-500">
                    <LucideIcon name="CheckCircle" size={14} />
                  </div>
                  <div className="flex-1 text-sm sm:text-base">
                    <EditableText value={point} onChange={(v) => handleBulletChange(idx, v)} placeholder="Supporting bullet detail..." />
                  </div>
                  {/* Remove Point Floating Button */}
                  <button 
                    onClick={() => handleRemoveBullet(idx)}
                    className="opacity-0 group-hover:opacity-100 absolute -left-4 top-1 text-red-500 hover:text-red-700 transition"
                    title="Remove point"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddBullet}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-mono flex items-center gap-1 mt-4 transition"
              >
                + Add bullet point
              </button>
            </div>

            {/* Smart visual suggestion rendering */}
            {visualSuggestion && (
              <div className="md:col-span-5 p-5 rounded-2xl border flex flex-col justify-center h-full max-h-[300px] overflow-hidden shadow-inner bg-black/5 dark:bg-white/5 border-stone-200/20">
                <div className="flex items-center gap-2 mb-3">
                  <LucideIcon name={visualSuggestion.iconName || 'Award'} className="text-indigo-400" size={18} />
                  <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">
                    {visualSuggestion.label || 'Interactive Highlight'}
                  </span>
                </div>
                
                {/* Simulated Chart visual suggestion */}
                {visualSuggestion.type === 'chart' && visualSuggestion.data && (
                  <div className="space-y-2 mt-2">
                    {visualSuggestion.data.map((item, id) => (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span>{item.label}</span>
                          <span className="font-bold text-indigo-400">{item.value}%</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${item.value}%` }} 
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-indigo-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default icon banner suggestion */}
                {visualSuggestion.type !== 'chart' && (
                  <div className="text-center py-4 flex flex-col justify-center items-center opacity-75">
                    <LucideIcon name={visualSuggestion.iconName || 'HelpCircle'} className="text-indigo-400 animate-pulse mb-2" size={36} />
                    <span className="text-xs text-center">{visualSuggestion.label}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {highlight && (
            <div className={`mt-6 border-l-4 border-indigo-500 pl-4 py-1 italic text-xs ${theme.textSecondaryClass}`}>
              <EditableText value={highlight} onChange={handleHighlightChange} placeholder="Key highlight or citation..." />
            </div>
          )}
        </div>
      )}

      {/* 3. SPLIT MEDIA LAYOUT */}
      {layout === 'split_media' && (
        <div className="flex-grow flex flex-col justify-start px-8 py-10">
          {renderAccentTag()}
          
          <h2 className={`${theme.fontFamilyHead} text-2xl sm:text-3xl md:text-4xl mb-6 border-b pb-3 ${theme.borderClass}`}>
            <EditableText value={title} onChange={handleTitleChange} placeholder="Slide Title" />
          </h2>

          <div className="flex-Grow grid md:grid-cols-2 gap-8 items-center my-auto">
            {/* Left Narrative Outline */}
            <div className="space-y-4">
              {content.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 group relative pl-2">
                  <span className="mt-1 text-indigo-500">•</span>
                  <div className="flex-grow text-sm sm:text-base leading-relaxed">
                    <EditableText value={point} onChange={(v) => handleBulletChange(idx, v)} />
                  </div>
                  <button 
                    onClick={() => handleRemoveBullet(idx)}
                    className="opacity-0 group-hover:opacity-100 absolute -left-4 text-red-500 hover:text-red-700 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddBullet}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-mono flex items-center gap-1 mt-4 transition"
              >
                + Add text line
              </button>
              
              {highlight && (
                <div className="mt-4 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-xs italic opacity-85">
                  <EditableText value={highlight} onChange={handleHighlightChange} />
                </div>
              )}
            </div>

            {/* Right Resizable Image Content */}
            <div className="flex flex-col items-center justify-center">
              {image ? renderSlideImage() : (
                <div className="border border-dashed border-stone-400/50 rounded-xl p-8 text-center flex flex-col items-center gap-2">
                  <LucideIcon name="Image" size={32} className="opacity-40" />
                  <p className="text-xs opacity-60">No split image added</p>
                  <button 
                    onClick={() => onSelectImageReplace && onSelectImageReplace(slide.id)}
                    className="text-xs bg-indigo-600 text-white rounded px-3 py-1 font-mono mt-2"
                  >
                    + Add with AI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. BIG STAT LAYOUT */}
      {layout === 'big_stat' && (
        <div className="flex-grow flex flex-col justify-center text-center px-8 py-10">
          {renderAccentTag()}
          
          <div className="mb-4">
            <h2 className={`${theme.fontFamilyHead} text-2xl sm:text-3xl max-w-4xl mx-auto`}>
              <EditableText value={title} onChange={handleTitleChange} placeholder="Big Metric Overview" />
            </h2>
          </div>

          {/* Majestic Big Number Display */}
          <div className="my-auto py-6 flex flex-col items-center justify-center">
            <span className={`${theme.fontFamilyHead} text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-indigo-500 block select-all tracking-tighter filter drop-shadow-md`}>
              {content[0] ? (
                <EditableText value={content[0]} onChange={(v) => handleBulletChange(0, v)} placeholder="99.9%" />
              ) : (
                "75%"
              )}
            </span>
            <span className={`${theme.textSecondaryClass} text-sm sm:text-base md:text-lg max-w-xl mx-auto mt-2 font-mono uppercase tracking-wider`}>
              {content[1] ? (
                <EditableText value={content[1]} onChange={(v) => handleBulletChange(1, v)} placeholder="Growth Percentage Metric" />
              ) : (
                "Key Performance Metric"
              )}
            </span>
          </div>

          {highlight && (
            <div className={`mt-4 max-w-xl mx-auto text-sm italic font-light ${theme.textSecondaryClass}`}>
              “<EditableText value={highlight} onChange={handleHighlightChange} />”
            </div>
          )}
        </div>
      )}

      {/* 5. QUOTE LAYOUT */}
      {layout === 'quote' && (
        <div className="flex-grow flex flex-col justify-center text-center px-8 py-10 relative">
          <div className="absolute top-10 left-10 text-9xl text-indigo-500/10 font-serif pointer-events-none select-none">“</div>
          
          {renderAccentTag()}
          
          <div className="my-auto max-w-3xl mx-auto space-y-6">
            <blockquote className={`${theme.fontFamilyHead} font-serif text-xl sm:text-2xl md:text-3xl leading-relaxed italic text-indigo-400`}>
              {content[0] ? (
                <EditableText value={content[0]} onChange={(v) => handleBulletChange(0, v)} placeholder="Enter the inspiring quote here..." />
              ) : (
                "The future belongs to those who believe in the beauty of their dreams."
              )}
            </blockquote>
            
            {highlight && (
              <div className="text-xs sm:text-sm font-mono uppercase tracking-widest text-indigo-500 font-bold">
                — <EditableText value={highlight} onChange={handleHighlightChange} placeholder="Quote citation or author" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TIMELINE LAYOUT */}
      {layout === 'timeline' && (
        <div className="flex-grow flex flex-col justify-start px-8 py-10">
          {renderAccentTag()}
          
          <h2 className={`${theme.fontFamilyHead} text-2xl sm:text-3xl md:text-4xl mb-8 border-b pb-3 ${theme.borderClass}`}>
            <EditableText value={title} onChange={handleTitleChange} />
          </h2>

          {/* Sequential Timeline Progress Layout */}
          <div className="flex-1 flex flex-col justify-center my-auto">
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Connector line for horizontal view on wider screens */}
              <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-indigo-500/30 z-0"></div>

              {content.slice(0, 4).map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center md:items-start text-center md:text-left z-10 group bg-stone-500/5 p-4 rounded-xl border border-stone-200/10">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-mono font-bold mb-3 shadow-md mx-auto md:mx-0">
                    0{idx + 1}
                  </div>
                  <div className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider mb-1">
                    Stage {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-center md:text-left">
                    <EditableText value={step} onChange={(v) => handleBulletChange(idx, v)} />
                  </p>
                </div>
              ))}
            </div>

            {content.length < 4 && (
              <button 
                onClick={handleAddBullet}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-mono self-start mt-6"
              >
                + Add progress step
              </button>
            )}
          </div>

          {highlight && (
            <div className="mt-6 text-center text-xs opacity-60 font-mono tracking-widest uppercase">
              <EditableText value={highlight} onChange={handleHighlightChange} />
            </div>
          )}
        </div>
      )}

      {/* 7. COMPARISON / PROS-CONS LAYOUT */}
      {layout === 'comparison' && (
        <div className="flex-grow flex flex-col justify-start px-8 py-10">
          {renderAccentTag()}
          
          <h2 className={`${theme.fontFamilyHead} text-2xl sm:text-3xl md:text-4xl mb-6 border-b pb-3 ${theme.borderClass}`}>
            <EditableText value={title} onChange={handleTitleChange} />
          </h2>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch my-auto">
            {/* Column Left (Positive / Pros Aspects) */}
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-emerald-500 font-mono uppercase tracking-widest font-extrabold text-xs">
                <LucideIcon name="CheckCircle" size={16} />
                <span>Advantages / Pros</span>
              </div>
              <ul className="space-y-3 flex-1">
                {content.filter((_, i) => i % 2 === 0).map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-emerald-500 font-bold font-mono">+</span>
                    <span>
                      <EditableText value={point} onChange={(v) => handleBulletChange(idx * 2, v)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column Right (Negative / Cons Aspects) */}
            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-rose-500 font-mono uppercase tracking-widest font-extrabold text-xs">
                <LucideIcon name="AlertCircle" size={16} />
                <span>Challenges / Cons</span>
              </div>
              <ul className="space-y-3 flex-1">
                {content.filter((_, i) => i % 2 !== 0).map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-rose-500 font-bold font-mono">-</span>
                    <span>
                      <EditableText value={point} onChange={(v) => handleBulletChange(idx * 2 + 1, v)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {highlight && (
            <div className="mt-6 text-center text-xs text-stone-400 font-mono italic">
              <EditableText value={highlight} onChange={handleHighlightChange} />
            </div>
          )}
        </div>
      )}

      {/* 8. CONCLUSION LAYOUT */}
      {layout === 'conclusion' && (
        <div className="flex-grow flex flex-col justify-center items-center text-center px-6 py-10 relative">
          {renderAccentTag()}
          
          <h1 className={`${theme.fontFamilyHead} text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400`}>
            <EditableText value={title} onChange={handleTitleChange} placeholder="Wrap-Up Title" />
          </h1>

          <div className="w-16 h-1 bg-indigo-500 rounded-full mb-8"></div>

          <div className="space-y-3 max-w-2xl mb-8">
            {content.map((point, idx) => (
              <p key={idx} className="text-sm sm:text-base md:text-lg opacity-85 font-light">
                <EditableText value={point} onChange={(v) => handleBulletChange(idx, v)} />
              </p>
            ))}
          </div>

          {highlight && (
            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 max-w-md mx-auto text-xs font-mono select-all text-indigo-400 uppercase tracking-widest">
              <EditableText value={highlight} onChange={handleHighlightChange} placeholder="contact@example.com" />
            </div>
          )}
        </div>
      )}

      {/* Footer page descriptor watermark */}
      <footer className="h-6 flex items-center justify-between border-t border-stone-200/5 pt-2 text-[9px] font-mono opacity-50 px-8 select-none">
        <span>AI PRESENTATION BUILDER</span>
        <span>SLIDE {isActive ? 'ACTIVE' : 'OUTLINE'}</span>
      </footer>

    </div>
  );
};
