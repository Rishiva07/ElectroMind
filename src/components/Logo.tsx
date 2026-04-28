import React from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-48 h-48'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 48,
    xl: 96
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      {/* Premium Outer Glows */}
      <motion.div 
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-blue-500 rounded-full blur-[40px] opacity-20"
      />
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute inset-0 bg-emerald-500 rounded-full blur-[30px] opacity-10"
      />
      
      {/* Glassmorphic Shell */}
      <div className="relative w-full h-full bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[30%] flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,194,255,0.1)]">
        
        {/* Dynamic Circuit Background */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00FF9C" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          <motion.path 
            d="M50 10 V30 L70 50 H90" 
            fill="none" 
            stroke="url(#circuit-grad)" 
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path 
            d="M10 50 H30 L50 70 V90" 
            fill="none" 
            stroke="url(#circuit-grad)" 
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          />
          
          {/* Connection Nodes (Connect3 Triangular Structure) */}
          <circle cx="50" cy="20" r="1.5" className="fill-blue-400 shadow-[0_0_8px_#00C2FF]" />
          <circle cx="20" cy="70" r="1.5" className="fill-emerald-400 shadow-[0_0_8px_#00FF9C]" />
          <circle cx="80" cy="70" r="1.5" className="fill-blue-400 shadow-[0_0_8px_#00C2FF]" />
        </svg>

        {/* Brain Intel Core */}
        <div className="relative group">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Brain 
              size={iconSizes[size]} 
              className="text-blue-400 filter drop-shadow-[0_0_15px_rgba(0,194,255,0.8)]"
              strokeWidth={1.5}
            />
            
            {/* Thinking Pulse */}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
            />
          </motion.div>

          {/* Connect3 Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
               {/* Subtle lines connecting back to nodes */}
               <motion.path 
                 d="M50 50 L50 20 M50 50 L20 70 M50 50 L80 70" 
                 stroke="white" 
                 strokeWidth="0.5" 
                 strokeOpacity="0.1" 
                 fill="none" 
               />
            </svg>
          </div>
        </div>

        {/* Futuristic Accents */}
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_10px_#00C2FF]" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_10px_#00FF9C]" />
        <div className="absolute left-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute right-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
      </div>
      
      {size === 'xl' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-24 flex flex-col items-center whitespace-nowrap"
        >
          <span className="text-5xl md:text-6xl font-medium tracking-[-0.05em] text-white">Electro<span className="text-blue-400">Mind</span></span>
          <span className="text-xs font-bold uppercase tracking-[0.8em] text-slate-500 mt-2 mr-[-0.8em]">Connect3</span>
        </motion.div>
      )}
    </div>
  );
}

