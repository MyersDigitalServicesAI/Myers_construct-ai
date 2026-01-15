import React, { useState } from 'react';
import { SessionData, UserPlan } from '../types';

const TRADES = ['GC', 'Electrical', 'HVAC', 'Plumbing', 'Earthworks', 'Finishes'] as const;

interface OnboardingProps {
  onComplete: (s: SessionData) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
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

export default Onboarding;
