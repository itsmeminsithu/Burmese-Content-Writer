
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, GenerationResult, CalendarResult, ContentFormat, ContentLength, Tone, Intent, Language, Pattern, GeneratedPost, CalendarEntry, KnowledgeEntry } from './types';
import { DEFAULT_STATE, CATEGORIES, ICONS, EMOJI_SETS } from './constants';
import { generateContent, generateCalendar, generateSmartReply } from './services/geminiService';

const PatternCard: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-200 group">
      <div className="p-8 flex-1">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.566 0l-.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l2.146 2.146a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l2.146-2.146z" /></svg>
          </div>
          <div>
            <h5 className="text-[13px] font-black text-slate-900 leading-none">{pattern.name}</h5>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Structural DNA</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-2">{pattern.description}</p>
      </div>
      
      <div className="px-8 pb-6">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex justify-between items-center transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
        >
          <span>{isExpanded ? 'Hide DNA Analysis' : 'Expand Logic'}</span>
          <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="mt-4 p-6 bg-blue-50/20 border border-blue-100 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[11px] text-slate-700 leading-[1.8] font-bold italic border-l-4 border-blue-500/30 pl-5 py-2">
              "{pattern.example}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('authority_engine_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [calendar, setCalendar] = useState<CalendarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [clientInput, setClientInput] = useState('');
  const [replyResult, setReplyResult] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [showSmartInbox, setShowSmartInbox] = useState(false);

  const [showKM, setShowKM] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newFact, setNewFact] = useState('');
  const [kbSearch, setKbSearch] = useState('');

  const [showDrafts, setShowDrafts] = useState(false);

  // Trainer States
  const [showTrainer, setShowTrainer] = useState(false);
  const [trainingCategory, setTrainingCategory] = useState(CATEGORIES[0]);
  const [trainingInput, setTrainingInput] = useState('');

  useEffect(() => {
    localStorage.setItem('authority_engine_state', JSON.stringify({
      knowledgeBase: state.knowledgeBase,
      categoryTraining: state.categoryTraining,
      savedDrafts: state.savedDrafts,
      copyCount: state.copyCount,
      selectedEmojiSet: state.selectedEmojiSet
    }));
  }, [state]);

  const filteredKnowledge = useMemo(() => {
    if (!kbSearch.trim()) return state.knowledgeBase;
    const term = kbSearch.toLowerCase();
    return state.knowledgeBase.filter(k => 
      k.keyword.toLowerCase().includes(term) || k.fact.toLowerCase().includes(term)
    );
  }, [state.knowledgeBase, kbSearch]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCalendar(null);
    setShowTrainer(false);
    setShowSmartInbox(false);
    setShowKM(false);
    setShowDrafts(false);

    try {
      const data = await generateContent(state);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Strategic synthesis failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshApp = () => {
    setResult(null);
    setCalendar(null);
    setClientInput('');
    setReplyResult('');
    setTrainingInput('');
    setError(null);
    setShowSmartInbox(false);
    setShowKM(false);
    setShowTrainer(false);
    setShowDrafts(false);
    
    setState(prev => ({
      ...prev,
      topic: CATEGORIES[0],
      competitors: '',
      format: ContentFormat.FACEBOOK,
      contentLength: ContentLength.MEDIUM,
      tone: Tone.CALM,
      intent: Intent.TRUST,
    }));

    const el = document.createElement('div');
    el.className = "fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300";
    el.innerText = "UI Refreshed • Neural Memory Preserved";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const handleSmartReply = async () => {
    if (!clientInput.trim()) return;
    setReplyLoading(true);
    try {
      const reply = await generateSmartReply(clientInput, state.knowledgeBase, state.brand);
      setReplyResult(reply);
    } catch (err) {
      console.error(err);
      setReplyResult("တောင်းပန်ပါသည်။ ပြန်လည်ဖြေကြားရန် အဆင်မပြေဖြစ်နေပါသည်။");
    } finally {
      setReplyLoading(false);
    }
  };

  const addKnowledge = () => {
    if (!newKeyword.trim() || !newFact.trim()) return;
    const entry: KnowledgeEntry = { id: Date.now().toString(), keyword: newKeyword, fact: newFact };
    setState(prev => ({ ...prev, knowledgeBase: [...prev.knowledgeBase, entry] }));
    setNewKeyword('');
    setNewFact('');
  };

  const removeKnowledge = (id: string) => {
    setState(prev => ({ ...prev, knowledgeBase: prev.knowledgeBase.filter(k => k.id !== id) }));
  };

  const addTrainingExample = () => {
    if (!trainingInput.trim()) return;
    setState(prev => ({
      ...prev,
      categoryTraining: {
        ...prev.categoryTraining,
        [trainingCategory]: [...(prev.categoryTraining[trainingCategory] || []), trainingInput]
      }
    }));
    setTrainingInput('');
    const el = document.createElement('div');
    el.className = "fixed top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300";
    el.innerText = "DNA Pattern Synced for " + trainingCategory;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const removeTrainingExample = (category: string, index: number) => {
    setState(prev => ({
      ...prev,
      categoryTraining: {
        ...prev.categoryTraining,
        [category]: prev.categoryTraining[category].filter((_, i) => i !== index)
      }
    }));
  };

  const saveDraft = (post: GeneratedPost) => {
    setState(prev => {
      const exists = prev.savedDrafts.find(d => d.id === post.id);
      if (exists) return prev;
      return { ...prev, savedDrafts: [post, ...prev.savedDrafts] };
    });
    const el = document.createElement('div');
    el.className = "fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300";
    el.innerText = "✓ Draft Saved to Matrix";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const deleteDraft = (id: string) => {
    setState(prev => ({ ...prev, savedDrafts: prev.savedDrafts.filter(d => d.id !== id) }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setState(prev => ({
      ...prev,
      copyCount: prev.copyCount + 1,
      copyHistory: Array.from(new Set([...prev.copyHistory, text])).slice(-10)
    }));
    const el = document.createElement('div');
    el.className = "fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300";
    el.innerText = "✓ Asset Copied • Feedback Logged";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const shareAsset = (post: GeneratedPost) => {
    const text = `${post.title ? post.title + '\n\n' : ''}${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags}`;
    copyToClipboard(text);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 px-8 py-5 flex justify-between items-center border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl rotate-3 transition-transform cursor-pointer hover:scale-105" onClick={handleRefreshApp}>
            <ICONS.Brand />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Authority Engine</h1>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-200">Elite</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-0.5">Premium Myanmar Editorial Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowDrafts(!showDrafts); setShowTrainer(false); setShowSmartInbox(false); setShowKM(false); setResult(null); }} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showDrafts ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            Matrix Drafts ({state.savedDrafts.length})
          </button>
          <button onClick={() => { setShowTrainer(!showTrainer); setResult(null); setCalendar(null); setShowKM(false); setShowSmartInbox(false); setShowDrafts(false); }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${showTrainer ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <ICONS.Lab />
            Neural Trainer
          </button>
          <button onClick={() => { setShowSmartInbox(!showSmartInbox); setResult(null); setCalendar(null); setShowKM(false); setShowTrainer(false); setShowDrafts(false); }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${showSmartInbox ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <ICONS.Inbox />
            Smart Inbox
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1920px] mx-auto w-full overflow-hidden">
        {/* Workspace Sidebar */}
        <aside className="w-full lg:w-[480px] border-r border-slate-200/50 bg-white/40 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col p-10 space-y-12">
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400">Knowledge Synthesis</span>
                <h4 className="text-[13px] font-black uppercase tracking-widest">Global Style Memory</h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white">{state.copyCount}</span>
                <p className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">Usage Points</p>
              </div>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-5 h-5 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[8px]">01</span>
                Service Category
              </h2>
              <button onClick={handleRefreshApp} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Reset Workspace UI">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setState({...state, topic: cat}); setShowSmartInbox(false); setShowKM(false); setShowTrainer(false); setShowDrafts(false); setResult(null); }}
                  className={`px-5 py-4 rounded-[1.25rem] text-xs font-bold transition-all text-left flex items-center justify-between border ${state.topic === cat ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.02]' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-500/40 hover:bg-blue-50/10'}`}
                >
                  <span className="tracking-tight">{cat}</span>
                  {state.categoryTraining[cat]?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-blue-400">Trained</span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-8 pt-10 border-t border-slate-100">
             <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[8px]">02</span>
                  Strategic DNA Configuration
                </h2>
             </div>

             <div className="space-y-6">
                <div className="space-y-3 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest block">Output Depth (Length Style)</label>
                   <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1.5 border border-slate-200/50 shadow-inner">
                      {Object.values(ContentLength).map(len => (
                        <button 
                          key={len} 
                          onClick={() => setState({...state, contentLength: len})} 
                          className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${state.contentLength === len ? 'bg-white text-blue-600 shadow-lg scale-[1.05] border border-blue-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        >
                          {len.split(' ')[0]}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="relative group">
                   <div className="relative bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden focus-within:border-blue-500/50 transition-all shadow-sm">
                     <textarea 
                       className="w-full px-8 py-8 text-[11px] font-medium min-h-[160px] outline-none placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-transparent"
                       placeholder="PASTE COMPETITOR CONTENT... The system will analyze their patterns." 
                       value={state.competitors} 
                       onChange={(e) => setState({...state, competitors: e.target.value})} 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tone Profile</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm hover:border-blue-400 transition-colors" value={state.tone} onChange={(e) => setState({...state, tone: e.target.value as Tone})}>
                        {Object.values(Tone).map(val => <option key={val} value={val}>{val}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Business Intent</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm hover:border-blue-400 transition-colors" value={state.intent} onChange={(e) => setState({...state, intent: e.target.value as Intent})}>
                        {Object.values(Intent).map(val => <option key={val} value={val}>{val}</option>)}
                      </select>
                    </div>
                </div>
             </div>

             <button onClick={handleGenerate} disabled={loading} className="w-full group relative overflow-hidden bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><ICONS.Pen /> Map & Deploy</>}
                </span>
             </button>
          </section>

          <section className="pt-10 border-t border-slate-100">
             <button onClick={handleRefreshApp} className="w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reset App Workspace
             </button>
          </section>
        </aside>

        {/* Dashboard Display */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-12 lg:p-20">
          <div className="max-w-[1340px] mx-auto space-y-28 pb-40">
            
            {showDrafts && (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
                 <div className="flex justify-between items-end border-b border-slate-200 pb-12">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em] block">Storage Archives</span>
                      <h3 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">Matrix Drafts</h3>
                    </div>
                 </div>
                 {state.savedDrafts.length === 0 ? (
                   <div className="p-32 border-4 border-dashed border-slate-200 rounded-[5rem] text-center bg-white/50">
                      <p className="text-2xl font-bold text-slate-400">No assets currently stored in the matrix.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-12">
                      {state.savedDrafts.map(post => (
                        <div key={post.id} className="bg-white rounded-[4rem] border border-slate-200 shadow-xl p-16 group hover:border-blue-300 transition-all">
                           <div className="flex justify-between items-start mb-12">
                             <div className="space-y-4">
                                <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tight">{post.title || post.hook.slice(0, 40) + '...'}</h4>
                             </div>
                             <div className="flex gap-4">
                               <button onClick={() => shareAsset(post)} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                               </button>
                               <button onClick={() => deleteDraft(post.id)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                             </div>
                           </div>
                           <p className="text-xl text-slate-800 leading-relaxed font-medium mb-12 whitespace-pre-wrap">{post.body}</p>
                           <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{post.hashtags}</span>
                              <span className="text-5xl">{post.emojis}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            )}

            {showTrainer && (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
                <div className="bg-slate-900 rounded-[4rem] border border-slate-800 shadow-3xl p-16 space-y-16 text-white overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 animate-pulse"></div>
                  <div className="relative flex justify-between items-start">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] block">Training Laboratory</span>
                      <h3 className="text-6xl font-black tracking-tighter leading-none">Neural Trainer</h3>
                      <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">Feed high-performing assets to help the AI mirror your brand's specific linguistic signature.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    <div className="xl:col-span-5 space-y-8 bg-slate-800/30 p-12 rounded-[3.5rem] border border-slate-800">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-2">Training Focus</label>
                         <select className="w-full px-6 py-5 bg-slate-800 border border-slate-700 rounded-[2rem] text-sm font-bold outline-none focus:border-indigo-500 transition-colors shadow-2xl" value={trainingCategory} onChange={(e) => setTrainingCategory(e.target.value)}>
                           {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                       </div>
                       
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-2">DNA Sample (The Voice)</label>
                         <textarea 
                           className="w-full px-8 py-8 bg-slate-800 border border-slate-700 rounded-[2.5rem] text-[15px] font-bold text-white min-h-[340px] outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-600 leading-relaxed" 
                           placeholder={`PASTE SUCCESSFUL ${trainingCategory.toUpperCase()} CONTENT TO MEMORIZE...`} 
                           value={trainingInput} 
                           onChange={(e) => setTrainingInput(e.target.value)} 
                         />
                       </div>

                       <button onClick={addTrainingExample} className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 group">
                         <span className="flex items-center justify-center gap-4">
                           <ICONS.Lab />
                           Sync Style Pattern
                         </span>
                       </button>
                    </div>

                    <div className="xl:col-span-7 space-y-8">
                      <div className="flex justify-between items-center px-4">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Memory for {trainingCategory}</h4>
                        <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">{state.categoryTraining[trainingCategory]?.length || 0} Patterns</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 max-h-[760px] overflow-y-auto pr-6 custom-scrollbar">
                        {state.categoryTraining[trainingCategory]?.length > 0 ? (
                          state.categoryTraining[trainingCategory].map((sample, idx) => (
                            <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-[3rem] p-10 group relative hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-500">
                               <button onClick={() => removeTrainingExample(trainingCategory, idx)} className="absolute top-8 right-8 p-3 bg-slate-900/50 rounded-xl text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                               <p className="text-[16px] text-slate-300 font-bold leading-relaxed whitespace-pre-wrap italic opacity-80 group-hover:opacity-100 transition-opacity">"{sample}"</p>
                            </div>
                          ))
                        ) : (
                          <div className="h-full min-h-[400px] border-2 border-slate-800 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center p-24 bg-slate-900/20">
                            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-8"><ICONS.Lab /></div>
                            <h5 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Patterns Stored</h5>
                            <p className="text-slate-600 font-medium text-sm mt-4 max-w-sm leading-relaxed">Upload stylistic samples to teach the AI how to mirror your category-specific voice.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showSmartInbox && (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
                 <div className="bg-white rounded-[4rem] border border-slate-200/60 shadow-2xl p-16 space-y-16 overflow-hidden relative">
                    <div className="relative space-y-6">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em] block">Neural Grammar Optimizer</span>
                       <h3 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Smart Inbox</h3>
                       <p className="text-slate-400 text-2xl font-medium max-w-3xl">Turn inquiry fragments into high-authority Myanmar professional replies instantly.</p>
                    </div>
                    <textarea className="w-full px-12 py-12 bg-slate-50 border border-slate-200 rounded-[4rem] text-[24px] font-bold text-slate-900 min-h-[300px] outline-none shadow-inner" placeholder="Paste inquiries from clients..." value={clientInput} onChange={(e) => setClientInput(e.target.value)} />
                    <button onClick={handleSmartReply} disabled={replyLoading || !clientInput.trim()} className="w-full py-10 bg-blue-600 text-white rounded-[3.5rem] font-black text-[16px] uppercase tracking-[0.6em] shadow-2xl disabled:opacity-50">{replyLoading ? 'Analyzing Intent...' : 'Draft Authority Reply'}</button>
                    {replyResult && (
                      <div className="mt-20 p-20 bg-gradient-to-br from-emerald-50/50 to-white rounded-[6rem] border border-emerald-100/50 shadow-xl space-y-12 animate-in zoom-in-95 duration-500">
                         <div className="flex justify-between items-center border-b border-emerald-100 pb-12"><span className="text-[13px] font-black text-emerald-600 uppercase tracking-[0.6em]">Polished Draft</span><button onClick={() => copyToClipboard(replyResult)} className="px-12 py-5 bg-white border border-emerald-200 rounded-[2rem] text-[12px] font-black text-emerald-600 uppercase">Copy</button></div>
                         <p className="text-[28px] text-slate-800 leading-[2.2] font-bold whitespace-pre-wrap">{replyResult}</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {result && !calendar && !showSmartInbox && !showKM && !showTrainer && !showDrafts && (
              <div className="space-y-32 animate-in fade-in duration-1000">
                <div className="space-y-16">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.8em] px-8">Extracted Structural Logic</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {result.patterns.map((p, idx) => <PatternCard key={idx} pattern={p} />)}
                  </div>
                </div>

                <div className="space-y-20">
                  <div className="flex justify-between items-end px-8 border-b border-slate-100 pb-16">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.8em]">Deployment Ready Drafts</h4>
                        {state.categoryTraining[state.topic]?.length > 0 && (
                          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-indigo-600 uppercase">Style Synced</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{state.topic}</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-24">
                    {result.originalPosts.map((post, idx) => (
                      <div key={idx} className="bg-white rounded-[6rem] border border-slate-200 shadow-3xl overflow-hidden flex flex-col xl:flex-row group transition-all hover:border-blue-300/50">
                        <div className="bg-slate-50/50 p-24 xl:w-[520px] border-r border-slate-100 flex flex-col justify-between">
                          <div className="space-y-16">
                             <div className="flex justify-between items-center">
                                <span className={`bg-white border border-slate-200 text-slate-900 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm`}>Draft 0{idx + 1}</span>
                                <div className="flex gap-3">
                                  <button onClick={() => saveDraft(post)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all" title="Save to Matrix">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                  </button>
                                  <button onClick={() => shareAsset(post)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all" title="Copy Full Post">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                  </button>
                                </div>
                             </div>
                             <h4 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">{post.title || post.hook.slice(0, 30) + '...'}</h4>
                             <div className="space-y-2">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected Output</p>
                               <span className="text-[11px] font-black text-slate-900 uppercase">{state.format} • {state.tone}</span>
                             </div>
                          </div>
                          <div className="pt-32">
                            <button onClick={() => copyToClipboard(`${post.hook}\n\n${post.body}\n\n${post.cta}`)} className="w-full py-9 bg-slate-900 text-white rounded-[3.5rem] text-[13px] font-black uppercase tracking-[0.6em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-8 group-hover:scale-[1.02]">
                              Copy Main Content
                            </button>
                          </div>
                        </div>
                        <div className="p-24 lg:p-32 flex-1 flex flex-col bg-white">
                          <div className="text-[23px] text-slate-800 leading-[2.3] whitespace-pre-wrap font-medium flex-1 mb-20 px-8 border-l-8 border-slate-50 transition-all hover:border-blue-100">
                            <p className="font-black text-blue-600 mb-8 italic">{post.hook}</p>
                            {post.body}
                          </div>
                          <div className="mt-auto pt-20 border-t border-slate-50 flex flex-col lg:flex-row justify-between items-end gap-12">
                             <div className="space-y-6">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em]">Call to Action</span>
                                <p className="text-blue-600 font-black text-6xl tracking-tighter mb-4">{post.cta}</p>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated Hashtags</p>
                                   <p className="text-sm font-bold text-slate-500">{post.hashtags}</p>
                                </div>
                             </div>
                             <span className="text-5xl">{post.emojis}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!result && !loading && !calendar && !showSmartInbox && !showKM && !showTrainer && !showDrafts && (
              <div className="h-full min-h-[900px] flex flex-col items-center justify-center text-center p-32 bg-white/40 rounded-[6rem] border-4 border-slate-100 border-dashed transition-all hover:border-blue-200">
                 <div className="bg-slate-900 p-28 rounded-[7.5rem] text-white shadow-3xl mb-24 transform hover:rotate-6 transition-transform duration-1000"><ICONS.Brand /></div>
                 <h2 className="text-[140px] font-black text-slate-900 tracking-tighter leading-[0.7] mb-12 uppercase">Authority<br/>Generator</h2>
                 <p className="text-slate-400 text-6xl max-w-5xl mx-auto font-medium leading-[1.3] tracking-tight">Generate elite professional guides and strategic Myanmar content with deep stylistic memory.</p>
              </div>
            )}

            {loading && (
               <div className="h-full min-h-[900px] flex flex-col items-center justify-center space-y-28 animate-in fade-in duration-1000">
                  <div className="relative">
                    <div className="w-96 h-96 border-[32px] border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 w-96 h-96 border-[32px] border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-6">
                    <p className="text-8xl font-black text-slate-900 tracking-tighter uppercase">Analyzing DNA Patterns</p>
                    <p className="text-2xl text-slate-400 font-bold tracking-widest uppercase">Cross-referencing training memory & expert patterns...</p>
                  </div>
               </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
