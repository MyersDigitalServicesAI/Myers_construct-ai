import React, { useState, useMemo } from 'react';
import { Handshake, Layers, Briefcase, ExternalLink, Activity, Save, BarChart3, Info } from 'lucide-react';
import { EstimateResult, ProjectData } from '../types';

interface EstimateResultProps {
  activeEst: EstimateResult;
  project: ProjectData;
  handleCommit: (financial: any) => Promise<void>;
  paying: boolean;
  session: any;
}

const EstimateResultView: React.FC<EstimateResultProps> = ({ activeEst, project, handleCommit, paying, session }) => {
  const [markup, setMarkup] = useState(35);
  const [overhead, setOverhead] = useState(15);

  const financial = useMemo(() => {
    if (!activeEst) return { base: 0, final: 0, due: 0, profit: 0 };
    const base = activeEst.items.reduce((a, c) => a + c.total, 0);
    const final = base / (1 - (markup + overhead) / 100);
    return { base, final };
  }, [activeEst, markup, overhead]);

  return (
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
              onClick={() => handleCommit(financial)} 
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
  );
};

export default EstimateResultView;
