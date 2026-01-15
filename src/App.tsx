import React, { useState, useEffect } from 'react';
import { 
  Building, LogOut, ShieldCheck
} from 'lucide-react';
import { 
  ProjectData, ProjectType, EstimateResult, UserPlan, 
  ProjectScale, ProjectTimeline, SessionData
} from './types';
import { generateFullEstimate } from './geminiService';
import { dbService } from './dbService';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { handleError } from './errorHandler';

import MarketTicker from './components/MarketTicker';
import Paywall from './components/Paywall';
import Dashboard from './components/Dashboard';
import IntakeForm from './components/IntakeForm';
import Processing from './components/Processing';
import EstimateResultView from './components/EstimateResultView';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [view, setView] = useState<'dash' | 'intake' | 'result' | 'proc'>('dash');
  const [history, setHistory] = useState<any[]>([]);
  const [activeEst, setActiveEst] = useState<EstimateResult | null>(null);
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  const [project, setProject] = useState<ProjectData>({
    scope: '', location: '', size: 'medium', description: '',
    projectType: ProjectType.RESIDENTIAL, projectScale: ProjectScale.MEDIUM,
    timeline: ProjectTimeline.STANDARD, estimateFee: 150, isAccepted: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Load session and history
          let s = await dbService.getSession();
          
          // If no session exists for this user, create a default one
          if (!s) {
            s = {
              signature: `NODE-${currentUser.uid.slice(0,6).toUpperCase()}`,
              plan: UserPlan.ESSENTIAL,
              company: currentUser.displayName || 'New Entity',
              trade: 'GC',
              subscriptionActive: false // Default to false
            };
            await dbService.saveSession(s);
          }
          
          setSession(s);
          const h = await dbService.getHistory();
          setHistory(h);
        } else {
          setSession(null);
          setHistory([]);
        }
      } catch (err) {
        console.error("Auth State Error:", err);
        setAppError("Failed to synchronize user profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubscriptionComplete = async (plan: UserPlan) => {
    if (!session) return;
    try {
      const newSession = { ...session, plan, subscriptionActive: true };
      setSession(newSession);
      await dbService.saveSession(newSession);
    } catch (err) {
      setAppError("Failed to update subscription status.");
    }
  };

  const runEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);
    setView('proc');
    try {
      const res = await generateFullEstimate(project, blueprint || undefined);
      setActiveEst(res);
      setView('result');
    } catch (err) { 
      // Error is already logged in service
      setView('intake'); 
      setAppError(handleError(err));
    }
  };

  const handleCommit = async (financial: any) => {
    setPaying(true);
    setAppError(null);
    try {
      const h = { 
        ...activeEst, 
        client_name: project.scope, 
        total_cost: financial.final, 
        county: project.location, 
      };
      const updatedHistory = await dbService.saveEstimate(h);
      setHistory(updatedHistory);
      setView('dash');
    } catch (err) {
      setAppError("Failed to save estimate to ledger.");
    } finally {
      setPaying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dbService.clearSession();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Global Error Banner
  const ErrorBanner = () => appError ? (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
      <LogOut size={16} /> {appError}
      <button onClick={() => setAppError(null)} className="ml-4 hover:text-black"><LogOut size={12} className="rotate-45" /></button>
    </div>
  ) : null;

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-600 font-black italic">INITIALIZING NODE...</div>;
  
  if (!user) return <Login />;
  
  if (session && !session.subscriptionActive) {
      return <Paywall onSubscribe={handleSubscriptionComplete} company={session.company} />;
  }

  // Fallback if session is somehow null but user is logged in (rare race condition)
  if (!session) return null;

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
          <button onClick={handleLogout} className="text-white/20 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white/5">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <MarketTicker />
      <ErrorBanner />

      <main className="max-w-7xl mx-auto p-10">
        {view === 'dash' && (
          <Dashboard 
            session={session} 
            history={history} 
            setHistory={setHistory} 
            setView={setView} 
          />
        )}

        {view === 'intake' && (
          <IntakeForm 
            project={project} 
            setProject={setProject} 
            blueprint={blueprint} 
            setBlueprint={setBlueprint} 
            runEstimate={runEstimate} 
            setView={setView}
          />
        )}

        {view === 'proc' && <Processing />}

        {view === 'result' && activeEst && (
          <EstimateResultView 
            activeEst={activeEst}
            project={project}
            handleCommit={handleCommit}
            paying={paying}
            session={session}
          />
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
