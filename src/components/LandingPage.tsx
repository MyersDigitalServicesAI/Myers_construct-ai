import React, { useState, useEffect } from 'react';
import {
    Phone, Calendar, FileText, ShieldCheck, ArrowRight, CheckCircle2,
    XCircle, Clock, Award, TrendingUp, Zap, MessageSquare, ChevronDown,
    ChevronUp, Lock, Users, Star, ArrowUpRight, Loader2, Menu, X, Shield
} from 'lucide-react';
import { dbService } from '../services/dbService';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', trade: '', company: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const joinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.name) return;
        setStatus('loading');
        try {
            // First save to Firestore waitlist
            await dbService.submitWaitlist(form);

            // Then initiate Stripe checkout for the "Founder Slot"
            const { createWaitlistCheckout } = await import('../services/paymentService');
            await createWaitlistCheckout(form);

            // Redirect happens in createWaitlistCheckout, if we get here it failed or was aborted
            setStatus('idle');
        } catch (e: any) {
            console.error("Waitlist Error:", e);
            setStatus('error');
            alert(e.message || "Could not initiate checkout. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">

            {/* Background Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] opacity-40" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-white/5 py-4' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-white/10">
                            <span className="font-black text-black italic text-2xl">Σ</span>
                        </div>
                        <div className="hidden md:block">
                            <span className="block font-black text-lg italic tracking-tighter uppercase leading-none text-white">Myers Construct</span>
                            <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Artificial Intelligence</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors">Features</button>
                        <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors">How It Works</button>
                        <div className="h-6 w-px bg-white/10" />
                        <button
                            onClick={onGetStarted}
                            className="group relative px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">Sign In <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-32 px-6 space-y-8 md:hidden animate-in slide-in-from-right duration-300">
                    <button onClick={onGetStarted} className="text-2xl font-black uppercase tracking-tighter text-white block w-full text-left">Sign In</button>
                    <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} className="text-2xl font-black uppercase tracking-tighter text-neutral-500 block w-full text-left">Features</button>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 md:pt-60 md:pb-32 px-6 z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-12">
                        {/* Status Chip */}
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700 hover:border-orange-500/30 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Founders List: <span className="text-white">Open</span></span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] text-white">
                                Your phone <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-200">prints money</span>
                                <br /> while you work.
                            </h1>
                            <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed max-w-xl border-l-2 border-orange-600 pl-6">
                                The AI Receptionist that answers 24/7, qualifies leads, gives estimates, and books jobs. Stop losing $50k/year to voicemail.
                            </p>
                        </div>

                        {/* Stats / Proof */}
                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div>
                                <p className="text-3xl font-black text-white">24/7</p>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Response Time</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">100%</p>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Lead Capture</p>
                            </div>
                        </div>
                    </div>

                    {/* Waitlist Card */}
                    <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 blur-[80px] opacity-20 rounded-full" />
                        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
                            {status === 'success' ? (
                                <div className="text-center py-20 space-y-6">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Spot Secured</h3>
                                    <p className="text-neutral-400">Keep an eye on your texts. We'll reach out shortly to onboard you.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8 space-y-2">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Join the Waitlist</h3>
                                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                                            <Zap size={12} fill="currentColor" />
                                            <span>Get a <span className="underline underline-offset-4">10% discount</span> on launch</span>
                                        </div>
                                    </div>

                                    <form onSubmit={joinWaitlist} className="space-y-4">
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="YOUR NAME"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="TRADE (e.g. ROOFING)"
                                                value={form.trade}
                                                onChange={e => setForm({ ...form, trade: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="COMPANY NAME"
                                                value={form.company}
                                                onChange={e => setForm({ ...form, company: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="email"
                                                placeholder="EMAIL ADDRESS"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="tel"
                                                placeholder="MOBILE PHONE"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full bg-white text-black hover:bg-neutral-200 py-5 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-6 group shadow-lg shadow-white/5"
                                        >
                                            {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <>Claim Spot <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                                        </button>
                                        <p className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-4 italic">
                                            Joining the waitlist lock in 10% lifetime discount
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Clarity Strip */}
            <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm z-20 relative">
                <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
                    {[
                        { icon: ShieldCheck, title: "Built For Trades", desc: "No generic chat bots. Tuned for GC, HVAC, Plumbing, and Electric." },
                        { icon: Zap, title: "Zero Lag", desc: "Instantly answers, qualifies, and books. Faster than your best admin." },
                        { icon: Award, title: "Field Tested", desc: "Built by a contractor with 20+ years of dirt under his fingernails." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-5 items-start">
                            <div className="p-3 bg-white/5 rounded-xl text-orange-500 border border-white/5">
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-wider mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">Complete <span className="text-orange-600">Autopilot</span></h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-transparent" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Phone, title: "Call Handling", desc: "Answers every call instantly. Distinguishes between leads, vendors, and spam." },
                            { icon: TrendingUp, title: "Instant Estimates", desc: "Generates ballpark quotes based on your specific pricing data." },
                            { icon: Calendar, title: "Auto-Booking", desc: "Schedules qualified walkthroughs directly to your calendar." },
                            { icon: FileText, title: "Contracts Ready", desc: "Drafts professional proposals and agreements automatically." },
                            { icon: MessageSquare, title: "SMS Command", desc: "You get texts for hot leads. You reply to command the AI." },
                            { icon: Shield, title: "Permit Logic", desc: "Checks local codes and flags permit requirements for jobs." },
                        ].map((feat, i) => (
                            <div key={i} className="group p-8 bg-neutral-900/40 border border-white/5 hover:border-orange-600/50 rounded-2xl transition-all duration-300 hover:bg-neutral-900/80 hover:-translate-y-1">
                                <div className="mb-6 text-neutral-500 group-hover:text-orange-500 transition-colors">
                                    <feat.icon size={32} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-3">{feat.title}</h3>
                                <p className="text-sm text-neutral-400 font-medium leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-32 px-6 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-600/50 to-transparent" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">The Workflow</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">From Ring to Revenue</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-gradient-to-r from-neutral-800 via-orange-900 to-neutral-800 -z-10" />

                        {[
                            { step: "01", title: "Connect", desc: "Link your existing business number." },
                            { step: "02", title: "Train", desc: "Upload your pricing & services." },
                            { step: "03", title: "Active", desc: "AI takes 100% of calls." },
                            { step: "04", title: "Profit", desc: "Wake up to booked jobs." },
                        ].map((item, i) => (
                            <div key={i} className="relative pt-12 text-center md:text-left">
                                <div className="inline-flex w-20 h-20 items-center justify-center bg-[#050505] border-4 border-[#0a0a0a] rounded-full text-3xl font-black italic text-white shadow-2xl mb-8 relative z-10 mx-auto md:mx-0">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-neutral-500 font-bold uppercase tracking-wide">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Offer / Founders List */}
            <section className="py-40 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="relative p-12 md:p-24 bg-gradient-to-b from-neutral-900/50 to-black border border-white/10 rounded-[3rem] overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                        <div className="absolute bottom-0 inset-x-0 h-[300px] bg-gradient-to-t from-orange-600/10 to-transparent opacity-50 pointer-events-none" />

                        <div className="relative z-10 space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">
                                    Founders <span className="text-orange-600">Access</span>
                                </h2>
                                <p className="text-xl text-neutral-400 font-medium max-w-2xl mx-auto">
                                    We are opening 30 spots for early adopters to lock in lifetime pricing.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-6xl font-black text-white">$250</span>
                                <span className="text-sm font-bold text-neutral-500 uppercase tracking-[0.3em]">Per Month • Lifetime Rate</span>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="bg-white text-black hover:bg-neutral-200 px-12 py-6 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                >
                                    Claim One of 30 Spots
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#020202]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        © 2024 Myers Construct AI.
                    </p>
                    <div className="flex gap-8">
                        <button onClick={onGetStarted} className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">Admin Login</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
