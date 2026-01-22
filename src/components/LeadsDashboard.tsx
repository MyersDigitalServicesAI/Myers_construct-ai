import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Calendar, ChevronRight, User, Clock, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { dbService } from '../services/dbService';

export const LeadsDashboard = ({ onGenerateContract }: { onGenerateContract?: (lead: Lead) => void }) => {
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await dbService.getLeads();
            setLeads(data);
        };
        load();
    }, []);

    const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
        const updatedLead = { ...lead, status: newStatus };

        // Optimistic UI update
        setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));

        await dbService.updateLead(updatedLead);
    };

    const getStatusColor = (status: LeadStatus) => {
        switch (status) {
            case LeadStatus.HOT: return 'text-red-500 bg-red-500/10 border-red-500/20';
            case LeadStatus.WARM: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case LeadStatus.COLD: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-neutral-500 bg-neutral-900 border-neutral-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Leads Matrix</h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">AI-Qualified Opportunities</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col items-center">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Pipeline Value</span>
                        <span className="text-xl font-black text-white italic tracking-tighter">$145,000</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[LeadStatus.HOT, LeadStatus.WARM, LeadStatus.COLD].map((status) => (
                    <div key={status} className="space-y-4">
                        <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(status)}`}>
                            <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                {status === LeadStatus.HOT && <AlertCircle size={14} />}
                                {status === LeadStatus.WARM && <Clock size={14} />}
                                {status === LeadStatus.COLD && <User size={14} />}
                                {status} Leads
                            </h3>
                            <span className="text-xs font-bold opacity-80">{leads.filter(l => l.status === status).length}</span>
                        </div>

                        <div className="space-y-4">
                            {leads.filter(l => l.status === status).map((lead) => (
                                <div key={lead.id} className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-xl hover:border-orange-600/50 transition-all group relative overflow-hidden">

                                    {lead.actionRequired && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full block animate-pulse" />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase italic tracking-tight">{lead.summary}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs font-black ${status === LeadStatus.HOT ? 'text-red-500' : 'text-neutral-600'}`}>
                                            {lead.score}%
                                        </span>
                                    </div>

                                    <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800 mb-6">
                                        <p className="text-[10px] text-neutral-400 italic line-clamp-2">"{lead.transcript}"</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mb-2">
                                        {status !== LeadStatus.HOT && (
                                            <button onClick={() => handleStatusChange(lead, LeadStatus.HOT)} className="flex-1 bg-red-900/10 hover:bg-red-900/30 text-red-500 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                                Mark Hot
                                            </button>
                                        )}
                                        {status !== LeadStatus.COLD && (
                                            <button onClick={() => handleStatusChange(lead, LeadStatus.COLD)} className="flex-1 bg-blue-900/10 hover:bg-blue-900/30 text-blue-500 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                                Mark Cold
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onGenerateContract && onGenerateContract(lead)}
                                        className="w-full mt-2 bg-white text-black hover:bg-neutral-200 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                                    >
                                        Convert to Project <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            ))}
                            {leads.filter(l => l.status === status).length === 0 && (
                                <div className="p-8 border-2 border-dashed border-neutral-900 rounded-xl flex flex-col items-center justify-center text-neutral-700">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Leads</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
                }
            </div >
        </div >
    );
};
