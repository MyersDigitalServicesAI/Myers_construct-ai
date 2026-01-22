import React, { useState, useEffect } from 'react';
import { Bot, Mic, MonitorSmartphone, Save, Play, Settings, Phone, MessageSquare } from 'lucide-react';
import { AgentConfiguration } from '../types';
import { dbService } from '../services/dbService';

export const VoiceAgentSetup = ({ onSave, initialConfig }: { onSave: (config: AgentConfiguration) => void, initialConfig?: AgentConfiguration }) => {
    const [activeTab, setActiveTab] = useState<'persona' | 'workflow' | 'deploy'>('persona');
    const [config, setConfig] = useState<AgentConfiguration>(initialConfig || {
        id: 'new-agent',
        isActive: false,
        name: 'Office Assistant',
        persona: 'professional',
        greeting: "Thanks for calling Myers Construction. This is our automated assistant. How can we help you start your project today?",
        voiceId: 'vapi-default-1',
        qualifyingQuestions: [
            "What is the approximate budget for this project?",
            "When are you looking to get started?",
            "Do you already have architectural drawings?"
        ],
        smsEnabled: true,
        calendarIntegration: true
    });

    useEffect(() => {
        const loadConfig = async () => {
            const saved = await dbService.getAgentConfig();
            if (saved) {
                setConfig(saved);
                if (saved.isActive) setDeployedNumber("+1 (512) 555-0198"); // Mock persistence of number
            }
        };
        loadConfig();
    }, []);

    const handleSave = async (newConfig: AgentConfiguration) => {
        await dbService.saveAgentConfig(newConfig);
        onSave(newConfig);
    };

    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedNumber, setDeployedNumber] = useState<string | null>(null);

    const handleDeploy = () => {
        setIsDeploying(true);
        // Mock provisioning
        setTimeout(() => {
            setIsDeploying(false);
            setDeployedNumber("+1 (512) 555-0198");
            setDeployedNumber("+1 (512) 555-0198");
            const newConfig = { ...config, isActive: true };
            setConfig(newConfig);
            handleSave(newConfig);
        }, 2500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Voice Agent Node</h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">Configure your AI Receptionist <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded ml-2">Gemini 3.0 Flash Active</span></p>
                </div>
                <div className="flex gap-2">
                    {['persona', 'workflow', 'deploy'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === tab ? 'bg-orange-600 text-black' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
                {/* TAB 1: PERSONA */}
                {activeTab === 'persona' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Internal Agent Name</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={e => setConfig({ ...config, name: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-bold text-white focus:border-orange-600 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Voice Persona</label>
                                <select
                                    value={config.persona}
                                    onChange={e => setConfig({ ...config, persona: e.target.value as any })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-bold text-white focus:border-orange-600 outline-none transition-all"
                                >
                                    <option value="professional">Executive Assistant (Professional)</option>
                                    <option value="friendly">Site Foreman (Friendly & Direct)</option>
                                    <option value="assertive">Project Manager (Assertive)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Initial Greeting</label>
                            <textarea
                                value={config.greeting}
                                onChange={e => setConfig({ ...config, greeting: e.target.value })}
                                className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-medium text-white focus:border-orange-600 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-black">
                                    <Play size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Test Voice Sample</p>
                                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Previewing: {config.persona}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
                                    <div key={i} className="w-1 bg-orange-600 animate-pulse rounded-full" style={{ height: h * 4 + 'px', animationDelay: i * 0.1 + 's' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: WORKFLOW */}
                {activeTab === 'workflow' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Qualification Questions (The AI will ask these)</label>
                            <div className="space-y-3">
                                {config.qualifyingQuestions.map((q: string, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="text-orange-600 font-black text-sm pt-4">0{i + 1}</span>
                                        <input
                                            value={q}
                                            onChange={(e) => {
                                                const newQ = [...config.qualifyingQuestions];
                                                newQ[i] = e.target.value;
                                                setConfig({ ...config, qualifyingQuestions: newQ });
                                            }}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm font-medium text-white focus:border-orange-600 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => setConfig({ ...config, qualifyingQuestions: [...config.qualifyingQuestions, ""] })}
                                    className="ml-9 text-[10px] text-orange-600 font-black uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    + Add Question
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-900">
                            <div className={`p-6 rounded-xl border transition-all cursor-pointer ${config.smsEnabled ? 'bg-orange-600/10 border-orange-600' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`} onClick={() => setConfig({ ...config, smsEnabled: !config.smsEnabled })}>
                                <div className="flex justify-between items-start mb-4">
                                    <MessageSquare className={config.smsEnabled ? 'text-orange-600' : 'text-neutral-500'} size={24} />
                                    <div className={`w-4 h-4 rounded-full border ${config.smsEnabled ? 'bg-orange-600 border-orange-600' : 'border-neutral-600'}`} />
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase">SMS Handoff</h4>
                                <p className="text-[10px] text-neutral-500 mt-2 font-medium">Instantly text me when a "Hot Lead" is identified.</p>
                            </div>

                            <div className={`p-6 rounded-xl border transition-all cursor-pointer ${config.calendarIntegration ? 'bg-orange-600/10 border-orange-600' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`} onClick={() => setConfig({ ...config, calendarIntegration: !config.calendarIntegration })}>
                                <div className="flex justify-between items-start mb-4">
                                    <Bot className={config.calendarIntegration ? 'text-orange-600' : 'text-neutral-500'} size={24} />
                                    <div className={`w-4 h-4 rounded-full border ${config.calendarIntegration ? 'bg-orange-600 border-orange-600' : 'border-neutral-600'}`} />
                                </div>
                                <h4 className="text-sm font-bold text-white uppercase">Auto-Booking</h4>
                                <p className="text-[10px] text-neutral-500 mt-2 font-medium">Allow AI to access my Google Calendar to book walkthroughs.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: DEPLOY */}
                {activeTab === 'deploy' && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in duration-500 text-center space-y-8">
                        {deployedNumber ? (
                            <div className="space-y-6">
                                <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto border border-green-600 animate-in zoom-in duration-500">
                                    <Phone size={40} className="text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Agent Deployed</h3>
                                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Active on Construction Network</p>
                                </div>
                                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
                                    <p className="text-neutral-500 text-[9px] uppercase tracking-widest font-black mb-2">Inbound Line</p>
                                    <p className="text-4xl font-black text-orange-600 tracking-widest font-mono">{deployedNumber}</p>
                                </div>
                                <button onClick={() => handleSave(config)} className="bg-white hover:bg-neutral-200 text-black px-8 py-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                                    Save Configuration to Fleet
                                </button>
                            </div>
                        ) : (
                            <>
                                {isDeploying ? (
                                    <div className="relative">
                                        <div className="w-32 h-32 border-[10px] border-neutral-900 border-t-orange-600 rounded-full animate-spin" />
                                        <Settings className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-700 animate-pulse" size={40} />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                                        <MonitorSmartphone size={50} className="text-neutral-600" />
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{isDeploying ? 'Provisioning Line...' : 'Ready to Deploy'}</h3>
                                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 max-w-sm mx-auto leading-relaxed">
                                        {isDeploying ? 'Allocating Twilio Number • Syncing Vapi Voice Model • Configuring Webhooks' : 'This will provision a dedicated phone number and attach your AI Agent.'}
                                    </p>
                                </div>

                                {!isDeploying && (
                                    <button onClick={handleDeploy} className="bg-orange-600 hover:bg-orange-500 text-black px-12 py-5 rounded-lg text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:scale-105 transition-all">
                                        Deploy Voice Agent
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};
