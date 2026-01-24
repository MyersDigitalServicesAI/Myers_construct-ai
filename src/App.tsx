import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Database, Zap, Activity, Trash2, Globe, BarChart3,
  Sparkles, Building, ArrowLeft, Camera, FileText,
  LogOut, CreditCard, UserPlus, CheckCircle, Handshake, ChevronRight, Layers, Briefcase, Lock, Mic, MicOff, Stamp, Send, EyeOff, Calendar, Users
} from 'lucide-react';
import {
  ProjectData, ProjectType, UserPlan,
  ProjectScale, ProjectTimeline, SessionData
} from './types';
import { generateFullEstimate } from './services/geminiService';
import { initiateRetainerPayment } from './services/paymentService';
import { dbService } from './services/dbService';
import { getHistoricalContext } from './services/ragService';
import { VoiceAgentSetup } from './components/VoiceAgentSetup';
import { LeadsDashboard } from './components/LeadsDashboard';
import { CalendarIntegration } from './components/CalendarIntegration';
import { WaitlistDashboard } from './components/WaitlistDashboard';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { EmbeddedCheckoutModal } from './components/EmbeddedCheckoutModal';
import { Login } from './components/Login';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { OnboardingTour } from './components/OnboardingTour';
import { Eye, Smartphone } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const MarketTicker = () => (
  <div className="bg-orange-600 py-1.5 overflow-hidden whitespace-nowrap z-40 sticky top-20 shadow-lg">
    <div className="flex animate-marquee gap-10 items-center">
      {["CONSTRUCT AI ENGINE: v1.2.0-PROD", "STRIPE WEBHOOKS: READY", "DB LAYER: PERSISTENT", "CSI LOGIC: SYNCED", "GEMINI-3.0-FLASH: PRIMARY", "MARKET GROUNDING: LIVE"].map((t, i) => (
        <span key={i} className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-2 italic">
          <Activity size={10} /> {t}
        </span>
      ))}
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { display: flex; width: 200%; animation: marquee 20s linear infinite; }`}</style>
  </div>
);

const RestrictedProposalOverlay = ({ onSubscribe }: { onSubscribe: (plan: UserPlan) => void }) => {
  return (
    <div className="absolute inset-x-0 bottom-0 top-[30%] z-50 flex flex-col items-center justify-center px-6 pb-20">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-600/20 px-4 py-1.5 rounded-full mb-4">
          <Lock size={12} className="text-orange-600" />
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Proposal Restricted</span>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Provision a Plan to Unlock</h2>
        <p className="text-neutral-500 text-sm font-medium mb-8">Full line-item transparency and client-facing export nodes are locked behind your SaaS tier.</p>
        <button
          onClick={() => onSubscribe(UserPlan.PRO)}
          className="bg-orange-600 text-black px-10 py-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-orange-500 shadow-xl"
        >
          View Plans & Pricing
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState<'landing' | 'dash' | 'intake' | 'result' | 'proc' | 'agent' | 'leads' | 'calendar' | 'pricing' | 'waitlist'>('landing');
  const [history, setHistory] = useState<any[]>([]);
  const [project, setProject] = useState<ProjectData>({
    scope: '',
    location: '',
    size: '',
    description: '',
    projectType: ProjectType.RESIDENTIAL,
    projectScale: ProjectScale.SMALL,
    timeline: ProjectTimeline.STANDARD,
    estimateFee: 0
  });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const s = await dbService.getSession();
      const { items } = await dbService.getHistory();
      if (s) {
        setSession(s);
        setHistory(items);
        // If logged in, go to dashboard
        if (view === 'landing') setView('dash');

        const visited = localStorage.getItem(`myers_visited_${s.company}`);
        if (!visited) {
          setShowOnboarding(true);
          localStorage.setItem(`myers_visited_${s.company}`, 'true');
        }
      }
    };
    fetchData();

    // mobile PWA prompt logic
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isMobile && !isStandalone) {
      setTimeout(() => setShowPWAPrompt(true), 8000);
    }

    // Handle return from checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('return_from_checkout') === 'true') {
      const sessionId = urlParams.get('session_id');
      const isWaitlist = urlParams.get('is_waitlist') === 'true';

      if (isWaitlist) {
        alert("Welcome Founder! Your slot is secured. Check your email for onboarding instructions.");
      } else {
        alert("Subscription Provisioned Successfully!");
      }

      window.history.replaceState({}, document.title, "/");
      fetchData();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setProject(prev => ({
          ...prev,
          description: (prev.description ? prev.description + ' ' : '') + transcript
        }));
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported.");
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEstimate = async () => {
    if (!project.scope || !project.location) return;
    setLoading(true);
    setResult(null);
    setView('proc');
    try {
      // 1. Fetch RAG Context (Historical Bids) - Local logic for demo userId
      const historicalBids = session ? await getHistoricalContext('demo-user') : [];

      // 2. Generate Estimate with Context
      const res = await generateFullEstimate(project, attachment || undefined, historicalBids);
      const estimateWithMeta = { ...res, id: Date.now(), project, isAccepted: false };
      const newHistory: any = await dbService.saveEstimate(estimateWithMeta);
      setResult(estimateWithMeta);
      setHistory(newHistory.items || []);
      setView('result');
    } catch (e: any) {
      alert(e.message);
      setView('intake');
    } finally {
      setLoading(false);
    }
  };

  const handleGatedView = (targetView: any, requirement: 'canUseIntegrations' | 'canUseVisualTakeoff' | 'canUseSearch') => {
    if (!canAccessFeature(session?.plan || UserPlan.STARTER, requirement)) {
      setView('pricing');
    } else {
      setView(targetView);
    }
  };

  const canAccessFeature = (plan: UserPlan, feature: 'canUseIntegrations' | 'canUseVisualTakeoff' | 'canUseSearch') => {
    const access = {
      [UserPlan.STARTER]: { canUseIntegrations: false, canUseVisualTakeoff: false, canUseSearch: false },
      [UserPlan.PRO]: { canUseIntegrations: true, canUseVisualTakeoff: true, canUseSearch: true },
      [UserPlan.BUSINESS]: { canUseIntegrations: true, canUseVisualTakeoff: true, canUseSearch: true },
      [UserPlan.PRO_TEAM]: { canUseIntegrations: true, canUseVisualTakeoff: true, canUseSearch: true },
      [UserPlan.ENTERPRISE]: { canUseIntegrations: true, canUseVisualTakeoff: true, canUseSearch: true },
      [UserPlan.RESELLER]: { canUseIntegrations: true, canUseVisualTakeoff: true, canUseSearch: true },
    };
    return access[plan][feature];
  };

  const handlePayRetainer = async () => {
    if (!result || result.isAccepted || !session) return;
    setPaymentProcessing(true);
    try {
      const amount = (result.items?.reduce((acc: number, item: any) => acc + item.total, 0) || 0) * 0.1;
      const res: any = await initiateRetainerPayment(amount, result.project?.scope || 'Contract');
      if (res.success) {
        setResult((prev: any) => ({ ...prev, isAccepted: true, transactionId: res.transactionId }));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!session) {
    if (showAuth) {
      return <Login onProvisionPlan={async (plan) => {
        const s: SessionData = {
          plan,
          subscriptionActive: true,
          company: 'Admin User',
          trade: 'GC',
          signature: 'MOCK_SIG_' + Date.now(),
          usage: { estimatesLimit: 100, estimatesThisMonth: 0, usersLimit: 10, usersCount: 1, storageLimitBytes: 1e10, storageUsedBytes: 0 }
        };
        await dbService.saveSession(s);
        setSession(s);
      }} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans">
      <nav className="border-b border-neutral-900 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dash')}>
            <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <Building className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">Myers <span className="text-orange-600">Construct AI</span></h1>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Pre-Con AI Node</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white uppercase">{session.plan}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Subscription Active</p>
            </div>
            <button onClick={() => { dbService.clearSession(); setSession(null); }} className="p-2 hover:bg-neutral-900 rounded-lg transition-colors">
              <LogOut size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>
      </nav>

      <MarketTicker />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'dash' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="bg-[#0a0a0a] p-16 rounded-xl border border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Command Node</h2>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2 italic">Operating on Restricted Fleet</p>
              </div>
              <button onClick={() => setView('intake')} className="bg-orange-600 hover:bg-orange-500 text-black px-10 py-5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl">
                <Plus size={18} /> New AI Takeoff
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div onClick={() => handleGatedView('agent', 'canUseIntegrations')} className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-900 hover:border-orange-600 transition-all cursor-pointer group space-y-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-black transition-colors">
                  <Mic size={24} className="text-neutral-400 group-hover:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Voice Agent</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Receptionist Control</p>
                </div>
              </div>

              <div onClick={() => setView('leads')} className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-900 hover:border-orange-600 transition-all cursor-pointer group space-y-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-black transition-colors">
                  <Users size={24} className="text-neutral-400 group-hover:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Leads Ledger</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Status & Priority</p>
                </div>
              </div>

              <div onClick={() => setView('calendar')} className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-900 hover:border-orange-600 transition-all cursor-pointer group space-y-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-black transition-colors">
                  <Calendar size={24} className="text-neutral-400 group-hover:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Site Schedule</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Walkthroughs</p>
                </div>
              </div>

              <div onClick={() => setView('waitlist')} className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-900 hover:border-orange-600 transition-all cursor-pointer group space-y-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-black transition-colors">
                  <UserPlus size={24} className="text-neutral-400 group-hover:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Founders List</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Waitlist Signups</p>
                </div>
              </div>
            </div>

            <section className="bg-[#0a0a0a] border border-neutral-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-neutral-900 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-3"><Database size={16} /> Historical Ledger</h3>
              </div>
              {history.length ? (
                <div className="divide-y divide-neutral-900">
                  {history.map((h, i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-neutral-800/30 transition-colors group cursor-pointer" onClick={() => { setResult(h); setView('result'); }}>
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black italic text-lg border transition-all ${h.isAccepted ? 'bg-green-600/20 border-green-600 text-green-600' : 'bg-neutral-900 border-neutral-800 text-orange-600 group-hover:bg-orange-600 group-hover:text-black'}`}>
                          {h.isAccepted ? <Stamp size={20} /> : 'Σ'}
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase italic tracking-tighter group-hover:text-orange-600 transition-colors">{h.project?.scope || 'Untitled'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{h.project?.location || 'Unassigned'} • {new Date(h.id).toLocaleDateString()}</p>
                            {h.isAccepted && <span className="text-[8px] bg-green-600/20 text-green-500 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-green-600/30">Bonded</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <p className="text-xl font-black italic tracking-tighter text-white">
                          ${(h.items?.reduce((acc: any, item: any) => acc + item.total, 0) || 0).toLocaleString()}
                        </p>
                        <button onClick={(e) => { e.stopPropagation(); dbService.deleteEstimate(h.id).then(h => setHistory(h.items)); }} className="text-neutral-700 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="p-20 text-center text-neutral-700 font-black text-[10px] tracking-widest uppercase italic">No Cached History</div>}
            </section>
          </div>
        )}

        {view === 'intake' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-12 shadow-2xl relative">
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Intake Node</h2>
                <button onClick={() => setView('dash')} className="p-3 bg-neutral-900 rounded-lg hover:bg-orange-600 transition-all group">
                  <ArrowLeft size={20} className="group-hover:text-black text-neutral-400" />
                </button>
              </header>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Project Locale</label>
                    <input type="text" value={project.location} onChange={(e) => setProject({ ...project, location: e.target.value })} placeholder="e.g. Austin, TX" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-6 py-4 text-sm font-bold focus:border-orange-600 outline-none transition-all text-white placeholder:text-neutral-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Project Name</label>
                    <input type="text" value={project.scope} onChange={(e) => setProject({ ...project, scope: e.target.value })} placeholder="e.g. Harbor Office Reno" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-6 py-4 text-sm font-bold focus:border-orange-600 outline-none transition-all text-white placeholder:text-neutral-700" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Camera size={14} /> Blueprint Node (PDF/Image)</label>
                  <div className="relative border-2 border-dashed border-neutral-800 rounded-xl p-10 text-center hover:border-orange-600/50 transition-all cursor-pointer bg-neutral-900/50">
                    <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {attachment ? (
                      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        {attachment.mimeType === 'application/pdf' ? (
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={48} className="text-orange-600" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Digital Blueprint Loaded</span>
                          </div>
                        ) : (
                          <img src={attachment.data} className="h-32 mx-auto rounded-lg object-cover border border-neutral-700 shadow-xl" alt="Blueprint" />
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setAttachment(null); }} className="text-[10px] text-orange-600 font-black hover:underline uppercase tracking-widest italic flex items-center gap-1">
                          <Trash2 size={10} /> Discard Payload
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Camera className="text-neutral-700" size={32} />
                        <span className="text-[11px] text-neutral-600 font-black uppercase tracking-widest">Connect Visual Logic</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Scope Narrative</label>
                    <button onClick={toggleSpeech} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-500'}`}>
                      {isRecording ? <MicOff size={12} /> : <Mic size={12} />} {isRecording ? 'Listening' : 'Dictate'}
                    </button>
                  </div>
                  <textarea value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} placeholder="Materials, constraints, demo requirements..." className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-8 py-8 text-sm font-medium focus:border-orange-600 outline-none transition-all text-white min-h-[200px] resize-none" />
                </div>

                <button onClick={handleEstimate} disabled={loading || !project.scope} className="w-full bg-orange-600 hover:bg-orange-500 text-black py-6 rounded-xl font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl">
                  {loading ? <Activity className="animate-spin" /> : "Deploy Reasoning Core"}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'proc' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
            <div className="relative">
              <div className="w-48 h-48 border-[12px] border-neutral-900 border-t-orange-600 rounded-full animate-spin shadow-2xl" />
              <Sparkles size={50} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Myers 3.0 Flash Synthesis...</h3>
              <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">Deep Reasoning • Market Grounding</p>
            </div>
          </div>
        )}

        {view === 'result' && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-700">
            <div className="lg:col-span-8 space-y-12">
              <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl shadow-2xl overflow-hidden relative">
                <div className="bg-orange-600 p-12 text-black flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">Proposal Synthesis</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2">{result.project?.location}</p>
                  </div>
                  {result.isAccepted && <Stamp size={48} className="text-black opacity-30" />}
                </div>

                <div className="p-12 space-y-12 relative">
                  {!session.subscriptionActive && <RestrictedProposalOverlay onSubscribe={() => setView('pricing')} />}
                  <div className={`space-y-12 ${!session.subscriptionActive ? 'blur-xl select-none' : ''}`}>
                    <p className="text-lg font-bold italic text-white/90 leading-relaxed">{result.projectSummary}</p>
                    {Array.from(new Set(result.items?.map((i: any) => i.csi_division) || [])).map((div: any) => (
                      <div key={div} className="space-y-6">
                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-neutral-900 pb-2">{div}</h4>
                        <div className="space-y-4">
                          {result.items?.filter((i: any) => i.csi_division === div).map((item: any, idx: number) => (
                            <div key={idx} className="bg-neutral-900/30 p-6 rounded-xl border border-neutral-800 flex justify-between items-center group">
                              <div className="flex items-center gap-6">
                                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-neutral-700 group-hover:text-orange-600 transition-colors">
                                  {item.category === 'Material' ? <Layers size={18} /> : <Briefcase size={18} />}
                                </div>
                                <div>
                                  <p className="font-black uppercase italic tracking-tighter text-white">{item.name}</p>
                                  <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{item.category}</p>
                                </div>
                              </div>
                              <p className="text-xl font-black italic text-white">${item.total.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 gap-8 flex flex-col">
              <div className="bg-[#0a0a0a] rounded-xl p-8 border border-neutral-900 space-y-8 sticky top-24 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic flex items-center gap-2"><BarChart3 size={14} /> Node Metrics</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-neutral-900 pb-4">
                    <div className="flex flex-col">
                      <span className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Base Cost</span>
                    </div>
                    <span className="text-3xl font-black italic tracking-tighter text-white">
                      ${(result.items?.reduce((acc: any, i: any) => acc + i.total, 0) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-neutral-900 p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Confidence</span>
                      <span className="text-sm font-black text-white italic">{(result.marketConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Regional X</span>
                      <span className="text-sm font-black text-orange-600 italic">{result.regionalMultiplier}x</span>
                    </div>
                  </div>
                  <button onClick={handlePayRetainer} disabled={result.isAccepted || paymentProcessing} className={`w-full py-5 font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all ${result.isAccepted ? 'bg-green-600 text-black' : 'bg-white text-black hover:bg-neutral-200'}`}>
                    {paymentProcessing ? <Activity className="animate-spin" /> : (result.isAccepted ? <CheckCircle size={18} /> : <CreditCard size={18} />)}
                    {result.isAccepted ? 'Bonded' : 'Authorize'}
                  </button>
                  <button onClick={() => setShowDigitalTwin(true)} className="w-full py-4 border border-orange-600/50 bg-orange-600/5 text-orange-600 font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-orange-600 hover:text-black transition-all shadow-lg animate-pulse">
                    <Eye size={14} className="inline mr-2" /> Launch Digital Twin Experience
                  </button>
                  <button className="w-full py-4 border border-neutral-800 text-neutral-600 font-bold uppercase tracking-widest rounded-xl text-[10px] hover:border-orange-600 hover:text-orange-600 transition-all">
                    <Send size={14} className="inline mr-2" /> Dispatch Client Copy
                  </button>
                </div>
              </div>
            </div>
            {showDigitalTwin && <DigitalTwinViewer estimate={result} onClose={() => setShowDigitalTwin(false)} />}
          </div>
        )}

        {view === 'agent' && <VoiceAgentSetup onSave={(config) => { setView('dash'); }} />}
        {view === 'leads' && <LeadsDashboard />}
        {view === 'calendar' && <CalendarIntegration />}
        {view === 'waitlist' && <WaitlistDashboard />}
        {view === 'pricing' && <PricingPage currentPlan={session?.plan || UserPlan.STARTER} onBack={() => setView('dash')} />}
      </main>

      {isCheckoutOpen && selectedPlan && (
        <EmbeddedCheckoutModal plan={selectedPlan} onClose={() => setIsCheckoutOpen(false)} />
      )}

      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}

      {showPWAPrompt && (
        <div className="fixed bottom-6 left-6 right-6 z-[100] bg-orange-600 text-black p-6 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-4">
            <Smartphone size={24} className="shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Field Command Node</p>
              <h4 className="text-sm font-black uppercase italic tracking-tighter">Install as Mobile App</h4>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPWAPrompt(false)} className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-lg">Dismiss</button>
          </div>
        </div>
       )}
      <Analytics />
    </div>
  );
};
export default App;
