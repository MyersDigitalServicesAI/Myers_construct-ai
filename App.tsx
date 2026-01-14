
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, TrendingUp, ShieldCheck, Database, Save, Zap, Activity, Trash2, Globe, BarChart3, 
  Sparkles, Building, ArrowLeft, ExternalLink, Image as ImageIcon, X, Camera,
  LogOut, Video, CreditCard, UserPlus, Info, CheckCircle, Handshake, ChevronRight, Layers, Briefcase, Lock, Star, Rocket, Shield
} from 'lucide-react';
import { 
  ProjectData, ProjectType, EstimateResult, UserPlan, 
  ProjectScale, ProjectTimeline, SessionData
} from './types';
import { generateFullEstimate } from './geminiService';import { initiateRetainerPayment, initiateSubscription } from './services/paymentService';
import { initiateRetainerPayment, initiateSubscription } from './paymentService';
import { dbService } from './dbService';
const TRADES = ['GC', 'Electrical', 'HVAC', 'Plumbing', 'Earthworks', 'Finishes'] as const;

const MarketTicker = () => (
  <div className="bg-orange-600 py-1.5 overflow-hidden whitespace-nowrap z-40 sticky top-20 shadow-lg">
    <div className="flex animate-marquee gap-10 items-center">
      {["SaaS ENGINE: v1.0.4-PROD", "STRIPE WEBHOOKS: READY", "DB LAYER: PERSISTENT", "CSI LOGIC: SYNCED", "GEMINI-3-PRO: ACTIVE", "MARKET GROUNDING: LIVE"].map((t, i) => (
        <span key={i} className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-2 italic">
          <Activity size={10} /> {t}
        </span>
      ))}
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { display: flex; width: 200%; animation: marquee 20s linear infinite; }`}</style>
  </div>
);

const Paywall = ({ onSubscribe, company }: { onSubscribe: (plan: UserPlan) => void, company: string }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    { id: 'essential', name: UserPlan.ESSENTIAL, price: 49, desc: 'Entry-level provisioning', icon: Rocket, features: ['10 Takeoffs / Mo', 'Basic Market Data', 'Email Support'] },
    { id: 'growth', name: UserPlan.GROWTH, price: 199, desc: 'Standard business operations', icon: Star, featured: true, features: ['Unlimited Takeoffs', 'Visual AI Takeoff', 'Stripe Billing Logic', 'Priority Reasoning'] },
    { id: 'scale', name: UserPlan.SCALE, price: 599, desc: 'Enterprise fleet access', icon: Shield, features: ['White-label Proposals', 'Custom CSI Rules', 'Team Sync', 'API Access'] },
  ];

  const handleSubscribe = async (plan: any) => {
    setLoading(plan.id);
    try {
      const res: any = await initiateSubscription(plan.name, plan.price);
      if (res.success) onSubscribe(plan.name as UserPlan);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 py-20 animate-in fade-in duration-1000">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.6em] mb-4 italic">Subscription Terminal</h2>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">Authorize <span className="text-orange-600">Provisioning.</span></h1>
        <p className="text-white/30 text-sm mt-6 font-medium uppercase tracking-widest leading-relaxed">Secure terminal access for <span className="text-white font-black">{company}</span>. Your subscription node powers the Myers industrial engine.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((p) => (
          <div key={p.id} className={`bg-[#0d0d0d] border ${p.featured ? 'border-orange-600' : 'border-white/5'} rounded-[3.5rem] p-12 flex flex-col shadow-2xl relative overflow-hidden group hover:border-orange-600/40 transition-all`}>
            {p.featured && <div className="absolute top-8 right-8 bg-orange-600 text-black px-4 py-1 rounded-full text-[8px] font-black uppercase italic tracking-widest">Industry Choice</div>}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 ${p.featured ? 'bg-orange-600 text-black shadow-[0_0_30px_rgba(234,88,12,0.3)]' : 'bg-white/5 text-white/30'}`}>
              <p.icon size={32} />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">{p.name}</h3>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-10 italic">{p.desc}</p>
            <div className="flex items-baseline gap-2 mb-12">
              <span className="text-5xl font-black italic tracking-tighter text-white">${p.price}</span>
              <span className="text-white/20 text-xs font-black uppercase italic tracking-widest">/ month</span>
            </div>
            <ul className="space-y-6 mb-16 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-widest italic">
                  <CheckCircle size={14} className="text-orange-600" /> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribe(p)}
              disabled={!!loading}
              className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic transition-all flex items-center justify-center gap-4 ${p.featured ? 'bg-orange-600 text-black hover:bg-orange-700 shadow-2xl hover:scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              {loading === p.id ? <Activity className="animate-spin" /> : 'Activate Terminal'}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-16 text-[9px] font-black text-white/10 uppercase tracking-[0.5em] italic flex items-center gap-4"><Lock size={12}/> Myers Secure SaaS Infrastructure</p>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (s: SessionData) => void }) => {
  const [formData, setFormData] = useState({ company: '', trade: TRADES[0] });
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 antialiased">
      <div className="max-w-xl w-full bg-[#0d0d0d] rounded-[3rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px]" />
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-black italic">Σ</div>
          <span className="font-black text-xl uppercase tracking-tighter italic text-white">Myers Estimate Generator</span>
        </div>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none relative z-10">Strategic <span className="text-orange-600">Onboarding.</span></h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          const s: SessionData = { 
            signature: `NODE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, 
            plan: UserPlan.ESSENTIAL, 
            company: formData.company, 
            trade: formData.trade,
            subscriptionActive: false 
          };
          setTimeout(() => { onComplete(s); }, 800);
        }} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Business Legal Entity</label>
            <input required placeholder="E.G. MYERS CONSTRUCTION LTD" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-bold text-sm text-white uppercase focus:border-orange-600 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Primary Trade Node</label>
            <select value={formData.trade} onChange={e => setFormData({...formData, trade: e.target.value as any})} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-bold text-sm text-white uppercase outline-none focus:border-orange-600 transition-all">
              {TRADES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
            </select>
          </div>
          <button className="w-full py-6 bg-orange-600 text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-orange-700 transition-all text-sm italic shadow-2xl">
            {loading ? 'Validating Node...' : 'Access SaaS Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [view, setView] = useState<'dash' | 'intake' | 'result' | 'proc'>('dash');
  const [billing, setBilling] = useState<'off' | 'on'>('off');
  const [history, setHistory] = useState<any[]>([]);
  const [activeEst, setActiveEst] = useState<EstimateResult | null>(null);
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [markup, setMarkup] = useState(35);
  const [overhead, setOverhead] = useState(15);
  const [paying, setPaying] = useState(false);

  const [project, setProject] = useState<ProjectData>({
    scope: '', location: '', size: 'medium', description: '',
    projectType: ProjectType.RESIDENTIAL, projectScale: ProjectScale.MEDIUM,
    timeline: ProjectTimeline.STANDARD, estimateFee: 150, isAccepted: false
  });

  useEffect(() => {
    const s = dbService.getSession();
    if (s) setSession(s);
    setHistory(dbService.getHistory());
    
    const checkKey = async () => { 
      if (await (window as any).aistudio.hasSelectedApiKey()) setBilling('on'); 
    };
    checkKey();
  }, []);

  const financial = useMemo(() => {
    if (!activeEst) return { base: 0, final: 0, due: 0, profit: 0 };
    const base = activeEst.items.reduce((a, c) => a + c.total, 0);
    const final = base / (1 - (markup + overhead) / 100);
    return { base, final };
  }, [activeEst, markup, overhead]);

  const handleSubscriptionComplete = (plan: UserPlan) => {
    if (!session) return;
    const newSession = { ...session, plan, subscriptionActive: true };
    setSession(newSession);
    dbService.saveSession(newSession);
  };

  const runEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billing === 'off') { 
      await (window as any).aistudio.openSelectKey(); 
      setBilling('on'); 
      return; 
    }
    setView('proc');
    try {
      const res = await generateFullEstimate(project, blueprint || undefined);
      setActiveEst(res);
      setView('result');
    } catch (err) { 
      console.error(err);
      setView('intake'); 
      alert("Nexus Node Error: Grounding systems unavailable."); 
    }
  };

  const handleCommit = async () => {
    setPaying(true);
    const h = { 
      ...activeEst, 
      id: Date.now(), 
      client_name: project.scope, 
      total_cost: financial.final, 
      county: project.location, 
      created_at: new Date().toISOString() 
    };
    const updatedHistory = dbService.saveEstimate(h);
    setHistory(updatedHistory);
    setPaying(false);
    setView('dash');
  };

  if (!session) return <Onboarding onComplete={setSession} />;
  if (!session.subscriptionActive) return <Paywall onSubscribe={handleSubscriptionComplete} company={session.company} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-600/30 font-inter antialiased overflow-x-hidden">
      <nav className="h-20 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <div onClick={() => setView('dash')} className="flex items-center gap-4 cursor-pointer group">
            <div className="p-2 bg-orange-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
              <Building size={24} className="text-black" />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Myers <span className="text-orange-600">Estimate Generator</span></h1>
          </div>
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest italic">{session.plan}</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Node Secured</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{session.company}</p>
            <p className="text-[8px] font-bold text-orange-600 uppercase italic">{session.signature}</p>
          </div>
          <button onClick={() => { dbService.clearSession(); window.location.reload(); }} className="text-white/20 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white/5">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <MarketTicker />

      <main className="max-w-7xl mx-auto p-10">
        {view === 'dash' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-[#0d0d0d] p-16 rounded-[4rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/5 blur-[100px]" />
              <div className="relative z-10">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">Command Node</h2>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em] mt-4 italic">Operational SaaS Engine Active</p>
              </div>
              <button onClick={() => setView('intake')} className="bg-orange-600 hover:bg-orange-700 text-black px-12 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-6 italic shadow-2xl transition-all hover:scale-105 active:scale-95">
                <Plus size={18} /> New Provisioning Request
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { l: 'Lifetime Billed', v: `$${history.reduce((a,c)=>a+(c.total_cost || 0),0).toLocaleString()}`, i: TrendingUp },
                { l: 'Provisioning Scale', v: session.plan.split(' ')[0], i: ShieldCheck },
                { l: 'Node Status', v: 'ACTIVE', i: Activity }
              ].map((s, idx) => (
                <div key={idx} className="bg-[#0d0d0d] border border-white/5 p-12 rounded-[3rem] shadow-xl hover:border-orange-600/20 transition-all group overflow-hidden relative">
                  <div className="absolute -bottom-4 -right-4 text-white/[0.02] scale-[4] group-hover:text-orange-600/[0.03] transition-colors"><s.i size={40} /></div>
                  <s.i size={24} className="text-orange-600 mb-6 relative z-10" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 relative z-10">{s.l}</p>
                  <p className="text-4xl font-black italic tracking-tighter text-white relative z-10 uppercase">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
              <div className="px-12 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic flex items-center gap-4"><Database size={16}/> Industrial Ledger</h3>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest italic">{history.length} SAVED PROPOSALS</span>
              </div>
              {history.length ? (
                <div className="divide-y divide-white/5">
                  {history.map((h, i) => (
                    <div key={i} className="px-12 py-10 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center font-black italic text-2xl text-orange-600 border border-white/5 group-hover:bg-orange-600 group-hover:text-black transition-all">Σ</div>
                        <div>
                          <p className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-orange-600 transition-colors">{h.client_name}</p>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-2 italic">{h.county} • {new Date(h.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black italic tracking-tighter text-white">${(h.total_cost || 0).toLocaleString()}</p>
                        <button onClick={() => setHistory(dbService.deleteEstimate(h.id))} className="text-white/10 hover:text-red-500 mt-2 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="p-40 text-center text-white/10 uppercase font-black text-xs tracking-widest italic">Database Ledger Clear</div>}
            </div>
          </div>
        )}

        {view === 'intake' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500 pb-20">
            <div className="bg-[#0d0d0d] p-16 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <header className="flex justify-between items-center mb-16 relative z-10">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Intake Node</h2>
                <button onClick={() => setView('dash')} className="p-4 bg-white/5 rounded-2xl hover:bg-orange-600 transition-all group shadow-xl"><ArrowLeft size={24} className="group-hover:text-black"/></button>
              </header>
              <form onSubmit={runEstimate} className="space-y-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic">Project Locale (Zip/City)</label>
                    <input required value={project.location} onChange={e => setProject({...project, location: e.target.value})} placeholder="E.G. CHICAGO, IL 60601" className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] font-black text-xs text-white uppercase outline-none focus:border-orange-600 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic">Internal Reference</label>
                    <input required value={project.scope} onChange={e => setProject({...project, scope: e.target.value})} placeholder="E.G. HARBOR RENO v2" className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] font-black text-xs text-white uppercase outline-none focus:border-orange-600 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-3"><ImageIcon size={14}/> Blueprint Takeoff (Optional)</label>
                  {blueprint ? (
                    <div className="relative group aspect-video rounded-[3rem] overflow-hidden border-2 border-orange-600 shadow-2xl">
                      <img src={blueprint} className="w-full h-full object-cover" alt="Blueprint" />
                      <button type="button" onClick={()=>setBlueprint(null)} className="absolute top-6 right-6 p-4 bg-black/80 rounded-full hover:bg-red-500 transition-all shadow-2xl"><X size={20}/></button>
                    </div>
                  ) : (
                    <label className="w-full aspect-video border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-orange-600 hover:bg-orange-600/5 transition-all shadow-inner group">
                      <div className="p-8 bg-white/5 rounded-full group-hover:scale-110 transition-transform shadow-lg"><Camera size={40} className="text-white/20"/></div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/10 italic">Upload Plan for Computer Vision Takeoff</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) { const r = new FileReader(); r.onloadend=()=>setBlueprint(r.result as string); r.readAsDataURL(f); }
                      }} />
                    </label>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic">Detailed Scope Narrative</label>
                  <textarea required value={project.description} onChange={e => setProject({...project, description: e.target.value})} placeholder="Specify materials, conditions, and CSI requirements..." className="w-full px-10 py-10 bg-white/5 border border-white/5 rounded-[3rem] outline-none min-h-[250px] text-lg font-medium text-white/80 shadow-inner focus:border-orange-600 transition-all resize-none" />
                </div>

                <button type="submit" className="w-full py-10 bg-orange-600 text-black font-black uppercase tracking-[0.5em] rounded-[3rem] hover:bg-orange-700 transition-all shadow-2xl text-xl italic flex items-center justify-center gap-6 group">
                  Deploy Foreman Thinking <Zap size={28} className="group-hover:scale-125 transition-transform"/>
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'proc' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-72 h-72 border-[16px] border-white/5 border-t-orange-600 rounded-full animate-spin shadow-[0_0_50px_rgba(234,88,12,0.1)]" />
              <Sparkles size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-5xl font-black italic uppercase tracking-tighter">Grounded Logic Scaling...</h3>
              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] italic">Synthesizing CSI Divisions + Market Data Citations + Blueprint Analysis</p>
            </div>
          </div>
        )}

        {view === 'result' && activeEst && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
            <div className="lg:col-span-8 space-y-12">
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[4rem] shadow-2xl overflow-hidden">
                <div className="bg-orange-600 p-20 text-black relative">
                  <Handshake size={60} className="absolute top-10 right-10 opacity-10" />
                  <h1 className="text-6xl font-black italic tracking-tighter leading-none uppercase">Myers Industrial Proposal</h1>
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] italic mt-6 opacity-60">Provisioned via Gemini-3-Pro Node • Regional Ref: {project.location}</p>
                </div>
                <div className="p-20 space-y-20 bg-[#0d0d0d]">
                  <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 shadow-inner">
                    <p className="text-2xl font-black italic tracking-tighter uppercase leading-tight text-white/90">{activeEst.projectSummary}</p>
                  </div>
                  
                  <div className="space-y-16">
                    {Array.from(new Set(activeEst.items.map(i => i.csi_division))).sort().map(div => (
                      <div key={div} className="space-y-10">
                        <h4 className="text-[12px] font-black text-orange-600 uppercase tracking-[0.5em] border-b border-white/5 pb-4 italic">{div}</h4>
                        <div className="space-y-6">
                          {activeEst.items.filter(i => i.csi_division === div).map(item => (
                            <div key={item.id} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between hover:border-orange-600 transition-all group shadow-sm">
                              <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center text-white/20 group-hover:text-orange-600 transition-colors shadow-inner border border-white/5">
                                  {item.category === 'Material' ? <Layers size={28}/> : <Briefcase size={28}/>}
                                </div>
                                <div>
                                  <p className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-3">{item.name}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md">{item.category}</span>
                                    {item.category === 'Material' && <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest italic flex items-center gap-2 underline">{item.retailerName}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right mt-8 md:mt-0">
                                <p className="text-4xl font-black italic tracking-tighter text-white">${item.total.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2 italic">${item.rate.toLocaleString()} / {item.unit} • QTY: {item.qty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeEst.groundingSources?.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group overflow-hidden">
                        <div className="overflow-hidden pr-4">
                          <p className="text-[10px] font-black text-white/80 uppercase truncate italic mb-1">{s.title}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase truncate tracking-widest italic">{new URL(s.uri).hostname}</p>
                        </div>
                        <ExternalLink size={14} className="text-orange-600 group-hover:scale-125 transition-transform" />
                      </a>
                    ))}
                  </div>

                  <button 
                    onClick={handleCommit} 
                    disabled={paying}
                    className="w-full py-10 bg-orange-600 text-black font-black uppercase tracking-[0.5em] rounded-[3rem] flex items-center justify-center gap-8 shadow-2xl italic text-xl transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {paying ? <Activity className="animate-spin"/> : <Save size={28}/>} {paying ? 'Finalizing Node...' : 'Commit Record to SaaS Ledger'}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-12">
              <div className="bg-[#0d0d0d] rounded-[4rem] p-16 shadow-2xl border border-white/5 space-y-16 sticky top-24">
                <div className="space-y-12">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-white/30 italic flex items-center gap-5"><BarChart3 size={18}/> Operational Logistics</h3>
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-white/5 pb-10">
                      <div className="flex flex-col">
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest italic">Base Grounded Cost</span>
                        <span className="text-[8px] font-bold text-orange-600 uppercase tracking-widest italic">Live Market Adjusted</span>
                      </div>
                      <span className="text-4xl font-black italic tracking-tighter text-white">${financial.base.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    
                    <div className="space-y-10 pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest"><span className="text-white/30 italic">Burden Overhead</span><span className="text-white">{overhead}%</span></div>
                        <input type="range" min="5" max="25" value={overhead} onChange={e=>setOverhead(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none accent-orange-600 cursor-pointer" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest"><span className="text-white/30 italic">Net Profit Target</span><span className="text-orange-600">{markup}%</span></div>
                        <input type="range" min="10" max="50" value={markup} onChange={e=>setMarkup(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none accent-orange-600 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5 text-center">
                  <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] mb-6 italic">Grounded Proposal Total</p>
                  <p className="text-8xl font-black text-white tracking-tighter leading-none italic drop-shadow-[0_0_30px_rgba(234,88,12,0.25)]">${financial.final.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                </div>

                <div className="bg-[#1a1a1a] p-10 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                  <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest italic"><Info size={18}/> SaaS Node Intel</div>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-tight leading-relaxed italic">
                    Your <span className="text-white">{session.plan}</span> node leverages prioritized reasoning for localized building codes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-60 py-20 border-t border-white/5 bg-[#0d0d0d] px-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/20 font-black uppercase tracking-[0.6em] gap-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" />
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-black italic">Σ</div>
          <span className="text-white font-black text-xl italic tracking-tighter">Myers Estimate Generator</span>
        </div>
        <div className="flex items-center gap-10">
          <span className="flex items-center gap-3 italic"><ShieldCheck size={16} className="text-orange-600"/> SaaS Pro Tier Access</span>
          <span className="text-white/10 italic">© 2025 Myers Pre-Con Solutions</span>
        </div>
      </footer>
    </div>
  );
}
