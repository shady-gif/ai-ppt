import React, { useState, useEffect, useRef } from 'react';
import { Slide, Presentation, SlideLayoutType } from './types';
import { PRESENTATION_THEMES, getTheme } from './themes';
import { SAMPLE_TOPICS } from './sampleData';
import { LucideIcon } from './components/LucideIcon';
import { SlideTemplates } from './components/SlideTemplates';
import { ThemeSelector } from './components/ThemeSelector';
import { SlideEditor } from './components/SlideEditor';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Input system variables
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'themes' | 'slides'>('generate');
  const [selectedThemeId, setSelectedThemeId] = useState('minimal');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isApiKeyActive, setIsApiKeyActive] = useState(false);

  // Active Presentation State
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  // Immersive Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Image Replacement Modal System
  const [activeReplacementSlideId, setActiveReplacementSlideId] = useState<string | null>(null);
  const [imageModalPrompt, setImageModalPrompt] = useState('');
  const [isReplacingImage, setIsReplacingImage] = useState(false);

  // Print Mode State for PDF Export
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Check backend server state and evaluate key availability
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setIsApiKeyActive(data.hasApiKey);
      })
      .catch((err) => console.log('Server status unreachable:', err));
  }, []);

  // Pre-populate with first sample on load
  useEffect(() => {
    if (SAMPLE_TOPICS.length > 0 && !inputText) {
      handleLoadSample(SAMPLE_TOPICS[0].id);
    }
  }, []);

  // Keyboard navigation for Fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation) return;
      
      if (isFullscreen) {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
          setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          setActiveSlideIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'Escape') {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, presentation]);

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_TOPICS.find((t) => t.id === sampleId);
    if (sample) {
      setInputText(sample.notes);
      setSelectedThemeId(sample.recommendedTheme);
    }
  };

  // Central Generation trigger calling backend or mock fallback
  const handleGeneratePresentation = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setStatusMessage('Intelligently analyzing text structure...');
    
    try {
      // Small delayed text updates to convey visual feedback
      setTimeout(() => setStatusMessage('Structuring layout breaks and slide hierarchies...'), 1200);
      setTimeout(() => setStatusMessage('Applying typography pairings and color themes...'), 2400);

      const res = await fetch('/api/presentations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: inputText,
          themeId: selectedThemeId,
        }),
      });

      const data = await res.json();
      if (data.success && data.presentation) {
        setPresentation({
          title: data.presentation.title || 'Untitled Stack',
          subtitle: data.presentation.subtitle || 'Formulated outlines',
          themeId: selectedThemeId,
          slides: data.presentation.slides,
        });
        setActiveSlideIndex(0);
        setActiveTab('slides');
      } else {
        alert(data.error || 'Slide parsing error occured. Please retry.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Network failure connecting to Gemini AI services.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Create clean blank cover of arbitrary layout type
  const handleAddNewSlide = (layout: SlideLayoutType) => {
    if (!presentation) return;
    const newSlide: Slide = {
      id: `slide_custom_${Date.now()}`,
      title: 'Click to add heading text',
      layout: layout,
      accentText: 'MANUAL SLIDE',
      content: ['Bullet insight one', 'Bullet insight two'],
      highlight: 'Key highlight takeaway footnote...',
      image: layout === 'split_media' ? {
        src: 'https://picsum.photos/seed/custom/800/450',
        alt: 'Sample Illustration',
        widthPercent: 100
      } : undefined
    };

    const nextSlides = [...presentation.slides];
    nextSlides.splice(activeSlideIndex + 1, 0, newSlide);
    
    setPresentation({
      ...presentation,
      slides: nextSlides
    });
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  const handleUpdateActiveSlide = (updatedSlide: Slide) => {
    if (!presentation) return;
    const nextSlides = presentation.slides.map((s, idx) => 
      idx === activeSlideIndex ? updatedSlide : s
    );
    setPresentation({ ...presentation, slides: nextSlides });
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (!presentation) return;
    if (presentation.slides.length <= 1) {
      alert("A presentation requires at least one slide.");
      return;
    }
    const nextSlides = presentation.slides.filter((_, i) => i !== indexToDelete);
    setPresentation({ ...presentation, slides: nextSlides });
    setActiveSlideIndex(Math.max(0, indexToDelete - 1));
  };

  // Reordering controls
  const handleMoveSlide = (fromIndex: number, direction: 'up' | 'down') => {
    if (!presentation) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= presentation.slides.length) return;

    const nextSlides = [...presentation.slides];
    const targetItem = nextSlides[fromIndex];
    nextSlides[fromIndex] = nextSlides[toIndex];
    nextSlides[toIndex] = targetItem;

    setPresentation({ ...presentation, slides: nextSlides });
    setActiveSlideIndex(toIndex);
  };

  // Image Replacement Engine inside active canvas and modal
  const triggerReplaceImageModal = (slideId: string) => {
    setActiveReplacementSlideId(slideId);
    setImageModalPrompt('');
    setHighlightError('');
  };

  const [highlightError, setHighlightError] = useState('');
  const handleConfirmImageReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplacementSlideId || !imageModalPrompt.trim() || !presentation) return;

    setIsReplacingImage(true);
    setHighlightError('');

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imageModalPrompt, aspectRatio: '16:9' }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const nextSlides = presentation.slides.map((s) => {
          if (s.id === activeReplacementSlideId) {
            return {
              ...s,
              image: {
                src: data.imageUrl,
                alt: imageModalPrompt,
                widthPercent: s.image?.widthPercent || 100
              }
            };
          }
          return s;
        });

        setPresentation({ ...presentation, slides: nextSlides });
        setActiveReplacementSlideId(null);
      } else {
        setHighlightError(data.errorMsg || 'Could not replace slide image.');
      }
    } catch (err: any) {
      setHighlightError(err.message || String(err));
    } finally {
      setIsReplacingImage(false);
    }
  };

  // Trigger export system utilizing media styles and chrome print rendering hooks
  const handleExportPDF = () => {
    setIsPreparingPrint(true);
    // Let browser state settle then trigger OS dialog
    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827] antialiased font-sans relative">
      
      {/* Dynamic media printing style elements embedded securely in DOM */}
      <style>{`
        @media print {
          body, .min-h-screen {
            background: white !important;
            color: black !important;
          }
          .no-print-wrapper {
            display: none !important;
          }
          .print-export-deck {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            z-index: 99999 !important;
          }
          .print-slide {
            page-break-after: always !important;
            break-after: page !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            padding: 4rem !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* RENDER STAGE A: EXPRT-PRINT FULL DECK (Rendered solely during window.print()) */}
      {isPreparingPrint && presentation && (
        <div className="hidden print-export-deck bg-white text-stone-900">
          {presentation.slides.map((s, i) => {
            const currentTheme = getTheme(presentation.themeId);
            return (
              <div 
                key={s.id} 
                className="print-slide flex flex-col justify-between border border-stone-100"
                style={{ contentVisibility: 'auto' }}
              >
                <div className="scale-95 origin-center h-full">
                  <SlideTemplates 
                    slide={s} 
                    theme={currentTheme} 
                    isActive={false} 
                    onUpdateSlide={() => {}} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER STAGE B: STANDARD BROWSER PREVIEW & CONTROLS */}
      <div className="flex-1 flex flex-col no-print-wrapper overflow-hidden h-screen">
        
        {/* UPPER PRIMARY NAVBAR */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/10 text-white">
              <LucideIcon name="Layers" size={16} />
            </div>
            <div>
              <span className="text-gray-950 font-display font-black tracking-tight text-sm">AI Presentation</span>
              <span className="text-gray-400 font-mono text-[10px] block leading-none font-bold">powered by Sarrthak Chauhan</span>
            </div>
          </div>

          {/* Connected secret indication badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isApiKeyActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-gray-500 font-bold">
              {isApiKeyActive ? 'AI Engaged (Secrets Active)' : 'Local Sandbox Engine Active'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {presentation && (
              <>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-950 border border-gray-200 flex items-center gap-1.5 transition whitespace-nowrap shadow-sm bg-white"
                >
                  <LucideIcon name="Presentation" size={13} />
                  <span>Present Deck</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm border border-transparent flex items-center gap-1.5 transition"
                >
                  <LucideIcon name="Download" size={13} />
                  <span>PDF Export</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* WORKSPACE SIDEBAR + PREVIEW COLUMN */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT DASHBOARD CONFIGRATION PANEL */}
          <aside className="w-80 md:w-96 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200 text-center text-xs text-gray-500 font-mono bg-gray-50/50">
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-3 flex items-center justify-center gap-1.5 border-b-2 hover:bg-gray-100/50 ${
                  activeTab === 'generate' ? 'text-gray-950 border-indigo-600 font-bold bg-white' : 'border-transparent'
                }`}
              >
                <LucideIcon name="FileCode" size={13} />
                <span>Text Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-3 flex items-center justify-center gap-1.5 border-b-2 hover:bg-gray-100/50 ${
                  activeTab === 'themes' ? 'text-gray-950 border-indigo-600 font-bold bg-white' : 'border-transparent'
                }`}
              >
                <LucideIcon name="Palette" size={13} />
                <span>Vibes</span>
              </button>
              <button
                onClick={() => setActiveTab('slides')}
                disabled={!presentation}
                className={`py-3 flex items-center justify-center gap-1.5 border-b-2 hover:bg-gray-100/50 disabled:opacity-30 disabled:cursor-not-allowed ${
                  activeTab === 'slides' ? 'text-gray-950 border-indigo-600 font-bold bg-white' : 'border-transparent'
                }`}
              >
                <LucideIcon name="SquareStack" size={13} />
                <span>Outline</span>
              </button>
            </div>

            {/* TAB CONTENT SPACES */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              
              {/* TAB 1: ANALYZE AND COMPOSE SLIDES */}
              {activeTab === 'generate' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-mono text-indigo-600 block font-black">Segmenting Engine</span>
                    <h2 className="text-base font-extrabold text-gray-900">Input Unstructured Content</h2>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Paste articles, research files, transcripts, or notes. The AI will intelligently divide content and lay it into custom-selected presentation slides.
                    </p>
                  </div>

                  {/* Preloaded Sample Selectors */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold block">Or select stunning outlines</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleLoadSample(topic.id)}
                          className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 transition font-medium"
                        >
                          🍃 {topic.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input TextArea */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>TEXT PANEL CONTENT</span>
                      <span>{inputText.length} chars</span>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your research, meeting agenda outline, or long paragraphs..."
                      rows={10}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans leading-relaxed resize-y scrollbar-thin"
                    />
                  </div>

                  {/* Action Trigger Button */}
                  <button
                    onClick={handleGeneratePresentation}
                    disabled={isLoading || !inputText.trim()}
                    className="w-full py-3 rounded-xl font-mono text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <div className="flex items-center gap-2">
                          <LucideIcon name="Loader" className="animate-spin text-white" size={14} />
                          <span>AI COMPILING SLIDES...</span>
                        </div>
                        {statusMessage && (
                          <span className="text-[8px] tracking-tight opacity-50 block animate-pulse">
                            {statusMessage}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <LucideIcon name="Sparkles" size={14} />
                        <span>✨ COMPOSE SLIDES DECK</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[10px] leading-relaxed text-[#4b5563] space-y-1.5">
                    <span className="font-bold text-indigo-900 uppercase font-mono block">Creative templates:</span>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[#4b5563]">
                      <li>Decides splits via density</li>
                      <li>Extracts statistics & timelines</li>
                      <li>Formats quotes in serif classics</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: SELECT VISUAL THEME */}
              {activeTab === 'themes' && (
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onSelectTheme={(themeId) => {
                    setSelectedThemeId(themeId);
                    if (presentation) {
                      setPresentation({ ...presentation, themeId: themeId });
                    }
                  }}
                />
              )}

              {/* TAB 3: SLIDES NAVIGATION OUTLINE TREE */}
              {activeTab === 'slides' && presentation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-mono text-indigo-400 block font-bold">Presentation Deck</span>
                      <h3 className="text-sm font-bold text-white">Sequential Slides</h3>
                    </div>
                    <span className="text-xs font-mono text-stone-500">
                      {presentation.slides.length} slides
                    </span>
                  </div>

                  {/* Nested Slides Outline with Instant Jumping & Quick sorting */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {presentation.slides.map((s, idx) => {
                      const isActive = idx === activeSlideIndex;
                      const hasImage = !!s.image;
                      
                      return (
                        <div
                          key={s.id}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`w-full group p-3 rounded-xl border text-left transition-all duration-150 relative flex items-start gap-3 cursor-pointer ${
                            isActive
                              ? 'border-indigo-650 bg-indigo-50/60 text-gray-950 font-medium'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 shadow-sm'
                          }`}
                        >
                          {/* Mini numeric anchor index badge */}
                          <div className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0 pr-1 space-y-1">
                            <h4 className="text-xs font-bold leading-tight truncate text-gray-900">
                              {s.title || 'Untitled Slide'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-mono uppercase bg-gray-50 border border-gray-150 px-1 py-0.5 rounded text-gray-550 font-bold">
                                {s.layout?.split('_').join(' ')}
                              </span>
                              {hasImage && (
                                <LucideIcon name="Image" size={10} className="text-indigo-650" />
                              )}
                            </div>
                          </div>

                          {/* Quick miniature rearrangement shortcuts */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSlide(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className="text-gray-400 hover:text-gray-800 disabled:opacity-20"
                            >
                              ▲
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSlide(idx, 'down');
                              }}
                              disabled={idx === presentation.slides.length - 1}
                              className="text-gray-400 hover:text-gray-800 disabled:opacity-20"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Append Template Control Block */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black block">
                      + Insert custom slide layout
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-medium">
                      <button
                        onClick={() => handleAddNewSlide('content_bullet')}
                        className="py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium hover:text-gray-950 shadow-sm transition"
                      >
                        + List Points
                      </button>
                      <button
                        onClick={() => handleAddNewSlide('split_media')}
                        className="py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium hover:text-gray-950 shadow-sm transition"
                      >
                        + Split Media
                      </button>
                      <button
                        onClick={() => handleAddNewSlide('big_stat')}
                        className="py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium hover:text-gray-950 shadow-sm transition"
                      >
                        + Jumbo Stat
                      </button>
                      <button
                        onClick={() => handleAddNewSlide('quote')}
                        className="py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium hover:text-gray-950 shadow-sm transition"
                      >
                        + Classic Quote
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Sidebar bottom signature block */}
            <div className="p-4 border-t border-gray-200 text-[10px] font-mono text-gray-400 font-bold select-none flex justify-between items-center bg-gray-50">
              <span>ACTIVE SCHEMA: PRESENTATION</span>
              <span>v1.2</span>
            </div>
          </aside>

          {/* MAIN COLUMN: REAL-TIME PREMIUM SLIDES STAGE */}
          <main className="flex-1 overflow-y-auto bg-[#F3F4F6] p-6 lg:p-10 flex flex-col items-center justify-center relative">
            
            {presentation ? (
              <div className="w-full max-w-4xl space-y-6 flex flex-col items-center">
                
                {/* Visual feedback notice of inline editability */}
                <div className="text-center text-[11px] text-gray-600 bg-white border border-gray-200 px-4 py-1.5 rounded-full select-none flex items-center gap-1.5 shadow-sm">
                  <LucideIcon name="Info" size={13} className="text-indigo-600" />
                  <span>Interactive Mode: Click directly on titles or lists to edit text inline.</span>
                </div>

                {/* Aspect-video slide container with custom background style */}
                <div className="w-full aspect-[16/9] relative rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-200/50 bg-white">
                  
                  {/* Dynamic background mapping based on active presentation theme */}
                  <div className={`absolute inset-0 w-full h-full p-8 md:p-12 overflow-y-auto flex flex-col justify-between transition-all duration-300 ${
                    getTheme(presentation.themeId).bgClass
                  }`}>
                    
                    {/* Decorative Right-Top Circular Accent for Clean Minimalism look */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />

                    {/* Animated Stage Elements */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlideIndex}
                        initial={{ opacity: 0, scale: 0.98, y: 3 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full relative"
                      >
                        <SlideTemplates
                          slide={presentation.slides[activeSlideIndex]}
                          theme={getTheme(presentation.themeId)}
                          isActive={true}
                          onUpdateSlide={handleUpdateActiveSlide}
                          onSelectImageReplace={triggerReplaceImageModal}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Interactive Sliders Navigation Controls */}
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-md">
                  <button
                    onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activeSlideIndex === 0}
                    className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Previous Slide"
                  >
                    <LucideIcon name="ChevronLeft" size={14} />
                  </button>

                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gray-400 select-none px-1">
                    <span className="font-black text-gray-800">{activeSlideIndex + 1}</span>
                    <span>/</span>
                    <span>{presentation.slides.length}</span>
                  </div>

                  <button
                    onClick={() => setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                    disabled={activeSlideIndex === presentation.slides.length - 1}
                    className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Next Slide"
                  >
                    <LucideIcon name="ChevronRight" size={14} />
                  </button>
                  
                  <span className="h-4 w-px bg-gray-200 mx-1" />

                  {/* Quick Layout Sidebar Toggle button */}
                  <button
                    onClick={() => {
                      // Trigger sliding drawer in-app
                      setActiveTab('slides');
                    }}
                    className="text-[11px] font-mono font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 py-1 px-2.5 rounded-full hover:bg-indigo-50 transition"
                  >
                    <LucideIcon name="SquareTerminal" size={12} className="text-indigo-600" />
                    <span>Controls</span>
                  </button>
                </div>

                {/* SLIDE-SPECIFIC CUSTOM COMPILER SECTION (Drawer floating directly below canvas) */}
                <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-4xl text-gray-800">
                  <SlideEditor
                    slide={presentation.slides[activeSlideIndex]}
                    onUpdateSlide={handleUpdateActiveSlide}
                    onDeleteSlide={() => handleDeleteSlide(activeSlideIndex)}
                    onMoveUp={() => handleMoveSlide(activeSlideIndex, 'up')}
                    onMoveDown={() => handleMoveSlide(activeSlideIndex, 'down')}
                    isFirst={activeSlideIndex === 0}
                    isLast={activeSlideIndex === presentation.slides.length - 1}
                  />
                </div>

              </div>
            ) : (
              <div className="max-w-xl text-center space-y-6 px-4">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center mx-auto text-indigo-650 shadow-sm animate-bounce">
                  <LucideIcon name="Sparkles" size={36} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-black tracking-tight text-gray-900 sm:text-3xl">
                    Create Presentation Masterpieces
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                    Paste raw thoughts, articles, or select one of our curated sample outlines on commercial space travel, healthcare diagnostics, or tea preparation rituals to compile instantly.
                  </p>
                </div>
                <div className="flex gap-3 justify-center items-center">
                  <button
                    onClick={() => {
                      handleLoadSample('space-tourism');
                      handleGeneratePresentation();
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    🚀 Try Instant Space Pitch
                  </button>
                </div>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* RENDER STAGE C: IMMERSIVE FULL-SCREEN PRESENTER VIEW */}
      {isFullscreen && presentation && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col justify-between p-6 select-none animate-fade-in no-print-wrapper animate-fade-in">
          
          {/* Immersive Presenter Top Bar controls */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-widest font-mono text-indigo-400">PRESENTING FULLSCREEN</span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-300 font-bold text-sm">{presentation.title}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400">
                [ Left / Right Arrow keys click to navigate ]
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition"
              >
                Exit Show [ESC]
              </button>
            </div>
          </div>

          {/* Aspect ratio bounding grid box with custom background style */}
          <div className="flex-1 max-w-6xl mx-auto w-full aspect-[16/9] bg-[#111] my-8 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className={`absolute inset-0 w-full h-full p-12 md:p-14 transition-all duration-300 ${
              getTheme(presentation.themeId).bgClass
            }`}>
              <SlideTemplates
                slide={presentation.slides[activeSlideIndex]}
                theme={getTheme(presentation.themeId)}
                isActive={true}
                onUpdateSlide={() => {}} 
              />
            </div>
          </div>

          {/* Immersive Presenter Bottom Navigator dots */}
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-4 text-white">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="text-white hover:text-indigo-400 disabled:opacity-20 text-xs font-bold transition"
            >
              ← PREVIOUS
            </button>

            <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
              <span>{activeSlideIndex + 1} OF {presentation.slides.length}</span>
              <div className="flex gap-1">
                {presentation.slides.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === activeSlideIndex ? 'bg-indigo-500' : 'bg-stone-800'}`} 
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === presentation.slides.length - 1}
              className="text-white hover:text-indigo-400 disabled:opacity-20 text-xs font-bold transition"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}

      {/* RENDER STAGE D: MAIN MODAL FOR REPLACEIMAGE BY THEME CONTEXT */}
      {activeReplacementSlideId && (
        <div className="fixed inset-0 z-[1050] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4 text-gray-800"
          >
            <button 
              onClick={() => setActiveReplacementSlideId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-mono text-2xl"
            >
              ×
            </button>
            
            <div className="flex items-center gap-2 text-indigo-600">
              <LucideIcon name="Sparkles" size={18} />
              <h3 className="font-display font-black text-sm text-gray-900">AI Visualizer Assistant</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Let's update the visual asset for this slide. State your ideal graphic photo or illustration style.
            </p>

            <form onSubmit={handleConfirmImageReplace} className="space-y-4">
              <input
                type="text"
                value={imageModalPrompt}
                onChange={(e) => setImageModalPrompt(e.target.value)}
                placeholder="e.g. Kyoto garden during storm, vector sketch aesthetic, tech overlay..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />

              {highlightError && (
                <span className="text-[10px] text-red-500 block">{highlightError}</span>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveReplacementSlideId(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-150 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplacingImage || !imageModalPrompt.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition"
                >
                  {isReplacingImage ? (
                    <>
                      <LucideIcon name="Loader" size={12} className="animate-spin text-white" />
                      Rendering...
                    </>
                  ) : (
                    "Regenerate visual"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
