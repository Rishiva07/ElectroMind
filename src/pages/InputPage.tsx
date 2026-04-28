import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Battery, Cpu, Shield, Move, Sparkles, Loader2, Plus, X, Globe, Link as LinkIcon
} from 'lucide-react';
import { Category, UserInput } from '../types';
import { analyzeProductLife } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { saveRecommendation } from '../services/productService';
import Navbar from '../components/Navbar';

export default function InputPage() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, isLoading: isCurrencyLoading } = useCurrency();
  
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState<UserInput>({
    category: (category as Category) || 'Laptop',
    query: searchParams.get('q') || '',
    budget: 1500,
    currency: currency,
    expectedLifespan: 5,
    usageType: 'Office',
    dailyUsageHours: 8,
    productALinks: [''],
    productBLinks: [''],
    priorities: {
      battery: 50,
      performance: 70,
      durability: 80,
      portability: 40,
    }
  });

  const addLink = (product: 'A' | 'B') => {
    const key = product === 'A' ? 'productALinks' : 'productBLinks';
    setUserInput({ ...userInput, [key]: [...userInput[key], ''] });
  };

  const removeLink = (product: 'A' | 'B', index: number) => {
    const key = product === 'A' ? 'productALinks' : 'productBLinks';
    const newLinks = [...userInput[key]];
    newLinks.splice(index, 1);
    setUserInput({ ...userInput, [key]: newLinks });
  };

  const updateLink = (product: 'A' | 'B', index: number, value: string) => {
    const key = product === 'A' ? 'productALinks' : 'productBLinks';
    const newLinks = [...userInput[key]];
    newLinks[index] = value;
    setUserInput({ ...userInput, [key]: newLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setLoadingStep(0);
    const steps = [
      "Initializing Neural Synthesis Engine...",
      "Connecting to Global Engineering Databases...",
      "Analyzing Component Interdependencies...",
      "Simulating Thermal & Electrical Stress...",
      "Calculating Probability of Failure...",
      "Finalizing Intelligence Report..."
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      // Filter out empty links
      const finalInput: UserInput = {
        ...userInput,
        currency: currency, // Ensure latest detected currency is used
        productALinks: userInput.productALinks.filter(l => l.trim().length > 0),
        productBLinks: userInput.productBLinks.filter(l => l.trim().length > 0)
      };
      const result = await analyzeProductLife(finalInput);
      const saved = await saveRecommendation(
        user?.uid || 'guest-session', 
        finalInput, 
        result.productA, 
        result.productB, 
        result.winnerId, 
        result.matchScore,
        result.comparisonSummary
      );
      clearInterval(stepInterval);
      navigate('/result', { state: { recommendation: saved } });
    } catch (error) {
      clearInterval(stepInterval);
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Initializing Neural Synthesis Engine...",
    "Connecting to Global Engineering Databases...",
    "Analyzing Component Interdependencies...",
    "Simulating Thermal & Electrical Stress...",
    "Calculating Probability of Failure...",
    "Finalizing Intelligence Report..."
  ];

  const renderLinkInputs = (product: 'A' | 'B') => {
    const links = product === 'A' ? userInput.productALinks : userInput.productBLinks;
    const title = product === 'A' ? 'Product A' : 'Product B';
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl mb-4">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">{title} Intelligence Sources</h3>
           <button 
             type="button"
             onClick={() => addLink(product)}
             className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
           >
             <Plus className="w-3 h-3" /> Add Link
           </button>
        </div>
        
        <AnimatePresence>
          {links.map((link, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-2"
            >
              <div className="relative flex-1 group">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <input
                  type="url"
                  value={link}
                  placeholder="Paste URL (Amazon, Official, Review...)"
                  onChange={(e) => updateLink(product, idx, e.target.value)}
                  className="w-full glass-input pl-10 h-10 text-xs"
                />
              </div>
              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(product, idx)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-32">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden"
        >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Cpu className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
            <h1 className="text-4xl font-medium mb-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Sparkles className="w-10 h-10 text-blue-500" />
                ElectroMind Analytics
                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">v4.0.2</span>
              </div>
              
              <AnimatePresence>
                {isCurrencyLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Detecting Market...
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10"
                  >
                    <Globe className="w-3 h-3" />
                    Market: {currency}
                  </motion.div>
                )}
              </AnimatePresence>
            </h1>

          <form onSubmit={handleSubmit} className="space-y-12">
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-12">
               <div className="space-y-8">
                 <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                     <Globe className="w-3.5 h-3.5" /> Data Intelligence Ingestion
                   </label>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {renderLinkInputs('A')}
                     {renderLinkInputs('B')}
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium italic mt-4">
                     * ElectroMind weighs official specs higher than retailer or blog data. Duplicate info is automatically normalized.
                   </p>
                 </div>
               </div>

               <div className="space-y-8">
                 <div className="space-y-4">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Usage Context & Intent</label>
                   <textarea
                     value={userInput.query}
                     onChange={(e) => setUserInput({...userInput, query: e.target.value})}
                     placeholder="Example: I need a laptop for 4K video editing and heavy coding that stays cool under load for at least 6 years..."
                     className="w-full glass-input h-32 resize-none text-sm leading-relaxed p-6"
                     required
                   />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Budget ({currency})</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">{currency}</span>
                        <input
                          type="number"
                          value={isNaN(userInput.budget) ? '' : userInput.budget}
                          onChange={(e) => setUserInput({...userInput, budget: e.target.value === '' ? parseInt('') : parseInt(e.target.value)})}
                          className="w-full glass-input py-3 pl-14"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Tenure (Yrs)</label>
                      <input
                        type="number"
                        value={isNaN(userInput.expectedLifespan) ? '' : userInput.expectedLifespan}
                        onChange={(e) => setUserInput({...userInput, expectedLifespan: e.target.value === '' ? parseInt('') : parseInt(e.target.value)})}
                        className="w-full glass-input py-3"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Usage Tier</label>
                      <select
                        value={userInput.usageType}
                        onChange={(e) => setUserInput({...userInput, usageType: e.target.value as any})}
                        className="w-full glass-input py-3 text-sm"
                      >
                         <option value="Basic">Basic Home</option>
                         <option value="Office">Office Professional</option>
                         <option value="Heavy">Heavy Workstation</option>
                         <option value="Gaming">High-End Gaming</option>
                         <option value="Travel">Ultra Portable</option>
                      </select>
                    </div>
                 </div>
               </div>
            </section>

            <section className="space-y-10">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Hardware Engineering Priorities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                  { label: 'Battery Chemistry', icon: Battery, key: 'battery' },
                  { label: 'Silicon Architecture', icon: Cpu, key: 'performance' },
                  { label: 'Thermal Resilience', icon: Shield, key: 'durability' },
                  { label: 'Form Engineering', icon: Move, key: 'portability' },
                ].map((p) => (
                  <div key={p.key} className="space-y-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <p.icon className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">{p.label}</span>
                      </div>
                      <span className="text-sm text-blue-400 font-mono font-bold">{(userInput.priorities as any)[p.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isNaN((userInput.priorities as any)[p.key]) ? 0 : (userInput.priorities as any)[p.key]}
                      onChange={(e) => setUserInput({
                        ...userInput, 
                        priorities: { ...userInput.priorities, [p.key]: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-8 flex flex-col items-center gap-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full max-w-xl premium-btn text-xl py-6 flex items-center justify-center gap-4 relative overflow-hidden group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="font-medium tracking-tight">AI Multi-Source Engine Analysis...</span>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <Sparkles className="w-6 h-6 text-blue-400 group-hover:scale-125 transition-transform" />
                    <span className="font-medium tracking-tight">Engage High-Confidence Analysis</span>
                  </>
                )}
              </motion.button>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Neural Engine v4 Active</p>
            </div>
          </form>
        </div>
      </motion.div>
      </main>

      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-xl w-full"
            >
              <div className="glass-premium rounded-[3rem] p-12 text-center relative overflow-hidden border-blue-500/20">
                {/* Background Animation */}
                <motion.div 
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
                />

                <div className="relative z-10">
                  <div className="mb-10 relative inline-block">
                    <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-medium tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Neural Audit in Progress
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] font-bold">
                          <span className="text-blue-400">Synthesis Engine</span>
                          <span className="text-slate-500">{Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                          />
                       </div>
                    </div>

                    <div className="h-8 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={loadingStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-slate-400 text-sm font-medium tracking-tight"
                        >
                          {loadingSteps[loadingStep]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

