import React from 'react';
import { motion } from 'motion/react';
import { Eye, Leaf, Cpu, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-indigo-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Future Intelligence</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Sustainable Silicon.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Our vision is a world where every purchasing decision contributes to a circular economy, reducing e-waste through radical longevity.
          </p>
        </motion.div>

        <div className="space-y-8">
          {[
            { icon: Leaf, title: 'Zero Waste Tech', desc: 'Predicting failures before they happen to enable preventive maintenance and repair over replacement.' },
            { icon: Cpu, title: 'Component Transparency', desc: 'Working towards a standard where every transistor quality is documented and searchable.' },
            { icon: Globe, title: 'Global Impact', desc: 'Saving families billions in "hidden costs" and stopping millions of tons of tech from reaching landfills.' }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex gap-8 items-center p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <item.icon className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
