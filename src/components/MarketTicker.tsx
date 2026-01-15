import React from 'react';
import { Activity } from 'lucide-react';

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

export default MarketTicker;
