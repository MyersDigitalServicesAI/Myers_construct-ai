import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Sparkles, Zap, Smartphone, Brain } from 'lucide-react';

interface TourStep {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps: TourStep[] = [
        {
            title: "Digital Forensic Node",
            description: "Upload a blueprint and I'll automatically detect the scale to calculate square footage and material counts for you.",
            icon: <Sparkles className="text-orange-600" size={24} />
        },
        {
            title: "Proprietary RAG",
            description: "I learn from your historical bids. The more you use me, the better I align with your specific margins and vendor rates.",
            icon: <Brain className="text-orange-600" size={24} />
        },
        {
            title: "Digital Twin Proposals",
            description: "Send clients an interactive link where they can toggle standard vs. premium features and see price updates live.",
            icon: <Zap className="text-orange-600" size={24} />
        },
        {
            title: "Field-Ready PWA",
            description: "Save this app to your home screen. It works offline at the jobsite and syncs high-res plans when you're back on Wi-Fi.",
            icon: <Smartphone className="text-orange-600" size={24} />
        }
    ];

    const next = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                            {steps[step].icon}
                        </div>
                        <button onClick={onComplete} className="text-neutral-700 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i === step ? 'bg-orange-600' : 'bg-neutral-800'}`} />
                            ))}
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">{steps[step].title}</h2>
                        <p className="text-neutral-500 text-sm font-medium leading-relaxed">{steps[step].description}</p>
                    </div>

                    <button onClick={next} className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-all">
                        {step === steps.length - 1 ? "Start Commanding" : "Next Protocol"} <ChevronRight size={16} />
                    </button>

                    <p className="text-center text-[9px] text-neutral-700 font-black uppercase tracking-widest">
                        Step {step + 1} of {steps.length} • Command Node v1.2.0
                    </p>
                </div>
            </div>
        </div>
    );
};
