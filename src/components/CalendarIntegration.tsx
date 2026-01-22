import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, RefreshCw, X, AlertCircle, Link } from 'lucide-react';
import { CalendarConfig, CalendarEvent } from '../types';
import { dbService } from '../services/dbService';

export const CalendarIntegration = () => {
    const [config, setConfig] = useState<CalendarConfig>({
        isConnected: false,
        email: null,
        syncEnabled: true,
        autoBookHotLeads: true,
        workingHours: {
            start: '08:00',
            end: '18:00',
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        }
    });

    useEffect(() => {
        const load = async () => {
            const saved = await dbService.getCalendarConfig();
            if (saved) setConfig(saved);
        };
        load();
    }, []);

    const updateConfig = async (newConfig: CalendarConfig) => {
        setConfig(newConfig);
        await dbService.saveCalendarConfig(newConfig);
    };

    const [isConnecting, setIsConnecting] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([
        { id: '1', title: 'Walkthrough - 2000sqft Roof', start: '2024-02-15T09:00:00', end: '2024-02-15T10:00:00', attendees: ['lead@example.com'], type: 'walkthrough' },
        { id: '2', title: 'Inspection - Water Damage', start: '2024-02-15T14:00:00', end: '2024-02-15T15:00:00', attendees: ['owner@example.com'], type: 'inspection' }
    ]);

    const handleConnect = () => {
        setIsConnecting(true);
        // Mock Auth Flow
        setTimeout(() => {
            const newConfig = { ...config, isConnected: true, email: 'contractor@myers-construct.com' };
            updateConfig(newConfig);
            setIsConnecting(false);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Scheduling Node</h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">Manage Availability & AI Booking</p>
                </div>
                {config.isConnected && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Live Sync Active</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Connection Card */}
                <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                                <CalendarIcon size={24} className={config.isConnected ? "text-blue-500" : "text-neutral-500"} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Google Calendar</h3>
                                <p className="text-[10px] text-neutral-500 font-medium">{config.isConnected ? config.email : 'Not Connected'}</p>
                            </div>
                        </div>
                        {config.isConnected && (
                            <button onClick={() => updateConfig({ ...config, isConnected: false, email: null })} className="text-neutral-600 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {!config.isConnected ? (
                        <div className="space-y-4">
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">Connect your primary working calendar to allow the AI to check conflicts and book walkthroughs automatically.</p>
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full bg-white hover:bg-neutral-200 text-black py-4 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                {isConnecting ? <RefreshCw className="animate-spin" size={14} /> : <Link size={14} />}
                                {isConnecting ? 'Authenticating...' : 'Connect Google Account'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Configuration</label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                        <span className="text-xs font-bold text-white">Auto-Book Hot Leads</span>
                                        <div
                                            className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.autoBookHotLeads ? 'bg-orange-600' : 'bg-neutral-700'}`}
                                            onClick={() => updateConfig({ ...config, autoBookHotLeads: !config.autoBookHotLeads })}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.autoBookHotLeads ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                        <span className="text-xs font-bold text-white">Sync Conflicts</span>
                                        <div
                                            className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.syncEnabled ? 'bg-orange-600' : 'bg-neutral-700'}`}
                                            onClick={() => updateConfig({ ...config, syncEnabled: !config.syncEnabled })}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.syncEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upcoming Schedule */}
                <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2 mb-6"><Clock size={14} /> Upcoming AI Bookings</h3>

                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg hover:border-orange-600/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${event.type === 'walkthrough' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>{event.type}</span>
                                    <span className="text-[10px] text-neutral-500 font-mono">{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm font-bold text-white uppercase italic tracking-tight">{event.title}</p>
                                <p className="text-[10px] text-neutral-500 font-mono mt-1 flex items-center gap-2">{new Date(event.start).toLocaleDateString()} <span className="w-1 h-1 bg-neutral-700 rounded-full" /> {event.attendees[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
