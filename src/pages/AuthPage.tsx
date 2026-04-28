import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Chrome, Mail } from 'lucide-react';
import Logo from '../components/Logo';

export default function AuthPage() {
  const { user, loginWithGoogle } = useAuth();

  if (user) return <Navigate to="/home" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-premium rounded-[3rem] p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="flex justify-center mb-32">
           <Logo size="xl" />
        </div>
        
        <div className="mt-8">
          <p className="text-slate-400 mb-10 leading-relaxed">Sign in to synchronize with ElectroMind's engineering intelligence.</p>

          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full glass-card hover:bg-white/10 flex items-center justify-center gap-4 py-5 group transition-all rounded-2xl border-white/5"
            >
              <Chrome className="w-6 h-6 group-hover:text-blue-400 transition-colors" />
              <span className="font-semibold tracking-wide">Continue with Google</span>
            </button>

            <div className="flex items-center gap-4 text-slate-700 my-8">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Protocol Overrides</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Operational Email" 
                className="w-full glass-input py-4 px-6 rounded-2xl bg-white/5 border-white/5 focus:border-blue-500/50 transition-all outline-none text-white placeholder:text-slate-600"
              />
              <input 
                type="password" 
                placeholder="Access Key" 
                className="w-full glass-input py-4 px-6 rounded-2xl bg-white/5 border-white/5 focus:border-blue-500/50 transition-all outline-none text-white placeholder:text-slate-600"
              />
              <button className="w-full premium-btn mt-6 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] transition-all">
                Initialize Login
              </button>
            </div>
          </div>

          <p className="mt-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
            New Entity? <span className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors underline-offset-4 hover:underline">Register Biometrics</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

