import React, { useState } from 'react';
import { Rocket, Star, Shield, CheckCircle, Activity, Lock } from 'lucide-react';
import { UserPlan } from '../types';
import { initiateSubscription } from '../paymentService';

interface PaywallProps {
  onSubscribe: (plan: UserPlan) => void;
  company: string;
}

const Paywall: React.FC<PaywallProps> = ({ onSubscribe, company }) => {
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

export default Paywall;
