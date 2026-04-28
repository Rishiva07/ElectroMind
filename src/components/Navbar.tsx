import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Compass, Brain, Users, Eye, 
  BarChart3, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Explore', icon: Compass, path: '/home', description: 'Browse technology categories' },
    { label: 'How It Works', icon: Brain, path: '/how-it-works', description: 'Our engineering analysis process' },
    { label: 'Our Vision', icon: Eye, path: '/vision', description: 'The future of sustainable tech' },
    { label: 'About Us', icon: Users, path: '/about', description: 'Meet the mind behind the machine' },
    { label: 'Insights', icon: BarChart3, path: '/history', description: 'Your analysis dashboard' },
    { label: 'Settings', icon: Settings, path: '#', description: 'System preferences' },
  ];

  const handleNavigate = (path: string) => {
    if (path === '#') return;
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        {/* Logo/Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-4 transition-transform hover:scale-105 active:scale-95 group"
          >
            <Logo size="md" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xl font-bold tracking-tighter text-white">Electro<span className="text-blue-500">Mind</span></span>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-0.5">Connect3</span>
            </div>
          </button>
        </motion.div>

        {/* Desktop Mini-Nav or User */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto flex items-center gap-4"
        >
          <button 
            onClick={() => navigate('/how-it-works')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-xl group"
            title="Learn about our neural engineering analysis process"
          >
            <Brain className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">How It Works</span>
          </button>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-xl"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[45] pointer-events-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Menu Panel */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 p-8 pt-24 shadow-2xl flex flex-col"
            >
              <div className="space-y-2 flex-grow">
                {menuItems.map((item, idx) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full text-left p-4 rounded-2xl flex items-center gap-5 hover:bg-white/5 group transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                      <item.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                {user ? (
                  <button 
                    onClick={() => logout()}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold uppercase tracking-widest text-[10px]">Terminate Session</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/auth')}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all group"
                  >
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold uppercase tracking-widest text-[10px]">Initiate Session</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
