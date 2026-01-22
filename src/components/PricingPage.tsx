import React, { useEffect, useState } from 'react';
import { Check, X, Shield, Zap, Users, Layout, Building, Globe, Star, ArrowLeft } from 'lucide-react';
import { PLANS } from '../config/planDefinitions';
import { UserPlan } from '../types';
import { EmbeddedCheckoutModal } from './EmbeddedCheckoutModal';
import { analyticsService } from '../services/analyticsService';
import { auth } from '../services/firebaseConfig';

interface PricingPageProps {
    currentPlan: UserPlan;
    onBack: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ currentPlan, onBack }) => {
    const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);

    useEffect(() => {
        analyticsService.logEvent('page_view', auth.currentUser?.uid, currentPlan, { page: 'pricing' });
    }, [currentPlan]);

    const handleUpgrade = (plan: UserPlan) => {
        analyticsService.logEvent('plan_upgrade_initiated', auth.currentUser?.uid, plan, { price: PLANS[plan].price });
        setSelectedPlan(plan);
    };

    // Convert PLANS object to array for mapping
    const plans = Object.entries(PLANS).map(([key, details]) => ({
        key: key as UserPlan,
        ...details
    }));

    return (
        <div className="min-h-screen bg-[#050505] text-white py-12 px-6 animate-in fade-in duration-500">
            {selectedPlan && (
                <EmbeddedCheckoutModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
                        <ArrowLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Plan Architecture</h1>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Scale your operation node</p>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan === plan.key;
                        return (
                            <div
                                key={plan.key}
                                className={`relative p-6 rounded-xl border flex flex-col h-full bg-neutral-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${isCurrent ? 'border-green-500 bg-green-900/10' :
                                    plan.name === 'Pro' ? 'border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.1)]' : 'border-neutral-800 hover:border-neutral-600'
                                    }`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-black text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                                        Active Node
                                    </div>
                                )}

                                <div className="mb-6 text-center">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-300">{plan.name}</h3>
                                    <div className="text-3xl font-black italic tracking-tighter text-white mt-2 mb-1">
                                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                    </div>
                                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">/ Month</p>
                                </div>

                                <div className="space-y-4 flex-grow border-t border-neutral-800 pt-6">
                                    <FeatureRow icon={Layout} label="Estimates" value={plan.features.estimatesPerMonth === -1 ? 'Unlimited' : plan.features.estimatesPerMonth} highlight={plan.features.estimatesPerMonth === -1} />
                                    <FeatureRow icon={Users} label="Users" value={plan.features.users === -1 ? 'Unlimited' : plan.features.users} />
                                    <FeatureRow icon={Shield} label="Storage" value={plan.features.storageGB === -1 ? 'Unlimited' : `${plan.features.storageGB} GB`} />

                                    <BooleanFeature label="Proposals" included={plan.features.canGenerateProposals} />
                                    <BooleanFeature label="Contracts" included={plan.features.canGenerateContracts} />
                                    <BooleanFeature label="Teams/Route" included={plan.features.canUseTeams} />
                                    <BooleanFeature label="Integrations" included={plan.features.canUseIntegrations} />
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={() => !isCurrent && handleUpgrade(plan.key)}
                                        disabled={isCurrent}
                                        className={`w-full py-3 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isCurrent ? 'bg-green-900/20 text-green-500 cursor-default' :
                                            plan.name === 'Pro' || plan.name === 'Business' ? 'bg-orange-600 text-black hover:bg-orange-500 shadow-lg' :
                                                'bg-neutral-800 text-white hover:bg-neutral-700'
                                            }`}
                                    >
                                        {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ icon: Icon, label, value, highlight = false }: any) => (
    <div className="flex items-center justify-between text-[10px]">
        <span className="text-neutral-500 font-bold uppercase flex items-center gap-2">
            <Icon size={12} /> {label}
        </span>
        <span className={`font-black uppercase tracking-wide ${highlight ? 'text-orange-500' : 'text-white'}`}>{value}</span>
    </div>
);

const BooleanFeature = ({ label, included }: { label: string, included: boolean }) => (
    <div className="flex items-center justify-between text-[10px] opacity-80">
        <span className="text-neutral-500 font-bold uppercase">{label}</span>
        {included ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-neutral-700" />}
    </div>
);
