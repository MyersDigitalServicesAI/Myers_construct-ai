import React from 'react';
import { Sparkles } from 'lucide-react';

const Processing = () => (
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
);

export default Processing;
