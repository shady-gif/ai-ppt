import express from 'express';
import path from 'path';
import { env } from 'process';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for GoogleGenAI to ensure it doesn't crash if key is missing during boot
let googleAIClient: GoogleGenAI | null = null;
function getGoogleAI() {
  if (!googleAIClient) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.');
    }
    googleAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return googleAIClient;
}

// ---------------------------------------------------------
// Mock Slide Generation for fallback
// If no API key is specified, let's gracefully fall back to a clever local analyzer
// so the user can still preview the interface.
// ---------------------------------------------------------
function generateMockPresentation(input: string, theme: string): any {
  const cleanInput = input.trim();
  const title = "Your presentation on: " + (cleanInput.split('\n')[0]?.substring(0, 40) || "Uploaded Notes");
  const paragraphs = cleanInput.split('\n').filter(p => p.trim().length > 10);
  
  const slides: any[] = [
    {
      id: "slide_1",
      title: "Cover",
      layout: "cover",
      accentText: "AI GENERATED DECK",
      content: [
        title,
        "An automated visual curation of your unstructured research and notes.",
        "Created with AI Presentation Generator"
      ],
      highlight: "Notes analyzed successfully in Sandbox Play Mode"
    }
  ];

  if (paragraphs.length === 0) {
    slides.push({
      id: "slide_2",
      title: "How to get started",
      layout: "content_bullet",
      accentText: "QUICK START GUIDE",
      content: [
        "Paste your research notes, outlines, or articles into the raw text panel.",
        "Choose a high-aesthetic theme tailored to your audience.",
        "Wait a few seconds for AI to summarize, structure, and create slides.",
        "Export your slides directly to PPT/PDF or run fullscreen presentation."
      ],
      highlight: "Add your GEMINI_API_KEY to unlock full semantic layout generation!"
    });
  } else {
    // Dynamically map paragraphs to slides
    paragraphs.forEach((p, idx) => {
      const num = idx + 2;
      const heading = p.substring(0, 30) + "...";
      const words = p.split(' ');
      const bullet1 = p.substring(0, Math.floor(p.length / 2));
      const bullet2 = p.substring(Math.floor(p.length / 2));
      
      const layouts: any[] = ["content_bullet", "split_media", "big_stat", "quote", "timeline", "comparison"];
      const layout = layouts[idx % layouts.length];

      slides.push({
        id: `slide_${num}`,
        title: `Section ${idx + 1}: Key Points`,
        layout: layout,
        accentText: `INSIGHTS PART ${idx + 1}`,
        content: [
          bullet1.trim(),
          bullet2.trim(),
          "Generated automatically from your input text block."
        ],
        highlight: idx % 2 === 0 ? "Key quote: '" + words.slice(0, 6).join(' ') + "...'" : undefined,
        visualSuggestion: {
          type: (layout === "big_stat" ? "chart" : "icon") as any,
          label: "Visual context overview",
          iconName: "Compass",
          data: layout === "big_stat" ? [{ label: "A", value: 75 }, { label: "B", value: 25 }] : undefined
        }
      });
    });
  }

  slides.push({
    id: "slide_conclusion",
    title: "Thank You & Final Thoughts",
    layout: "conclusion",
    accentText: "SUMMARY",
    content: [
      "Let's review the main highlights of the presentation.",
      "Feel free to customize, reorder, or edit individual blocks directly.",
      "Join the conversation or launch your startup deck today."
    ],
    highlight: "Presented securely from your browser workspace"
  });

  return {
    title: title,
    subtitle: "A visual digest of raw ideas and structural summaries",
    slides
  };
}

// ---------------------------------------------------------
// SERVER ENDPOINTS
// ---------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!env.GEMINI_API_KEY
  });
});

