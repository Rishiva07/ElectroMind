import React from 'react';
import { motion } from 'motion/react';
import { Users, Target, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">The Mission</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Built for Integrity.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ElectroMind was born from a frustration with "planned obsolescence" and disposable tech culture. We believe the most sustainable product is the one that doesn't need to be replaced.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10">
            <Target className="w-10 h-10 text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed">
              To empower consumers with engineering-grade data that cuts through marketing jargon and finds the true quality beneath the surface.
            </p>
          </div>
          <div className="glass-card p-10">
            <Users className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold mb-4">The Team</h3>
            <p className="text-slate-400 leading-relaxed">
              A collective of hardware engineers, silicon architects, and software developers dedicated to radical transparency in the tech industry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
