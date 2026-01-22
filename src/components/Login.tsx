import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { auth, googleProvider } from '../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

import { UserPlan } from '../types';

interface LoginProps {
  onProvisionPlan?: (plan: UserPlan) => void;
}

export const Login: React.FC<LoginProps> = ({ onProvisionPlan }) => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed", err);
      setError("Access Denied: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 antialiased">
      <div className="max-w-xl w-full bg-[#0d0d0d] rounded-[3rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px]" />

        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-black italic">Σ</div>
          <span className="font-black text-xl uppercase tracking-tighter italic text-white">Myers Construct AI</span>
        </div>

        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none relative z-10">
          Secure <span className="text-orange-600">Access Node.</span>
        </h1>

        <div className="space-y-6 relative z-10">
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-2">System Status</p>
            <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online • Encrypted
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-6 bg-orange-600 text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-orange-700 transition-all text-sm italic shadow-2xl flex items-center justify-center gap-4 group"
          >
            <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
            Authenticate w/ Google
          </button>

          {onProvisionPlan && (import.meta.env.DEV || import.meta.env.MODE === 'test') && (
            <button
              onClick={() => onProvisionPlan(UserPlan.STARTER)}
              className="w-full py-4 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all text-xs italic border border-dashed border-white/10"
            >
              [TEST MODE] Bypass Identity
            </button>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <p className="text-center text-[9px] font-black text-white/10 uppercase tracking-[0.5em] italic flex items-center justify-center gap-2 mt-8">
            <Lock size={10} /> Enterprise Identity Layer
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
