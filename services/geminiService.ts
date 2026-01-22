
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, GenerationResult, CalendarResult, KnowledgeEntry } from "../types";

export const generateContent = async (state: AppState): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const topicTraining = state.categoryTraining[state.topic] || [];
  const trainingInstructions = topicTraining.length > 0
    ? `SPECIFIC CATEGORY STYLE ANCHOR (Replicate this exact rhythm for ${state.topic}):
       ${topicTraining.map((t, i) => `Sample ${i + 1}:\n${t}`).join('\n---\n')}
       
       MANDATORY STYLE REPLICATION:
       1. Replicate emoji density and placement.
       2. Replicate the specific level of technicality/politeness.
       3. Replicate the typical persuasive flow.`
    : '';

  const learnedPreferences = state.copyHistory.length > 0 
    ? `USER PREFERENCE FEEDBACK:
       ${state.copyHistory.map((text, i) => `Sample:\n${text}`).slice(-3).join('\n---\n')}`
    : '';

  const emojiInstructions = `Incorporate these emojis naturally: ${state.selectedEmojiSet}`;

  const systemInstruction = `
    You are a world-class Myanmar (Burmese) language editor and expert content strategist for ${state.brand}.
    
    CRITICAL: SERVICE ISOLATION PROTOCOL
    - You must strictly isolate the current topic: "${state.topic}".
    - DO NOT mix services. If the topic is "Airport Assistant", DO NOT mention TM30 or Visa Extensions unless explicitly requested.
    - Treat each service as a distinct business vertical. 
    - Ignored mismatched facts from the Knowledge Bank. If a fact keyword is "TM30" and the topic is "Airport", DISCARD that fact.

    KNOWLEDGE BANK INTEGRATION:
    - ONLY integrate the following facts if they are SEMANTICALLY RELEVANT to "${state.topic}":
    ${state.knowledgeBase.map(k => `[Fact for ${k.keyword}]: ${k.fact}`).join('\n')}

    TONE SPECIALIZATION:
    - Base Tone: ${state.tone}.
    - If 'Authoritative/Legal': Use highly formal, precise Myanmar legal terminology (e.g., "ဥပဒေအရ", "စည်းမျဉ်းစည်းကမ်းနှင့်အညီ"). Avoid conversational particles.
    
    FORMAT SPECIALIZATION:
    - Base Format: ${state.format}.
    - If 'Formal Press Release': Use the standard PR structure: [မြို့အမည်]၊ [နေ့စွဲ] — [သတင်းခေါင်းစဉ်]၊ [သတင်းကိုယ်ထည်]၊ [Media Contact/Boilerplate]. Use diplomatic Myanmar prose.

    READABILITY & FLOW:
    - Use short paragraphs and clear line breaks (\n\n).
    - Ensure text is scannable.

    HASHTAG STRATEGY:
    - Generate 5-8 relevant hashtags in English and Burmese.
  `;

  const prompt = `
    Generate content for:
    Topic: ${state.topic}
    Format: ${state.format}
    Tone: ${state.tone}
    Intent: ${state.intent}
    Length: ${state.contentLength}
    
    Competitor Patterns to mimic (if any): ${state.competitors || 'None. Rely on internal logic.'}

    YOUR TASK:
    - 3 Patterns: Analyze the structural logic of this service.
    - 3 Original Drafts: ad-ready content.
    - Variants: Provide 3 tone variants and 2 style variants.
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
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                body: { type: Type.STRING },
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a professional assistant for ${brandName}. Answer based ONLY on verified facts.`;
  const memoryContext = knowledge.map(k => `Fact: ${k.keyword} - ${k.fact}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `FACTS:\n${memoryContext}\n\nQUESTION: "${clientMessage}"`,
    config: { systemInstruction, temperature: 0.1 },
  });
  return response.text || "တောင်းပန်ပါသည်။ ပြန်လည်ဖြေကြားရန် အဆင်မပြေဖြစ်နေပါသည်။";
};

export const generateCalendar = async (state: AppState): Promise<CalendarResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Plan 30 days of strategic content for ${state.brand}.`,
    config: {
      systemInstruction: "You are a senior content planner.",
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
