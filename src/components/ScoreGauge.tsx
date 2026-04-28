import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MainScoreGaugeProps {
  score: number;
  description: string;
}

export default function MainScoreGauge({ score, description }: MainScoreGaugeProps) {
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColorClass = (s: number) => {
    if (s >= 80) return 'stroke-emerald-500';
    if (s >= 60) return 'stroke-blue-500';
    if (s >= 40) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const colorClass = getColorClass(score);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Outer Glow Ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-3xl opacity-20 transition-opacity duration-1000 group-hover:opacity-40",
            score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'
          )} 
        />
        
        <svg
          width={size}
          height={size}
          className="-rotate-90 drop-shadow-2xl"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/5"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(colorClass, "transition-all duration-700")}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-5xl font-bold font-mono tracking-tighter"
          >
            {score}%
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1"
          >
            Match Score
          </motion.span>
        </div>
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-slate-400 text-sm font-medium tracking-tight bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md"
      >
        “{description}”
      </motion.p>
    </div>
  );
}
