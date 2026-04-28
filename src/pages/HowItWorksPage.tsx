import React from 'react';
import { motion } from 'motion/react';
import { Brain, Search, Activity, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function HowItWorksPage() {
  const steps = [
    { 
      title: "Data Ingestion", 
      desc: "Our engine ingest links from official sources, retailers, and high-tier engineering blogs.",
      icon: Search,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Conflict Resolution", 
      desc: "If sources disagree, our 'Weighted Consensus' engine prioritizes identity, integrity, and source trust tier.",
      icon: Brain,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    { 
      title: "Silicon Simulation", 
      desc: "We simulate thermal stress and electrical degradation over your intended usage period.",
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "Truth Calculation", 
      desc: "We output the True Cost of Ownership, accounting for maintenance, energy, and failure risks.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">The Methodology</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 underline decoration-emerald-500/30">Science over Sales.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We don't look at "features". We look at components. Capacitors, thermal interfaces, silicon bins, and chassis rigidity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {steps.map((step, i) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="absolute -top-12 -left-4 text-8xl font-black text-white/[0.03] select-none pointer-events-none">
                0{i + 1}
              </div>
              <div className="flex gap-6 items-start">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl", step.bg)}>
                  <step.icon className={cn("w-8 h-8", step.color)} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
