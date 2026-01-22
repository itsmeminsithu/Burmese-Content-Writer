
export enum ContentFormat {
  FACEBOOK = 'Facebook Post',
  TIKTOK = 'TikTok Caption',
  CAROUSEL = 'Carousel Script (5 slides)',
  REPLY = 'Reply to Comment',
  DM = 'DM Auto-Reply',
  AD_COPY = 'Ad Copy (Primary + Headline + Description)',
  ARTICLE = 'Detailed Article',
  WHITEPAPER = 'Whitepaper Guide',
  PRESS_RELEASE = 'Formal Press Release'
}

export enum ContentLength {
  SHORT = 'Short (Snappy & Concise)',
  MEDIUM = 'Medium (Balanced & Informative)',
  LONG = 'Long (Detailed & Comprehensive)'
}

export enum Tone {
  CALM = 'Calm',
  LUXURY = 'Luxury VIP',
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  URGENT = 'Urgent',
  SERIOUS = 'Serious',
  AUTHORITATIVE = 'Authoritative/Legal'
}

export enum Intent {
  AWARENESS = 'Awareness',
  LEAD = 'Lead Generation',
  TRUST = 'Trust-building',
  FAQ = 'FAQ/Educational',
  AUTHORITY = 'Establishing Authority'
}

export enum Language {
  ENGLISH = 'English',
  BURMESE = 'Burmese',
  THAI = 'Thai'
}

export interface GeneratedPost {
  id: string;
  title?: string;
  hook: string;
  body: string;
  cta: string;
  emojis: string;
  hashtags: string;
}

export interface ToneVariant {
  tone: string;
  content: string;
}

export interface StyleVariant {
  style: string;
  content: string;
}

export interface Pattern {
  name: string;
  description: string;
  example: string;
}

export interface GenerationResult {
  patterns: Pattern[];
  originalPosts: GeneratedPost[];
  toneVariants: ToneVariant[];
  styleVariants: StyleVariant[];
}

export interface CalendarEntry {
  day: number;
  date?: string;
  topic: string;
  format: string;
  hook: string;
  goal: string;
  content?: string;
}

export interface CalendarResult {
  monthName: string;
  entries: CalendarEntry[];
}

export interface KnowledgeEntry {
  id: string;
  keyword: string;
  fact: string;
}

export interface AppState {
  brand: string;
  audience: string;
  competitors: string;
  topic: string;
  format: ContentFormat;
  contentLength: ContentLength;
  tone: Tone;
  intent: Intent;
  language: Language;
  topCategories: string[];
  knowledgeBase: KnowledgeEntry[];
  copyHistory: string[];
  copyCount: number;
  categoryTraining: Record<string, string[]>;
  savedDrafts: GeneratedPost[];
  selectedEmojiSet: string;
}
