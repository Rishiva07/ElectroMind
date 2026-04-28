import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Cpu, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserHistory } from '../services/productService';
import { Recommendation } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCurrency } from '../contexts/CurrencyContext';
import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currency, locale } = useCurrency();
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUserHistory(user?.uid || 'guest-session')
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg mb-4"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">{user ? 'Personal Insights' : 'Global Insights'}</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Intelligence Archive.</h1>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{user ? 'Authenticated as' : 'Mode'}</p>
            <p className="text-sm font-medium text-slate-300">{user ? user.email : 'Guest Explorer'}</p>
          </div>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 glass-card animate-pulse border-white/5" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 glass-premium rounded-[3rem]"
          >
             <Cpu className="w-16 h-16 text-slate-800 mx-auto mb-6" />
             <h3 className="text-xl font-bold mb-2">The Archive is Empty</h3>
             <p className="text-slate-500 max-w-sm mx-auto">Start your first analysis to populate your intelligence metrics.</p>
             <button 
              onClick={() => navigate('/home')}
              className="mt-8 px-6 py-3 bg-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all"
             >
               Begin Exploration
             </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((rec, idx) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate('/result', { state: { recommendation: rec } })}
                className="glass-card glass-card-hover flex items-center justify-between p-6 border-white/5 cursor-pointer group"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-2 group-hover:bg-blue-500/10 group-hover:scale-105 transition-all">
                     <Cpu className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    {(() => {
                      const winner = rec.winnerId === 'A' ? rec.productA : (rec.productB || rec.productData);
                      if (!winner) return <h3 className="text-lg font-bold">Incomplete Recommendation</h3>;
                      return (
                        <>
                          <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{winner.name}</h3>
                          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">
                            <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                            <span className="text-blue-500">{rec.matchScore}% Expectation Match</span>
                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                            <span className="text-emerald-500">{formatCurrency(winner.price, locale, currency)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Lifespan</p>
                    <p className="text-sm font-mono text-slate-400">{(rec.winnerId === 'A' ? (rec.productA || rec.productData) : (rec.productB || rec.productData))?.estimatedLifespan || 0}Y</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
