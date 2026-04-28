import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Laptop, Monitor, Tv, Refrigerator, Headphones, Search, Clock, Cpu,
  Sparkles, Zap, Shield, BarChart3, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Category } from '../types';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';

const CATEGORIES: { name: Category; icon: any; desc: string }[] = [
  { name: 'Mobile', icon: Smartphone, desc: 'High-cycle batteries' },
  { name: 'Laptop', icon: Laptop, desc: 'Thermal resilience' },
  { name: 'PC', icon: Cpu, desc: 'Component longevity' },
  { name: 'Monitor', icon: Monitor, desc: 'Panel endurance' },
  { name: 'TV', icon: Tv, desc: 'Backlight lifespan' },
  { name: 'Appliances', icon: Refrigerator, desc: 'Motor reliability' },
  { name: 'Audio', icon: Headphones, desc: 'Driver durability' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/analyze/Laptop?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <div className="mb-24 text-center relative px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-8 backdrop-blur-md"
          >
            <Logo size="sm" className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Neural Analysis Active</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
          >
            Engineering <br className="hidden md:block" /> Intelligence.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Beyond specifications. We analyze hardware integrity, predict lifespan, and reveal the true cost of technology.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch} 
            className="max-w-3xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Envision your device need (e.g., 'Workstation for 8K rendering')..."
              className="w-full glass-input pl-16 pr-8 py-7 text-xl focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
            />
            <button className="absolute top-1/2 right-4 -translate-y-1/2 p-3 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.form>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-24">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.05) }}
              onClick={() => navigate(`/analyze/${cat.name}`)}
              className="glass-card glass-card-hover flex flex-col items-center justify-center p-8 aspect-square cursor-pointer border-white/5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <cat.icon className="w-10 h-10 mb-6 text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
              <div className="text-center">
                <span className="text-sm font-bold tracking-tight block mb-1">{cat.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {cat.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass-premium p-12 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Zap className="w-48 h-48" />
              </div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-4xl font-bold mb-6">Component Degradation Simulation</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  We don't just compare specs. Our engine simulates thousands of power cycles and thermal loads to predict exactly when a capacitor might fail.
                </p>
                <button 
                  onClick={() => navigate('/how-it-works')}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Explore Methodology
                </button>
              </div>
           </div>

           <div className="glass-premium p-12 rounded-[3rem] flex flex-col justify-between group cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/vision')}>
              <BarChart3 className="w-12 h-12 text-blue-500 mb-12 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-3xl font-bold mb-4">Sustainability Matrix</h3>
                <p className="text-slate-500 leading-relaxed">
                  Reduce your electronic footprint by choosing devices with high repairability and tenure scores.
                </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