// Presentation Generation via Gemini
app.post('/api/presentations/generate', async (req, res) => {
  const { notes, themeId } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim() === '') {
    return res.status(400).json({ error: 'Notes or raw text input is required.' });
  }

  // Graceful fallback if apiKey is missing
  if (!env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY detected in environment. Returning fallback mockup deck.");
    const fallbackDeck = generateMockPresentation(notes, themeId || 'minimal');
    return res.json({
      success: true,
      presentation: fallbackDeck,
      warning: "No Gemini API key found. Using beautiful procedural templates."
    });
  }

  try {
    const ai = getGoogleAI();

    const systemInstruction = `
You are an expert design-forward presentation consultant (like Gamma or Canva designers). 
Your task is to analyze unstructured raw notes, research papers, outline scripts, or documentation and transform them into a coherent, highly structured presentation outline in JSON.

Guidelines for visual segmenting:
1. **Curate and Filter**: Condense paragraphs into elegant, concise bullet points (max 15 words per bullet). Never dump long text.
2. **Cohesive Flow**: Ensure a narrative flow from title/hook -> details -> summary. Always generate:
   - A starting 'cover' slide.
   - 4 to 8 detailed content slides of mixed formats.
   - An ending 'conclusion' slide.
3. **Template Library Layout Matching**: Pick the layout that matches the semantic type of content:
   - 'cover': Only for the first slide.
   - 'content_bullet': For standard, dense, readable outlines.
   - 'split_media': For slides talking about a central concept/visual with helper lists. Use when a descriptive picture or prompt fits beautifully.
   - 'big_stat': For highly technical metrics, market size, growth numbers, or specific calculations.
   - 'quote': For inspiring notes, client testimonies, user insights, or vision blocks.
   - 'timeline': For structural history, step-by-step product roadmap, or sequential steps.
   - 'comparison': To contrast perspectives (pros/cons, before/after, free/pro, client/competitor).
   - 'conclusion': Only for the last slide. Warm closing notes, contacts, and key takeaways.
4. **Visual Suggestions**: Suggest custom, creative charts, lucide-icons, or visual indicators:
   - Provide an imagePrompt (under visualSuggestion or image) if appropriate, with a detailed description of a futuristic, minimal vector art drawing or photography.
   - Select valid Lucide icon names (e.g. Compass, Sparkles, TrendingUp, Cpu, Award, Zap, Users, BarChart3, Layers, BookOpen, Clock, Activity, Target).
   - Provide visual suggestion data (like numeric datasets for charts, lists of metrics).
5. Ensure fields like 'accentText' have short powerful tags (e.g., "MARKET OUTLOOK", "METRICS", "VISION").
6. Ensure random unique IDs are generated for each slide (e.g., "slide_n1", "slide_n2" etc.).
7. Ensure JSON conforms strictly to the specified schema type. Do not truncate the JSON.
`;

    const userPrompt = `
Analyze the following notes and compile an incredibly aesthetic presentation. Note input:
---
${notes}
---

Selected theme vibe: ${themeId || 'minimal'}. Create rich slides.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'subtitle', 'slides'],
          properties: {
            title: {
              type: Type.STRING,
              description: 'The overall title of the generated presentation deck.'
            },
            subtitle: {
              type: Type.STRING,
              description: 'A professional sub-headline summarizing the value of the deck.'
            },
            slides: {
              type: Type.ARRAY,
              description: 'The curated sequence of slides for the presentation.',
              items: {
                type: Type.OBJECT,
                required: ['id', 'title', 'layout', 'content'],
                properties: {
                  id: {
                    type: Type.STRING,
                    description: 'A unique short id (e.g., slide_a1).'
                  },
                  title: {
                    type: Type.STRING,
                    description: 'The heading of this slide.'
                  },
                  layout: {
                    type: Type.STRING,
                    description: 'The targeted slide layout pattern.',
                    enum: ['cover', 'content_bullet', 'split_media', 'big_stat', 'quote', 'timeline', 'comparison', 'conclusion']
                  },
                  accentText: {
                    type: Type.STRING,
                    description: 'Short decorative context marker or category tag (e.g., "CASE STUDY", "ROADMAP").'
                  },
                  content: {
                    type: Type.ARRAY,
                    description: 'The key concise details or points for the layout.',
                    items: {
                      type: Type.STRING
                    }
                  },
                  highlight: {
                    type: Type.STRING,
                    description: 'A key takeaway sentence, brief statistic footer, or high-impact quote.'
                  },
                  visualSuggestion: {
                    type: Type.OBJECT,
                    required: ['type', 'label'],
                    properties: {
                      type: {
                        type: Type.STRING,
                        enum: ['chart', 'icon', 'image', 'comparison', 'timeline']
                      },
                      label: {
                        type: Type.STRING,
                        description: 'A description of what this component symbolizes.'
                      },
                      data: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ['label', 'value'],
                          properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                          }
                        },
                        description: 'Simple numeric dataset representation (optional, for charts).'
                      },
                      iconName: {
                        type: Type.STRING,
                        description: 'A valid Lucide React icon name (e.g. Sparkles, TrendingUp, Zap, Cpu).'
                      },
                      imagePrompt: {
                        type: Type.STRING,
                        description: 'The creative prompt for image generation based on this slide content.'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const presentationData = JSON.parse(outputText.trim());
    
    // Inject some rich picture fallback states if needed
    if (presentationData.slides && Array.isArray(presentationData.slides)) {
      presentationData.slides = presentationData.slides.map((s: any, idx: number) => {
        // Ensure standard properties exist
        if (!s.image && (s.layout === 'split_media' || (s.visualSuggestion && s.visualSuggestion.type === 'image'))) {
          const keyword = encodeURIComponent(s.title?.toLowerCase().split(' ').slice(0, 2).join('-') || 'presentation');
          s.image = {
            src: `https://picsum.photos/seed/${keyword || idx}/800/450`,
            alt: s.title || 'Slide Visual',
            widthPercent: 100
          };
        }
        return s;
      });
    }

    res.json({
      success: true,
      presentation: presentationData
    });

  } catch (error: any) {
    console.error("Gemini Presentation Generation Error:", error);
    res.status(500).json({
      error: 'Failed to generate presentation using Gemini AI.',
      message: error.message || String(error)
    });
  }
});

