import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { auth, googleProvider } from '../services/firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { UserPlan } from '../types';

interface LoginProps {
  onProvisionPlan?: (plan: UserPlan) => void;
}

export const Login: React.FC<LoginProps> = ({ onProvisionPlan }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed", err);
      setError("Access Denied: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth failed", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 antialiased">
      <div className="max-w-xl w-full bg-[#0d0d0d] rounded-[3rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px]" />

        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-xl italic">
            Σ
          </div>
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">Myers Construct AI</span>
        </div>

        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">SECURE <span className="text-orange-600">ACCESS NODE.</span></h2>

        <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 px-4 py-1.5 rounded-full mb-10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">SYSTEM STATUS</span>
          <span className="text-[9px] font-black text-green-500 uppercase tracking-widest ml-2">ONLINE • ENCRYPTED</span>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600/20 px-4 py-3 rounded-xl mb-6">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4 text-sm font-bold focus:border-orange-600 outline-none transition-all text-white placeholder:text-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4 text-sm font-bold focus:border-orange-600 outline-none transition-all text-white placeholder:text-neutral-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all shadow-2xl disabled:opacity-50"
          >
            <Lock size={16} />
            {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-[#0d0d0d] px-4 text-neutral-600">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all shadow-2xl disabled:opacity-50"
        >
          <ShieldCheck size={16} />
          AUTHENTICATE W/ GOOGLE
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[10px] font-black text-neutral-500 hover:text-orange-600 uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <p className="text-[8px] text-neutral-700 text-center mt-8 font-black uppercase tracking-widest italic">⚡ ENTERPRISE IDENTITY LAYER</p>
      </div>
    </div>
  );
};
