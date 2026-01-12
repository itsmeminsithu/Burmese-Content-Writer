
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, GenerationResult, CalendarResult, PromptPack, KnowledgeEntry } from "../types";

export const generateContent = async (state: AppState): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are a world-class Myanmar (Burmese) language editor and expert content strategist for ${state.brand}.
    
    CRITICAL GRAMMAR STANDARDS:
    - Use Standard Myanmar Burmese (မြန်မာစာ စံနှုန်း) exclusively.
    - Ensure sentence endings are professional (ပါသည်၊ ပါတယ်) and logically linked.
    - No slang, no hype, no unnecessary English loanwords.

    KNOWLEDGE BANK INTEGRATION:
    - Use the following facts if they relate to the topic:
    ${state.knowledgeBase.map(k => `${k.keyword}: ${k.fact}`).join('\n')}

    LENGTH CONTROL:
    - Strictly follow ${state.contentLength}.
    - Short: Snappy (3-4 sentences).
    - Medium: Balanced (2-3 paragraphs).
    - Long: Comprehensive (4+ paragraphs).

    FORMAT SPECIALIZATION (MANDATORY STRUCTURE):
    - 'Detailed Article': 
        1. H1 Title: A compelling headline.
        2. Lead Paragraph: A strong hook that summarizes the value.
        3. 2-3 Section Subheadings: Use Markdown H2 (## ခေါင်းစဉ်) to divide sections.
        4. Detailed Body Content: Rich information under each subheading.
        5. Summary Conclusion: A professional wrap-up of the key points.
    - 'Whitepaper Guide':
        1. Professional Title.
        2. Executive Summary (အနှစ်ချုပ်): High-level overview.
        3. Background/Context (လက်ရှိအခြေအနေ): Problem statement.
        4. Detailed Analysis/Solution (သုံးသပ်ချက်နှင့် ဖြေရှင်းချက်): Use H2 headers for sections.
        5. Expert Recommendations (အကြံပြုချက်များ): Actionable advice.
    - 'Formal Press Release': Diplomatic Myanmar prose with Dateline, Lead, Quote, and Boilerplate.
    - 'Social Media': Engaging, polite, and authoritative with clear bullet points.

    TONE & INTENT:
    - Base Tone: ${state.tone}.
    - Goal: ${state.intent}.
  `;

  const prompt = `
    Topic: ${state.topic}
    Format: ${state.format}
    Intent: ${state.intent}
    Length: ${state.contentLength}
    Tone: ${state.tone}
    [COMPETITOR DNA]: ${state.competitors || 'None. Use pro-baseline.'}

    TASK:
    - 3 Patterns: Structural logic analysis.
    - 3 Original Drafts: Fully polished Myanmar drafts. 
        * For 'Detailed Article', ensure the output follows the 5-point structure (H1, Lead, H2 Sections, Body, Conclusion).
        * For 'Whitepaper Guide', follow the strategic education structure.
        * Use Markdown for headers within the 'body' property.
    - 3 Tone Variants: Professional, Authoritative/Legal, Luxury VIP.
    - 2 Style Variants: Minimalist, Narrative.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patterns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                example: { type: Type.STRING },
              },
              required: ['name', 'description', 'example'],
            }
          },
          originalPosts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING, description: "The H1 Title for Articles/Whitepapers or the primary headline." },
                hook: { type: Type.STRING, description: "The lead paragraph or initial hook of the content." },
                body: { type: Type.STRING, description: "The main content. For Articles/Whitepapers, include Markdown H2 subheadings and detailed sections here." },
                cta: { type: Type.STRING },
                emojis: { type: Type.STRING },
                hashtags: { type: Type.STRING },
              },
              required: ['id', 'hook', 'body', 'cta', 'emojis', 'hashtags'],
            },
          },
          toneVariants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tone: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ['tone', 'content'],
            }
          },
          styleVariants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ['style', 'content'],
            }
          }
        },
        required: ['patterns', 'originalPosts', 'toneVariants', 'styleVariants'],
      },
    },
  });

  return JSON.parse(response.text.trim());
};

export const generateSmartReply = async (clientMessage: string, knowledge: KnowledgeEntry[], brandName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const systemInstruction = `You are the 'Memory-Link' AI for ${brandName}. Answer client questions based on provided facts with perfect Myanmar grammar. Tone: Calm, elite, respectful.`;
  const memoryContext = knowledge.map(k => `[FACT: ${k.keyword}] -> ${k.fact}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `KNOWLEDGE:\n${memoryContext}\n\nQUESTION: "${clientMessage}"`,
    config: { systemInstruction, temperature: 0.2 },
  });
  return response.text || "တောင်းပန်ပါသည်။ ပြန်လည်ဖြေကြားရန် အဆင်မပြေဖြစ်နေပါသည်။";
};

export const generateStrategyPack = async (state: AppState): Promise<PromptPack> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Build strategy for ${state.brand}`,
    config: {
      systemInstruction: "Brand consultant mode.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, prompt: { type: Type.STRING } }, required: ['category', 'prompt'] } },
          toneStyleLibrary: { type: Type.STRING },
          calendarGeneratorPrompt: { type: Type.STRING }
        },
        required: ['prompts', 'toneStyleLibrary', 'calendarGeneratorPrompt']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateCalendar = async (state: AppState): Promise<CalendarResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Plan 30 days for ${state.brand}`,
    config: {
      systemInstruction: "Content manager mode.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { monthName: { type: Type.STRING }, entries: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, topic: { type: Type.STRING }, format: { type: Type.STRING }, hook: { type: Type.STRING }, goal: { type: Type.STRING } }, required: ['day', 'topic', 'format', 'hook', 'goal'] } } },
        required: ['monthName', 'entries'],
      },
    },
  });
  return JSON.parse(response.text.trim());
};
