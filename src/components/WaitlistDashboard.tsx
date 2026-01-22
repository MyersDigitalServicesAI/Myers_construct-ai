import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, Mail, Phone, Briefcase, ChevronRight, Search, LayoutGrid, List, Sparkles, AlertCircle } from 'lucide-react';
import { dbService } from '../services/dbService';

interface WaitlistEntry {
    id: string;
    name: string;
    email: string;
    phone: string;
    trade: string;
    createdAt: string;
    status: string;
}

export const WaitlistDashboard = () => {
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            const data = await dbService.getWaitlist();
            setEntries(data as WaitlistEntry[]);
            setLoading(false);
        };
        load();
    }, []);

    const filteredEntries = entries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.trade.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    const spotsRemaining = Math.max(0, 30 - entries.length);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-700">
                <div className="w-12 h-12 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Querying Waitlist Node...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-600/20 px-3 py-1 rounded-full mb-2">
                        <Sparkles size={10} className="text-orange-500" />
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Growth Engine</span>
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Founders <span className="text-orange-600">Ledger</span></h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest italic">Monitoring early access signups & field-test eligibility</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center min-w-[140px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1 relative z-10">Total Intent</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter relative z-10">{entries.length}</span>
                    </div>
                    <div className={`flex-1 md:flex-none border p-6 rounded-2xl flex flex-col items-center justify-center min-w-[140px] relative overflow-hidden group ${spotsRemaining > 0 ? 'bg-orange-600/10 border-orange-600/30' : 'bg-red-900/10 border-red-900/30'}`}>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1 relative z-10">Spots Left</span>
                        <span className="text-2xl font-black text-orange-500 italic tracking-tighter relative z-10">{spotsRemaining} </span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-neutral-600 group-focus-within:text-orange-500 transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="SCAN LEDGER FOR NAME, TRADE, OR EMAIL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value.toUpperCase())}
                    className="w-full bg-[#0a0a0a] border border-neutral-900 rounded-2xl pl-16 pr-6 py-5 text-xs font-black tracking-widest text-white placeholder:text-neutral-700 focus:border-orange-600 outline-none transition-all focus:ring-4 focus:ring-orange-600/5"
                />
            </div>

            {/* Main List */}
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Visual Accent */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" />

                {filteredEntries.length > 0 ? (
                    <div className="divide-y divide-neutral-900">
                        {filteredEntries.map((entry, idx) => (
                            <div key={entry.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-neutral-800/30 transition-all group animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex items-center gap-8 flex-1 w-full md:w-auto">
                                    <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-700 border border-neutral-800 group-hover:border-orange-600/50 group-hover:text-orange-500 transition-all relative overflow-hidden">
                                        <Briefcase size={24} />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-orange-500 transition-colors">{entry.name}</h4>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            {entry.trade} <span className="w-1 h-1 bg-neutral-800 rounded-full" /> {new Date(entry.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                                    <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-lg flex items-center gap-3">
                                        <Mail size={12} className="text-neutral-600" />
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{entry.email}</span>
                                    </div>
                                    <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-lg flex items-center gap-3">
                                        <Phone size={12} className="text-neutral-600" />
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{entry.phone}</span>
                                    </div>
                                    <button className="p-3 bg-white/5 hover:bg-orange-600 border border-white/5 hover:border-orange-500 rounded-lg text-neutral-400 hover:text-black transition-all">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-32 text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto text-neutral-800 border border-neutral-800 mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">No matches found in the ledger</p>
                    </div>
                )}
            </div>
        </div>
    );
};
