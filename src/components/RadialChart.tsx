import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface RadialChartProps {
  value: number;
  label: string;
  icon?: LucideIcon;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function RadialChart({
  value,
  label,
  icon: Icon,
  size = 80,
  strokeWidth = 6,
  color = 'stroke-blue-500',
  className,
  onClick,
  isActive
}: RadialChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-3 cursor-pointer transition-all duration-300", 
        isActive ? "scale-110" : "opacity-70 hover:opacity-100",
        className
      )}
      onClick={onClick}
    >
      <div 
        className="relative flex items-center justify-center group"
        style={{ width: size, height: size }}
      >
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isActive ? "bg-blue-500/10 blur-xl scale-125" : "bg-transparent"
        )} />
        <svg
          width={size}
          height={size}
          className="-rotate-90 transition-transform duration-500"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/5"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className={cn(color, "stroke-round drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon ? (
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          ) : (
            <span className="text-sm font-mono font-bold tracking-tighter">{value}%</span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        {Icon && <p className="text-xs font-mono font-bold mt-0.5 text-blue-400">{value}%</p>}
      </div>
    </div>
  );
}
