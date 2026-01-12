
import React from 'react';
import { AppState, ContentFormat, ContentLength, Tone, Intent, Language, KnowledgeEntry } from './types';

export const DEFAULT_KNOWLEDGE: KnowledgeEntry[] = [
  { id: '1', keyword: 'TR Visa Extension Price', fact: 'TR Visa extension costs 1,900 THB for the official fee. Service fee is additional depending on document support.' },
  { id: '2', keyword: 'Extension Duration', fact: 'A Tourist Visa (TR) can usually be extended for an additional 30 days.' },
  { id: '3', keyword: 'Documents Needed', fact: 'Requires Passport, TM6 (if applicable), TM30 notification, and a 4x6 photo.' },
  { id: '4', keyword: 'TDAC Registration', fact: 'TDAC registration is required for workers. We assist in the submission process to ensure correct data entry.' },
  { id: '5', keyword: 'TM30 Service', fact: 'TM30 Form အမြန်ရရှိရေး ဝန်ဆောင်မှု။ ၁၅ မိနစ်အတွင်း အပြီးအစီး ဆောင်ရွက်ပေးသည်။ ဝန်ဆောင်ခ ၁၅၀ ဘတ် (150 THB) သာ ကျသင့်မည်။ လိုအပ်သော စာရွက်စာတမ်းများမှာ - အိမ်ရှင်၏ ID၊ အိမ်လိပ်စာ အပြည့်အစုံ နှင့် အိမ်လိပ်စာချုပ် (House Contract) တို့ ဖြစ်ပါသည်။' },
  { id: '6', keyword: 'Letter Service', fact: 'သံရုံးထောက်ခံစာ (Embassy Letter) နှင့် အခြား လိုအပ်သော ထောက်ခံစာများအား ကျွမ်းကျင်စွာ စီစဉ်ဆောင်ရွက်ပေးပါသည်။' }
];

export const DEFAULT_STATE: AppState = {
  brand: 'Thailand Easy Pass / Easy Visa For Myanmar',
  audience: 'Myanmar travelers to Thailand',
  competitors: '',
  topic: 'Visa Extension',
  format: ContentFormat.FACEBOOK,
  contentLength: ContentLength.MEDIUM,
  tone: Tone.CALM,
  intent: Intent.TRUST,
  language: Language.BURMESE,
  topCategories: ['Visa Extension', 'TDAC Registration', 'TR Visa Support', 'Airport Assistant', 'Knowledge Post'],
  knowledgeBase: DEFAULT_KNOWLEDGE
};

export const CATEGORIES = [
  'Visa Extension',
  'TDAC Registration',
  'TM30 Service',
  'Letter Service',
  'TR Visa Support',
  'Airport Assistant',
  'Knowledge Post',
  'Document Checklist',
  'Health Insurance',
  'Elite VIP Service',
  'Arrival Tips'
];

export const ICONS = {
  Brand: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.5a2.5 2.5 0 002.5 2.5h1.065m-1.385 1.73a9 9 0 11-11.233-13.111" />
    </svg>
  ),
  Pen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Strategy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Inbox: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
};