// Image Generation Endpoint helper for replacing images
app.post('/api/image/generate', async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  const keyword = encodeURIComponent(prompt?.replace(/\s+/g, '-').slice(0, 30) || 'media');
  
  // We provide instant aesthetic fallback
  const picSumFallback = `https://picsum.photos/seed/${keyword}-${Math.floor(Math.random() * 1000)}/800/450`;

  if (!env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      imageUrl: picSumFallback,
      isFallback: true,
      warning: "GEMINI_API_KEY is not defined. Falling back to Picsum generator."
    });
  }

  try {
    const ai = getGoogleAI();
    console.log(`Generating client image for prompt: "${prompt}" using gemini-2.5-flash-image`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `High dynamic aesthetic photo/illustration: ${prompt}. Clean background, modern, visual key visual.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || '16:9',
        },
      },
    });

    let generatedBase64: string | null = null;
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (generatedBase64) {
      return res.json({
        success: true,
        imageUrl: `data:image/png;base64,${generatedBase64}`
      });
    } else {
      console.log("No inline image returned from API. Using Picsum fallback.");
      return res.json({
        success: true,
        imageUrl: picSumFallback,
        isFallback: true
      });
    }

  } catch (err: any) {
    console.error("Gemini Image Generation failure:", err);
    // Be robust: respond with the Picsum fallback! Always keep app running.
    return res.json({
      success: true,
      imageUrl: picSumFallback,
      isFallback: true,
      errorMsg: err.message || String(err)
    });
  }
});

// -------------------------------------------------------------
// VERCEL SERVERLESS EXPORT
// -------------------------------------------------------------

// We remove app.listen and the static file serving because Vercel 
// handles routing and server management automatically.
export default app;