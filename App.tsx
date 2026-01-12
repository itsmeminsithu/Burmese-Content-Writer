
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, GenerationResult, CalendarResult, PromptPack, ContentFormat, ContentLength, Tone, Intent, Language, Pattern, GeneratedPost, CalendarEntry, KnowledgeEntry } from './types';
import { DEFAULT_STATE, CATEGORIES, ICONS } from './constants';
import { generateContent, generateCalendar, generateStrategyPack, generateSmartReply } from './services/geminiService';

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
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [calendar, setCalendar] = useState<CalendarResult | null>(null);
  const [promptPack, setPromptPack] = useState<PromptPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daysBetween, setDaysBetween] = useState<number>(2);

  const [clientInput, setClientInput] = useState('');
  const [replyResult, setReplyResult] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [showSmartInbox, setShowSmartInbox] = useState(false);

  const [showKM, setShowKM] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newFact, setNewFact] = useState('');
  const [kbSearch, setKbSearch] = useState('');

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
    setPromptPack(null);
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

  const handleReset = () => {
    setState(DEFAULT_STATE);
    setResult(null);
    setCalendar(null);
    setPromptPack(null);
    setClientInput('');
    setReplyResult('');
    setError(null);
    setShowSmartInbox(false);
    setShowKM(false);
    const el = document.createElement('div');
    el.className = "fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300";
    el.innerText = "System Reset Complete";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const handleGenerateCalendar = async () => {
    setCalLoading(true);
    try {
      const data = await generateCalendar(state);
      setCalendar(data);
      setResult(null);
      setPromptPack(null);
      setShowSmartInbox(false);
      setShowKM(false);
    } catch (err) {
      console.error(err);
      setError('Master calendar generation failed.');
    } finally {
      setCalLoading(false);
    }
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
    const el = document.createElement('div');
    el.className = "fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300";
    el.innerText = "✓ Fact Saved";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const removeKnowledge = (id: string) => {
    setState(prev => ({ ...prev, knowledgeBase: prev.knowledgeBase.filter(k => k.id !== id) }));
  };

  const exportToCalendar = (posts: GeneratedPost[]) => {
    if (!posts.length) return;
    const start = new Date(startDate);
    const newEntries: CalendarEntry[] = posts.map((post, idx) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (idx * Math.max(1, daysBetween)));
      return {
        day: currentDate.getDate(),
        date: currentDate.toDateString(),
        topic: state.topic,
        format: state.format,
        hook: post.hook,
        goal: state.intent,
        content: `${post.hook}\n\n${post.body}\n\n${post.cta}`
      };
    });
    setCalendar({ monthName: `${start.toLocaleString('default', { month: 'long' })} Deployment`, entries: newEntries });
    setResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const el = document.createElement('div');
    el.className = "fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300";
    el.innerText = "✓ Copied";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 px-8 py-5 flex justify-between items-center border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl rotate-3 transition-transform cursor-pointer" onClick={handleReset}>
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
          <button onClick={handleReset} className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </button>
          <button onClick={() => { setShowSmartInbox(!showSmartInbox); setResult(null); setCalendar(null); setShowKM(false); }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${showSmartInbox ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <ICONS.Inbox />
            Smart Inbox
          </button>
          <button onClick={handleGenerateCalendar} disabled={calLoading} className={`px-6 py-3 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center gap-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
            Calendar
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1920px] mx-auto w-full overflow-hidden">
        {/* Workspace Sidebar */}
        <aside className="w-full lg:w-[480px] border-r border-slate-200/50 bg-white/40 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col p-10 space-y-12">
          
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[8px]">01</span>
              Service Category
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setState({...state, topic: cat}); setShowSmartInbox(false); setShowKM(false); }}
                  className={`px-5 py-4 rounded-[1.25rem] text-xs font-bold transition-all text-left flex items-center justify-between border ${state.topic === cat ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-500/40 hover:bg-blue-50/10'}`}
                >
                  <span className="tracking-tight">{cat}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-8 pt-10 border-t border-slate-100">
             <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[8px]">02</span>
                  Competitor DNA Input
                </h2>
                {state.competitors.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase">Context Active</span>
                  </div>
                )}
             </div>
             
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity blur-md"></div>
                <div className="relative bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden focus-within:border-blue-500/50 transition-all shadow-sm">
                  <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-900 rounded-lg text-white"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Mapper</span>
                    </div>
                  </div>
                  <textarea 
                    className="w-full px-8 py-8 text-[11px] font-medium min-h-[200px] outline-none placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-transparent"
                    placeholder="PASTE COMPETITOR CONTENT... Whitepapers & Articles use deep structural logic." 
                    value={state.competitors} 
                    onChange={(e) => setState({...state, competitors: e.target.value})} 
                  />
                  <div className="px-8 py-3 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{state.competitors.length} chars analyzed</span>
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Target Content Length</label>
                   <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                      {Object.values(ContentLength).map(len => (
                        <button key={len} onClick={() => setState({...state, contentLength: len})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${state.contentLength === len ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          {len.split(' ')[0]}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tone</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-all" value={state.tone} onChange={(e) => setState({...state, tone: e.target.value as Tone})}>
                        {Object.values(Tone).map(val => <option key={val} value={val}>{val}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Strategic Intent</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-all" value={state.intent} onChange={(e) => setState({...state, intent: e.target.value as Intent})}>
                        {Object.values(Intent).map(val => <option key={val} value={val}>{val}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Output Format</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-all" value={state.format} onChange={(e) => setState({...state, format: e.target.value as ContentFormat})}>
                        {Object.values(ContentFormat).map(val => <option key={val} value={val}>{val}</option>)}
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
             <button onClick={() => { setShowKM(!showKM); setShowSmartInbox(false); setResult(null); setCalendar(null); }} className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-3 border ${showKM ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Memory Bank (KB)
             </button>
          </section>
        </aside>

        {/* Dashboard Display */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-12 lg:p-20">
          <div className="max-w-[1340px] mx-auto space-y-28 pb-40">
            
            {showKM && (
               <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
                  <div className="bg-white rounded-[4rem] border border-slate-200/60 shadow-2xl p-16 space-y-16">
                     <div className="flex justify-between items-start">
                        <div className="space-y-4">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] block">Persistent Brand Data</span>
                           <h3 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">Memory Bank</h3>
                        </div>
                        <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100">Database Size: {state.knowledgeBase.length}</div>
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        <div className="xl:col-span-1 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] text-center mb-4">Teach New Fact</h4>
                           <div className="space-y-6">
                              <input type="text" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:border-emerald-500 transition-colors" placeholder="Subject" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} />
                              <textarea className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold outline-none resize-none h-32 focus:border-emerald-500 transition-colors" placeholder="Fact details" value={newFact} onChange={(e) => setNewFact(e.target.value)} />
                              <button onClick={addKnowledge} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Save to Memory</button>
                           </div>
                        </div>
                        <div className="xl:col-span-2 space-y-8">
                           <input type="text" className="w-full px-12 py-6 bg-white border border-slate-200 rounded-[2.5rem] text-lg font-bold shadow-sm focus:border-blue-500 outline-none transition-all" placeholder="Search brand memory..." value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                              {filteredKnowledge.map(item => (
                                <div key={item.id} className="flex flex-col p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:border-emerald-200 transition-all group relative">
                                   <div className="flex justify-between items-start mb-6"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">{item.keyword}</span><button onClick={() => removeKnowledge(item.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                                   <p className="text-[15px] text-slate-800 font-bold leading-relaxed">{item.fact}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {showSmartInbox && (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
                 <div className="bg-white rounded-[4rem] border border-slate-200/60 shadow-2xl p-16 space-y-16 overflow-hidden relative">
                    <div className="relative space-y-6 text-center lg:text-left">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em] block">Neural Grammar Engine</span>
                       <h3 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Smart Inbox</h3>
                    </div>
                    <div className="relative space-y-10">
                       <textarea className="w-full px-12 py-12 bg-slate-50 border border-slate-200 rounded-[4rem] text-[20px] font-bold text-slate-900 min-h-[240px] outline-none focus:border-blue-500 transition-all resize-none shadow-inner" placeholder="Paste messy inquiries..." value={clientInput} onChange={(e) => setClientInput(e.target.value)} />
                       <button onClick={handleSmartReply} disabled={replyLoading || !clientInput.trim()} className="w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.5em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">{replyLoading ? 'Analyzing...' : 'Draft Reply'}</button>
                    </div>
                    {replyResult && (
                      <div className="mt-20 p-16 bg-gradient-to-br from-emerald-50/50 to-white rounded-[5rem] border border-emerald-100/50 shadow-xl space-y-12 animate-in zoom-in-95 duration-500">
                         <div className="flex justify-between items-center border-b border-emerald-100 pb-10"><span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">Polished Draft</span><button onClick={() => copyToClipboard(replyResult)} className="px-10 py-4 bg-white border border-emerald-200 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm">Copy</button></div>
                         <p className="text-[24px] text-slate-800 leading-[2.1] font-bold whitespace-pre-wrap">{replyResult}</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {result && !calendar && !showSmartInbox && !showKM && (
              <div className="space-y-32 animate-in fade-in duration-1000">
                <div className="space-y-16">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.8em] px-8">Structural DNA Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {result.patterns.map((p, idx) => <PatternCard key={idx} pattern={p} />)}
                  </div>
                </div>

                <div className="space-y-20">
                  <div className="flex justify-between items-end px-8 border-b border-slate-100 pb-16">
                    <div className="space-y-6">
                      <h4 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.8em]">Deployment Ready Drafts</h4>
                      <h2 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">{state.topic}</h2>
                    </div>
                    <button onClick={() => exportToCalendar(result.originalPosts)} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-2xl transition-all">Distribute Plan</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-20">
                    {result.originalPosts.map((post, idx) => (
                      <div key={idx} className="bg-white rounded-[5rem] border border-slate-200 shadow-3xl overflow-hidden flex flex-col xl:flex-row group transition-all hover:border-blue-200">
                        <div className="bg-slate-50/50 p-20 xl:w-[480px] border-r border-slate-100 flex flex-col justify-between">
                          <div className="space-y-12">
                             <div className="flex justify-between items-center">
                                <span className={`bg-white border border-slate-200 text-slate-900 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm`}>Draft 0{idx + 1}</span>
                                <div className={`w-3 h-3 rounded-full ${state.format === ContentFormat.WHITEPAPER || state.format === ContentFormat.ARTICLE ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
                             </div>
                             <h4 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">{post.title || post.hook}</h4>
                             {(state.format === ContentFormat.WHITEPAPER || state.format === ContentFormat.ARTICLE) && (
                               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl inline-block">Strategic Structural Layout Applied</span>
                             )}
                          </div>
                          <div className="pt-24">
                            <button onClick={() => copyToClipboard(`${post.hook}\n\n${post.body}\n\n${post.cta}`)} className="w-full py-8 bg-slate-900 text-white rounded-[3rem] text-[12px] font-black uppercase tracking-[0.5em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6">Copy Complete Draft</button>
                          </div>
                        </div>
                        <div className="p-20 lg:p-24 flex-1 flex flex-col bg-white">
                          <div className={`text-[21px] text-slate-800 leading-[2.2] whitespace-pre-wrap font-medium flex-1 mb-16 px-4`}>
                            {post.body}
                          </div>
                          <div className="mt-auto pt-16 border-t border-slate-50 flex flex-col lg:flex-row justify-between items-end gap-12">
                             <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Strategic CTA</span>
                                <p className="text-blue-600 font-black text-5xl tracking-tighter">{post.cta}</p>
                             </div>
                             <span className="text-8xl filter drop-shadow-2xl">{post.emojis}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[6rem] p-24 lg:p-32 text-white shadow-3xl relative overflow-hidden">
                   <div className="relative z-10 space-y-24">
                      <h3 className="text-7xl font-black tracking-tighter leading-none">Perspective matrix</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                         {result.toneVariants.map((v, i) => (
                           <div key={i} className="bg-white/[0.04] backdrop-blur-2xl p-16 rounded-[5rem] border border-white/5 hover:bg-white/[0.08] transition-all duration-500 group/tone h-full flex flex-col">
                              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em] mb-12 block">{v.tone}</span>
                              <p className="text-[20px] text-slate-200 leading-[1.8] font-bold italic flex-1 group-hover/tone:text-white transition-colors">"{v.content}"</p>
                              <button onClick={() => copyToClipboard(v.content)} className="mt-14 text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-0 group-hover/tone:opacity-100 transition-all">Copy script</button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {calendar && (
              <div className="animate-in fade-in duration-1000 space-y-16">
                 <div className="flex justify-between items-end px-12 border-b border-slate-200 pb-16">
                    <h2 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{calendar.monthName}</h2>
                    <button onClick={() => setCalendar(null)} className="px-10 py-5 bg-slate-900 text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl">Back</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                    {calendar.entries.map((entry, idx) => (
                      <div key={idx} className="bg-white rounded-[4rem] p-16 shadow-2xl space-y-10 border border-slate-100 hover:border-blue-500 transition-all">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{entry.date || `Day ${entry.day}`}</span>
                         <h4 className="text-3xl font-black text-slate-900 leading-tight">{entry.topic}</h4>
                         <p className="text-[16px] text-slate-600 font-bold italic line-clamp-4">"{entry.hook}"</p>
                         <button onClick={() => copyToClipboard(entry.content || '')} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Copy script</button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {!result && !loading && !calendar && !showSmartInbox && !showKM && (
              <div className="h-full min-h-[900px] flex flex-col items-center justify-center text-center p-32 bg-white/40 rounded-[6rem] border-4 border-slate-100 border-dashed">
                 <div className="bg-slate-900 p-28 rounded-[7rem] text-white shadow-3xl mb-24 transform hover:rotate-3 transition-transform duration-1000"><ICONS.Brand /></div>
                 <h2 className="text-[120px] font-black text-slate-900 tracking-tighter leading-[0.75]">Authority<br/>Generator</h2>
                 <p className="text-slate-400 text-5xl max-w-4xl mx-auto font-medium leading-[1.3] mt-12">Synthesize long-form guides and elite professional drafts instantly.</p>
              </div>
            )}

            {loading && (
               <div className="h-full min-h-[900px] flex flex-col items-center justify-center space-y-28 animate-in fade-in duration-1000">
                  <div className="w-96 h-96 border-[32px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-7xl font-black text-slate-900 tracking-tighter uppercase">Structuring Logical DNA</p>
               </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
