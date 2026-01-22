import React, { useState } from 'react';
import { Check, Info, Sparkles, Zap, Shield, BarChart3, ChevronRight, Stamp } from 'lucide-react';

interface DigitalTwinViewerProps {
    estimate: any;
    onClose: () => void;
}

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({ estimate, onClose }) => {
    const [tier, setTier] = useState<'Standard' | 'Premium'>('Standard');

    // Logic to simulate premium vs standard price updates
    const multiplier = tier === 'Premium' ? 1.25 : 1.0;
    const baseTotal = estimate.items?.reduce((acc: number, item: any) => acc + item.total, 0) || 0;
    const currentTotal = baseTotal * multiplier;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500">
            {/* Header / Nav */}
            <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur-xl sticky top-0 z-50 px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                        <Sparkles className="text-black" size={18} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Digital Twin Proposal</h2>
                </div>
                <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                    Exit Viewer
                </button>
            </nav>

            <main className="max-w-6xl mx-auto w-full px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Content */}
                <div className="lg:col-span-7 space-y-12">
                    <header>
                        <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-600/20 px-3 py-1 rounded-full mb-6">
                            <Zap size={10} className="text-orange-600" />
                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Interactive Real-Time Proposal</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">
                            {estimate.project?.scope}
                        </h1>
                        <p className="text-neutral-500 text-sm font-medium mt-4 leading-relaxed max-w-2xl">
                            {estimate.projectSummary}
                        </p>
                    </header>

                    {/* Tier Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setTier('Standard')}
                            className={`p-6 rounded-xl border transition-all text-left space-y-2 ${tier === 'Standard' ? 'bg-orange-600 border-orange-600 text-black' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Standard Performance</p>
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Baseline Spec</h4>
                        </button>
                        <button
                            onClick={() => setTier('Premium')}
                            className={`p-6 rounded-xl border transition-all text-left space-y-2 ${tier === 'Premium' ? 'bg-orange-600 border-orange-600 text-black' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Premium High-End</p>
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Grade A+ Spec</h4>
                        </button>
                    </div>

                    <div className="space-y-8">
                        {estimate.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center group py-4 border-b border-neutral-900">
                                <div>
                                    <h5 className="font-black uppercase italic text-white group-hover:text-orange-600 transition-colors">{item.name}</h5>
                                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{item.csi_division}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-black italic tracking-tighter text-lg">${(item.total * multiplier).toLocaleString()}</p>
                                    <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest">Qty: {item.qty} {item.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Sidebar Sticky */}
                <div className="lg:col-span-5">
                    <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-10 sticky top-36 space-y-10 shadow-2xl">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic flex items-center gap-2">
                                <BarChart3 size={14} /> Proposal Financials
                            </h3>
                            <div className="space-y-2">
                                <p className="text-6xl font-black italic tracking-tighter text-white">
                                    ${currentTotal.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest italic">Includes All General Conditions</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-green-600/10 border border-green-600/20 p-4 rounded-xl">
                                <Check size={16} className="text-green-600 shrink-0" />
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-tight">Price Protection Active for 30 Days</p>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl">
                                <Shield size={16} className="text-blue-600 shrink-0" />
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight">Bonding Capacity Verified</p>
                            </div>
                        </div>

                        <button className="w-full bg-white text-black py-6 rounded-xl font-black text-sm uppercase tracking-[0.3em] hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3">
                            <Stamp size={18} /> Authorize Digital Contract
                        </button>

                        <div className="pt-6 border-t border-neutral-900 text-center">
                            <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest leading-relaxed">
                                This is a live-negotiated document. All changes are logged synchronously for both parties.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
