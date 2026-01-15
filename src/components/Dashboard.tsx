import React, { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { Plus, TrendingUp, ShieldCheck, Activity, Database, Trash2 } from 'lucide-react';
import { dbService } from '../dbService';

interface DashboardProps {
  session: any;
  history: any[];
  setHistory: Dispatch<SetStateAction<any[]>>;
  setView: (view: 'dash' | 'intake' | 'result' | 'proc') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, history, setHistory, setView }) => {
  const handleDelete = async (id: string) => {
      const updated = await dbService.deleteEstimate(id);
      setHistory(updated);
  };

  return (
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
                  <button onClick={() => handleDelete(h.id)} className="text-white/10 hover:text-red-500 mt-2 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="p-40 text-center text-white/10 uppercase font-black text-xs tracking-widest italic">Database Ledger Clear</div>}
      </div>
    </div>
  );
};

export default Dashboard;
