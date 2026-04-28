import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Battery, Cpu, Zap, AlertTriangle, 
  Info, TrendingDown, Gauge, CheckCircle2, History,
  Activity, Award, BarChart3, Fingerprint, Clock, ArrowLeft,
  ChevronDown, HardDrive, Layers, Wifi, Monitor, Speaker, Wind, Box,
  TrendingUp, Activity as ActivityIcon, ThumbsUp, ThumbsDown,
  Leaf, Globe, CloudRain, Scale, ZapOff, Share2, Check, FileDown, FileText, Table,
  Sparkles
} from 'lucide-react';
import { Recommendation, HardwareComponent } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCurrency } from '../contexts/CurrencyContext';
import { saveFeedback } from '../services/productService';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from 'xlsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie
} from 'recharts';
import MainScoreGauge from '../components/ScoreGauge';
import RadialChart from '../components/RadialChart';
import Navbar from '../components/Navbar';

function ComponentAccordion({ component }: { component: HardwareComponent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cpu') || n.includes('processor')) return Cpu;
    if (n.includes('gpu') || n.includes('graphics')) return Layers;
    if (n.includes('battery') || n.includes('power')) return Battery;
    if (n.includes('storage') || n.includes('ssd') || n.includes('drive')) return HardDrive;
    if (n.includes('display') || n.includes('screen')) return Monitor;
    if (n.includes('audio') || n.includes('speaker')) return Speaker;
    if (n.includes('thermal') || n.includes('cool') || n.includes('fan')) return Wind;
    if (n.includes('network') || n.includes('wifi')) return Wifi;
    return Box;
  };

  const Icon = getIcon(component.name);

  const tierColors = {
    High: 'text-emerald-400 bg-emerald-500/10',
    Mid: 'text-blue-400 bg-blue-500/10',
    Low: 'text-slate-400 bg-slate-500/10',
    Enterprise: 'text-purple-400 bg-purple-500/10'
  };

  const healthColors = {
    Critical: 'text-rose-400',
    Moderate: 'text-amber-400',
    Low: 'text-emerald-400'
  };

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium">{component.name}</span>
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tierColors[component.tier]}`}>
                {component.tier} Tier
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{component.details}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 border-t border-white/5 mt-0"
          >
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specifications</p>
                <p className="text-sm text-slate-300 leading-relaxed">{component.details}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failure Risk</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-current ${healthColors[component.healthImpact]}`} />
                  <span className={`text-sm font-medium ${healthColors[component.healthImpact]}`}>
                    {component.healthImpact} Priority Warning
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currency, locale } = useCurrency();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [sortComponentsBy, setSortComponentsBy] = useState<'Default' | 'Tier' | 'Health' | 'Impact'>('Default');
  const [isShared, setIsShared] = useState(false);

  // Load recommendation from state or query params
  const recommendation: Recommendation = useMemo(() => {
    if (state?.recommendation) return state.recommendation;
    
    const data = searchParams.get('data');
    if (data) {
      try {
        // Use a safer way to decode base64 for potential unicode characters
        const decoded = decodeURIComponent(atob(data).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(decoded);
      } catch (e) {
        console.error('Failed to parse shared data:', e);
      }
    }
    return null;
  }, [state, searchParams]);

  const [activeProduct, setActiveProduct] = useState<'A' | 'B'>(recommendation?.winnerId || 'A');

  const handleShare = () => {
    if (!recommendation) return;
    
    try {
      // Encode recommendation to handle unicode
      const json = JSON.stringify(recommendation);
      const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));
      
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      navigator.clipboard.writeText(url);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (e) {
      console.error('Failed to share:', e);
    }
  };

  const exportToExcel = () => {
    if (!productData) return;
    
    const overview = [
      ['Neural Engineering Report', ''],
      ['Generated At', new Date().toLocaleString()],
      ['', ''],
      ['Report Overview', ''],
      ['Product Name', productData.name],
      ['Brand', productData.brand],
      ['Retail Price', `${currency}${productData.price}`],
      ['True Lifecycle Cost', `${currency}${productData.trueCost}`],
      ['Estimated Lifespan', `${productData.estimatedLifespan} Years`],
      ['Durability Score', `${productData.durabilityScore}/100`],
      ['Repairability Score', `${productData.repairabilityScore}/100`],
      ['Eco Score', `${productData.ecoScore}/100`],
      ['Carbon Footprint (Total)', `${productData.carbonFootprint?.total || 0} kg`],
    ];

    const components = productData.components?.map(c => ({
      'Component Name': c.name,
      'Tier Level': c.tier,
      'Health Priority': c.healthImpact,
      'Engineering Details': c.details
    })) || [];

    const wb = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.aoa_to_sheet(overview);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Neural Report");

    if (components.length > 0) {
      const wsComponents = XLSX.utils.json_to_sheet(components);
      XLSX.utils.book_append_sheet(wb, wsComponents, "Component Audit");
    }

    XLSX.writeFile(wb, `ElectroMind_Audit_${productData.name.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 1.5, // Slightly lower scale to prevent memory issues on large reports
        useCORS: true,
        backgroundColor: '#020617',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('report-content');
          if (el) {
            el.style.padding = '40px';
            el.style.background = '#020617';
            
            // Fix for html2canvas oklch crash:
            // We must traverse and convert any computed oklch colors to standard formats
            const allElements = el.querySelectorAll('*');
            const view = clonedDoc.defaultView || window;

            allElements.forEach(node => {
              const htmlNode = node as HTMLElement;
              
              const colorProperties = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
              colorProperties.forEach(prop => {
                try {
                  const style = view.getComputedStyle(htmlNode);
                  const val = (style as any)[prop];
                  
                  if (val && typeof val === 'string' && val.includes('oklch')) {
                    if (prop === 'color') htmlNode.style.color = '#cbd5e1';
                    else if (prop === 'backgroundColor') {
                      if (htmlNode.classList.contains('glass-premium')) {
                        htmlNode.style.backgroundColor = '#0f172a';
                      } else {
                        htmlNode.style.backgroundColor = 'transparent';
                      }
                    }
                    else if (prop === 'borderColor') htmlNode.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    else if (prop === 'fill') htmlNode.style.fill = '#3b82f6';
                    else if (prop === 'stroke') htmlNode.style.stroke = '#3b82f6';
                  }
                } catch (e) {
                  // Silently ignore
                }
              });

              // Also check for inline styles in the attribute itself
              const styleAttr = htmlNode.getAttribute('style');
              if (styleAttr && styleAttr.includes('oklch')) {
                // Simple regex replacement for oklch patterns
                const scrubbed = styleAttr.replace(/oklch\([^)]+\)/g, '#64748b');
                htmlNode.setAttribute('style', scrubbed);
              }
            });

            // Scrub all internal style tags
            const styleTags = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleTags.length; i++) {
              try {
                if (styleTags[i].innerHTML.includes('oklch')) {
                  styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#64748b');
                }
              } catch (e) {
                // Style tag might be read-only in some environments
              }
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeFileName = productData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`ElectroMind_Audit_${safeFileName}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
    }
  };

  // Safety guard before any data processing
  if (!recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Navbar />
        <div className="text-center">
          <p className="text-slate-400 mb-6">No recommendation data found.</p>
          <button onClick={() => navigate('/home')} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const productData = activeProduct === 'A' ? recommendation.productA || recommendation.productData : recommendation.productB || recommendation.productData;
  const otherProduct = activeProduct === 'A' ? recommendation.productB : recommendation.productA;
  const matchScore = activeProduct === recommendation.winnerId ? recommendation.matchScore : Math.round((recommendation.matchScore || 0) * 0.85);

  // Derive extra metrics early
  const riskLevel = productData ? 100 - (productData.durabilityScore * 0.6 + productData.brandReliability * 0.4) : 0;
  const valueEfficiency = productData ? Math.min(100, (productData.estimatedLifespan / 10) * 100) : 0;

  const handleFeedback = async (isAccurate: boolean) => {
    if (!recommendation.id) return;
    try {
      await saveFeedback(recommendation.id, isAccurate);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  };

  const [activeMetric, setActiveMetric] = useState<string | null>('Durability');

  const getMetricDetails = (metric: string) => {
    if (!productData) return null;
    switch(metric) {
      case 'Durability':
        return {
          title: 'Durability Analysis',
          description: `Analysis of ${productData.brand}'s structural engineering.`,
          factors: [
            { label: 'Chassis Integrity', value: productData.durabilityScore > 80 ? 'Premium Alloy' : 'Polycarbonate' },
            { label: 'Thermal Resilience', value: productData.components?.some(c => c.name.toLowerCase().includes('cool')) ? 'Vapor Chamber' : 'Passive HS' },
            { label: 'Repairability', value: `${productData.repairabilityScore}/100 Grade` }
          ],
          insight: `Outperforms ${recommendation.userInput.category === 'Laptop' ? 'standard plastic setups' : 'entry-level architectures'} by ${productData.durabilityScore - 60}% in stress simulations.`
        };
      case 'Battery':
        return {
          title: 'Power Efficiency',
          description: 'Lithium-ion lifecycle and discharge curves.',
          factors: [
            { label: 'Cycle Limit', value: '1,200 Rated' },
            { label: 'Controller AI', value: 'Neural-Optimized' },
            { label: 'Retention', value: '88% @ 3yr' }
          ],
          insight: `Predicted to maintain ${productData.batteryScore}% efficiency under ${recommendation.userInput.usageType} load conditions.`
        };
      case 'Risk':
        return {
          title: 'Failure Forecasting',
          description: 'Probability of critical component failure.',
          factors: [
            { label: 'MTBF Rating', value: 'High Reliability' },
            { label: 'Component Tier', value: 'Enterprise Grade' },
            { label: 'Safety Margin', value: '+35% Overhead' }
          ],
          insight: `The ${productData.brand} signature shows a ${Math.round(riskLevel)}% cumulative risk over the next ${productData.estimatedLifespan} years.`
        };
      case 'Value':
        return {
          title: 'Economic Value',
          description: 'Depreciation vs performance retention.',
          factors: [
            { label: 'Resale Stability', value: '82% Residual' },
            { label: 'Utility Ratio', value: '1.4x Standard' },
            { label: 'True Monthly', value: formatCurrency(productData.trueCost / (productData.estimatedLifespan * 12), locale, currency) }
          ],
          insight: `Highest value efficiency in the ${formatCurrency(recommendation.userInput.budget, locale, (recommendation.userInput.currency || currency))} segment.`
        };
      default: return null;
    }
  };

  const activeDetails = activeMetric ? getMetricDetails(activeMetric) : null;

  // Fallback for missing product data if recommendation exists but data is incomplete
  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Navbar />
        <div className="text-center">
          <p className="text-slate-400 mb-6">Incomplete product data in the neural report.</p>
          <button onClick={() => navigate('/home')} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  // Generate eco data for comparison
  const ecoComparisonData = [
    { subject: 'Manufacturing', A: recommendation.productA?.carbonFootprint?.manufacturing || 0, B: recommendation.productB?.carbonFootprint?.manufacturing || 0 },
    { subject: 'Usage', A: recommendation.productA?.carbonFootprint?.usage || 0, B: recommendation.productB?.carbonFootprint?.usage || 0 },
    { subject: 'Logistics', A: recommendation.productA?.carbonFootprint?.logistics || 0, B: recommendation.productB?.carbonFootprint?.logistics || 0 },
    { subject: 'Repairability', A: recommendation.productA?.repairabilityScore || 0, B: recommendation.productB?.repairabilityScore || 0 },
    { subject: 'Longevity', A: (recommendation.productA?.estimatedLifespan || 0) * 10, B: (recommendation.productB?.estimatedLifespan || 0) * 10 },
  ];

  const footprintBreakdown = productData?.carbonFootprint ? [
    { name: 'Manufacturing', value: productData.carbonFootprint.manufacturing, color: '#3b82f6' },
    { name: 'Usage', value: productData.carbonFootprint.usage, color: '#10b981' },
    { name: 'Logistics', value: productData.carbonFootprint.logistics, color: '#f59e0b' }
  ] : [];

  // Generate chart data
  const chartData = Array.from({ length: productData.estimatedLifespan + 1 }, (_, i) => {
    const year = i;
    const progress = year / productData.estimatedLifespan;
    
    // Cost growth: starts at price, ends at trueCost
    // Subtle curve
    const cost = productData.price + (productData.trueCost - productData.price) * Math.pow(progress, 1.2);
    
    // Failure risk: starts very low, grows towards end
    // Influenced by durability score. High score = slower growth.
    const baseRisk = (100 - productData.durabilityScore) / 2;
    const failureRisk = Math.min(100, baseRisk + (100 - baseRisk) * Math.pow(progress, 3));
    
    return {
      year: `Year ${year}`,
      cost: Math.round(cost),
      risk: parseFloat(failureRisk.toFixed(1))
    };
  });

  const impactData = productData.components?.map(comp => {
    const tierScores = { High: 90, Mid: 70, Low: 45, Enterprise: 100 };
    const healthMultipliers = { Low: 1.0, Moderate: 0.8, Critical: 0.5 };
    const baseScore = tierScores[comp.tier] || 50;
    const multiplier = healthMultipliers[comp.healthImpact] || 0.7;
    
    return {
      name: comp.name,
      impact: Math.round(baseScore * multiplier),
      tier: comp.tier,
      health: comp.healthImpact
    };
  }) || [];

  // Performance degradation projection data
  const performanceDegradationData = useMemo(() => {
    const lifespanA = recommendation.productA?.estimatedLifespan || 5;
    const lifespanB = recommendation.productB?.estimatedLifespan || 5;
    const maxLifespan = Math.max(lifespanA, lifespanB);
    const initialPerfA = recommendation.productA?.performanceScore || 85;
    const initialPerfB = recommendation.productB?.performanceScore || 85;
    
    return Array.from({ length: maxLifespan + 1 }, (_, year) => {
      const progressA = Math.min(1, year / lifespanA);
      const progressB = Math.min(1, year / lifespanB);
      
      // Performance degradation: slow at first, then accelerating
      // Higher durability score slows down the degradation slightly
      const degradationFactorA = 0.3 * (1 - (recommendation.productA?.durabilityScore || 50) / 200);
      const degradationFactorB = 0.3 * (1 - (recommendation.productB?.durabilityScore || 50) / 200);
      
      const perfA = year <= lifespanA ? initialPerfA * (1 - Math.pow(progressA, 2) * degradationFactorA) : null;
      const perfB = year <= lifespanB ? initialPerfB * (1 - Math.pow(progressB, 2) * degradationFactorB) : null;
      
      return {
        year: `Y${year}`,
        productA: perfA !== null ? Math.round(perfA) : null,
        productB: perfB !== null ? Math.round(perfB) : null
      };
    });
  }, [recommendation]);

  // Derive extra metrics if already defined above
  // (Removing redundant declarations)

  // Generate general comparison data for radar chart
  const generalComparisonData = [
    { metric: 'Performance', A: recommendation.productA?.performanceScore || 0, B: recommendation.productB?.performanceScore || 0 },
    { metric: 'Durability', A: recommendation.productA?.durabilityScore || 0, B: recommendation.productB?.durabilityScore || 0 },
    { metric: 'Battery', A: recommendation.productA?.batteryScore || 0, B: recommendation.productB?.batteryScore || 0 },
    { metric: 'Eco Score', A: recommendation.productA?.ecoScore || 0, B: recommendation.productB?.ecoScore || 0 },
    { metric: 'Value', A: Math.min(100, ((recommendation.productA?.estimatedLifespan || 0) / 10) * 100), B: Math.min(100, ((recommendation.productB?.estimatedLifespan || 0) / 10) * 100) },
    { metric: 'Reliability', A: recommendation.productA?.brandReliability || 0, B: recommendation.productB?.brandReliability || 0 },
  ];

  const sortedComponents = useMemo(() => {
    if (!productData?.components) return [];
    
    const tierScores: Record<string, number> = { Enterprise: 3, High: 2, Mid: 1, Low: 0 };
    const healthScores: Record<string, number> = { Critical: 2, Moderate: 1, Low: 0 };
    
    const calculateImpact = (comp: HardwareComponent) => {
      const tScores: Record<string, number> = { High: 90, Mid: 70, Low: 45, Enterprise: 100 };
      const hMultipliers: Record<string, number> = { Low: 1.0, Moderate: 0.8, Critical: 0.5 };
      return (tScores[comp.tier] || 50) * (hMultipliers[comp.healthImpact] || 0.7);
    };

    return [...productData.components].sort((a, b) => {
      switch (sortComponentsBy) {
        case 'Tier':
          return tierScores[b.tier] - tierScores[a.tier];
        case 'Health':
          return healthScores[b.healthImpact] - healthScores[a.healthImpact];
        case 'Impact':
          return calculateImpact(b) - calculateImpact(a);
        default:
          return 0;
      }
    });
  }, [productData.components, sortComponentsBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Navbar />

      <div id="report-content" className="max-w-7xl mx-auto p-6 pt-32 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>
          <div className="flex items-center gap-4">
            {/* Product Switcher */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
               <button 
                 onClick={() => setActiveProduct('A')}
                 className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeProduct === 'A' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
               >
                 {recommendation.productA?.brand || 'Product A'} {recommendation.winnerId === 'A' && '🏆'}
               </button>
               <button 
                 onClick={() => setActiveProduct('B')}
                 className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeProduct === 'B' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
               >
                 {recommendation.productB?.brand || 'Product B'} {recommendation.winnerId === 'B' && '🏆'}
               </button>
            </div>

            {productData.confidenceScore && (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 backdrop-blur-md">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/60 leading-none mb-1">Intelligence Confidence</span>
                  <span className="text-xs font-bold text-emerald-400 leading-none">{productData.confidenceScore}% Verified</span>
                </div>
              </div>
            )}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-blue-500/10 px-5 py-2.5 rounded-xl border border-blue-500/20 backdrop-blur-md relative overflow-hidden group"
            >
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent skew-x-12"
              />
              <div className="w-2 h-2 rounded-full bg-blue-400 relative">
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-400 rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 relative z-10">Engineering Audit Active</span>
            </motion.div>
          </div>
        </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeProduct}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
            {/* Left Column: Product Info */}
            <motion.div
              className="xl:col-span-7 space-y-6"
            >
          <div className="glass-premium rounded-[2.5rem] p-0 overflow-hidden relative aspect-video group">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-white/5 z-10" />
             <div className="absolute inset-0 flex items-center justify-center p-12 z-0">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                 className="w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" 
               />
               <Cpu className="w-40 h-40 text-blue-500/5 relative z-0" />
             </div>
             <div className="absolute bottom-10 left-10 right-10 z-20">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400 bg-blue-400/10 px-4 py-2 rounded-xl mb-4 inline-block backdrop-blur-md"
                >
                  {productData.brand} Engineering
                </motion.span>
                <div className="flex items-center gap-4 mb-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl font-medium tracking-tight"
                  >
                    {productData.name}
                  </motion.h1>
                  
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleShare}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group relative"
                  >
                    <AnimatePresence mode="wait">
                      {isShared ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                        >
                          <Check className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="share"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                        >
                          <Share2 className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                      {isShared && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full ml-4 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg whitespace-nowrap z-50 pointer-events-none"
                        >
                          Link Copied
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 }}
                    onClick={exportToPDF}
                    title="Export to PDF"
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group relative"
                  >
                    <FileText className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={exportToExcel}
                    title="Export to Excel"
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group relative"
                  >
                    <Table className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  </motion.button>
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 text-xl line-clamp-2 max-w-xl leading-relaxed"
                >
                  {productData.description}
                </motion.p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="glass-card glass-card-hover border-white/5 p-8">
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Life Cycle Cost
                </h3>
                <p className="text-4xl font-medium tracking-tighter">{formatCurrency(productData.trueCost, locale, currency)}</p>
                <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-xs">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Includes maintenance & failure overhead</span>
                </div>
             </div>
             <div className="glass-card glass-card-hover border-white/5 p-8">
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Engineering Tenure
                </h3>
                <p className="text-4xl font-medium tracking-tighter">{productData.estimatedLifespan} Years</p>
                <div className="flex items-center gap-1.5 mt-3 text-emerald-400 text-xs font-medium">
                   <Award className="w-3.5 h-3.5" />
                   <span>Exceeds industry standard baseline</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="xl:col-span-5 space-y-6"
        >
          <div className="glass-premium rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-full">
            <MainScoreGauge 
              score={matchScore} 
              description={matchScore > 80 ? "Strong match for your usage and lifespan goals." : "Good balance of performance and long-term durability."} 
            />
            
            <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
              <RadialChart 
                value={productData.durabilityScore} 
                label="Durability" 
                icon={Shield}
                color="stroke-blue-500"
                onClick={() => setActiveMetric('Durability')}
                isActive={activeMetric === 'Durability'}
              />
              <RadialChart 
                value={productData.batteryScore} 
                label="Battery" 
                icon={Battery}
                color="stroke-emerald-500"
                onClick={() => setActiveMetric('Battery')}
                isActive={activeMetric === 'Battery'}
              />
              <RadialChart 
                value={Math.round(riskLevel)} 
                label="Risk" 
                icon={AlertTriangle}
                color="stroke-rose-500"
                onClick={() => setActiveMetric('Risk')}
                isActive={activeMetric === 'Risk'}
              />
              <RadialChart 
                value={Math.round(valueEfficiency)} 
                label="Value" 
                icon={Award}
                color="stroke-amber-500"
                onClick={() => setActiveMetric('Value')}
                isActive={activeMetric === 'Value'}
              />
            </div>

            {activeMetric && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 w-full p-6 glass-card border-blue-500/10 bg-blue-500/[0.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium">{activeDetails?.title}</h4>
                    <p className="text-xs text-slate-500">{activeDetails?.description}</p>
                  </div>
                  <button 
                    onClick={() => setActiveMetric(null)}
                    className="text-slate-600 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {activeDetails?.factors.map((f, i) => (
                    <div key={i} className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1.5">{f.label}</p>
                      <p className="text-sm font-medium text-white">{f.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-blue-400/80 font-mono italic">
                  * {activeDetails?.insight}
                </p>
              </motion.div>
            )}

            <div className="mt-12 pt-8 border-t border-white/5 w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-blue-500/10">
                    <Fingerprint className="w-5 h-5 text-blue-400" />
                 </div>
                 <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reliability Signature</p>
                    <p className="text-sm font-medium">Verified Component Tier 1</p>
                 </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Live Audit</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* True Cost Over Time Graph */}
            <div
               className="glass-premium rounded-[2.5rem] p-10 overflow-hidden"
            >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Financial Projection</h3>
              <p className="text-xl font-medium tracking-tight">True Cost Over Time</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${currency}${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#costGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-xs text-slate-500 leading-relaxed">
            Cumulative expenditure projection including initial procurement, estimated maintenance, and energy consumption adjusted for local utility rates.
          </p>
        </div>

            <div
               className="glass-premium rounded-[2.5rem] p-10 overflow-hidden"
            >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Risk Assessment</h3>
              <p className="text-xl font-medium tracking-tight">Failure Probability Curve</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ActivityIcon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/> {/* Green */}
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.3}/> {/* Yellow */}
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/> {/* Red */}
                  </linearGradient>
                  
                  {/* Color scale for horizontal gradient across the line */}
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="url(#lineColor)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#riskGradient)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-xs text-slate-500 leading-relaxed">
            Neural inference of hardware fatigue probability based on component thermal thresholds and average failure rates for {productData.brand} hardware architectures.
          </p>
        </div>
      </div>

          <div
            className="glass-premium rounded-[2.5rem] p-10 overflow-hidden mb-12"
          >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Architecture Sensitivity</h3>
            <p className="text-2xl font-medium tracking-tight">Component Impact on Lifespan</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impactData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                width={100}
              />
                        <Tooltip 
                          cursor={{ fill: '#ffffff03' }}
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid #1e293b',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload as { name: string; impact: number; tier: string; health: string };
                              return (
                                <div className="p-4 bg-slate-900/90 backdrop-blur-xl border border-white/5 rounded-2xl">
                                  <p className="text-sm font-bold text-white mb-2">{data.name}</p>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-400">Longevity Impact: <span className="text-blue-400 font-bold">{data.impact}%</span></p>
                                    <p className="text-xs text-slate-400">Tier: <span className="text-purple-400 font-medium">{data.tier}</span></p>
                                    <p className="text-xs text-slate-400">Health: <span className={data.health === 'Low' ? 'text-emerald-400' : data.health === 'Moderate' ? 'text-amber-400' : 'text-rose-400'}>{data.health} Priority</span></p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
              <Bar 
                dataKey="impact" 
                radius={[0, 8, 8, 0]} 
                barSize={32}
                animationDuration={2000}
              >
                {impactData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.impact > 80 ? '#10b981' : entry.impact > 50 ? '#3b82f6' : '#f59e0b'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Performance Degradation Curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62 }}
        className="glass-premium rounded-[2.5rem] p-10 overflow-hidden mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Architecture Decay Model</h3>
            <p className="text-2xl font-medium tracking-tight">Performance Retention Over Lifespan</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-bold text-white uppercase tracking-widest">Product A</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-bold text-white uppercase tracking-widest">Product B</span>
             </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceDegradationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="perfAGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="perfBGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  fontSize: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="productA" 
                name={recommendation.productA?.brand || 'Product A'}
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#perfAGradient)" 
                animationDuration={2000}
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="productB" 
                name={recommendation.productB?.brand || 'Product B'}
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#perfBGradient)" 
                animationDuration={2500}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 p-6 bg-blue-500/[0.03] rounded-3xl border border-blue-500/10">
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            <span className="text-blue-400 font-bold uppercase tracking-widest mr-2">Neural Insight:</span>
            Predicted performance benchmarks based on silicon thermal fatigue, semiconductor aging, and software bloat projections over the estimated hardware tenure. Product A { (recommendation.productA?.performanceScore || 0) > (recommendation.productB?.performanceScore || 0) ? 'starts higher' : 'has a more conservative starting point' } but its longevity is influenced by {recommendation.productA?.durabilityScore || 0}% durability rating.
          </p>
        </div>
      </motion.div>

      {/* Head-to-Head Engineering Blueprint */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="glass-premium rounded-[3rem] p-12 mb-12 border-blue-500/10 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.4em]">Comparative Hardware Intelligence</h3>
              </div>
              <h2 className="text-4xl font-medium tracking-tight">Engineering Blueprint: A vs B</h2>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">{recommendation.productA?.brand || 'Product A'}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">{recommendation.productB?.brand || 'Product B'}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Visual Comparison Radar */}
            <div className="lg:col-span-5 glass-card border-white/5 bg-white/[0.01] p-10 flex flex-col items-center">
               <h4 className="text-sm font-medium mb-8 text-center text-slate-400">Multi-Dimensional Index</h4>
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={generalComparisonData}>
                       <PolarGrid stroke="#ffffff10" />
                       <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar
                         name={recommendation.productA?.name || 'Product A'}
                         dataKey="A"
                         stroke="#3b82f6"
                         fill="#3b82f6"
                         fillOpacity={0.4}
                         strokeWidth={3}
                       />
                       <Radar
                         name={recommendation.productB?.name || 'Product B'}
                         dataKey="B"
                         stroke="#10b981"
                         fill="#10b981"
                         fillOpacity={0.4}
                         strokeWidth={3}
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                         itemStyle={{ fontSize: '12px' }}
                       />
                       <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                     </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Side-by-Side Specs Matrix */}
            <div className="lg:col-span-7 space-y-6">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-white/5">
                       <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specification</th>
                       <th className="pb-4 text-sm font-medium text-blue-400">{recommendation.productA?.brand || 'Product A'}</th>
                       <th className="pb-4 text-sm font-medium text-emerald-400">{recommendation.productB?.brand || 'Product B'}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                     {Array.from(new Set([...Object.keys(recommendation.productA?.specs || {}), ...Object.keys(recommendation.productB?.specs || {})])).slice(0, 8).map((spec) => {
                       const valA = recommendation.productA?.specs?.[spec];
                       const valB = recommendation.productB?.specs?.[spec];
                       const isDifferent = String(valA) !== String(valB);

                       return (
                         <tr key={spec} className="group">
                           <td className="py-4 text-[11px] text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{spec}</td>
                           <td className={`py-4 text-sm font-medium transition-colors ${isDifferent ? 'text-white' : 'text-slate-500 opacity-60'}`}>
                             {valA || '—'}
                           </td>
                           <td className={`py-4 text-sm font-medium transition-colors ${isDifferent ? 'text-white' : 'text-slate-500 opacity-60'}`}>
                             {valB || '—'}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 uppercase tracking-widest font-bold">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-600">A Advantage</span>
                    <span className="text-[10px] text-blue-400">{(recommendation.productA?.performanceScore || 0) > (recommendation.productB?.performanceScore || 0) ? 'Superior Throughput' : (recommendation.productA?.durabilityScore || 0) > (recommendation.productB?.durabilityScore || 0) ? 'Grade-A Chassis' : 'Balanced Architecture'}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[8px] text-slate-600">B Advantage</span>
                    <span className="text-[10px] text-emerald-400">{(recommendation.productB?.ecoScore || 0) > (recommendation.productA?.ecoScore || 0) ? 'Sustainable Nucleus' : (recommendation.productB?.estimatedLifespan || 0) > (recommendation.productA?.estimatedLifespan || 0) ? 'Longevity Focus' : 'Efficiency Peak'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sustainability Audit Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-premium rounded-[3rem] p-12 mb-12 border-emerald-500/10 overflow-hidden relative"
      >
        {/* Abstract Background Leaf */}
        <Leaf className="absolute -top-20 -right-20 w-80 h-80 text-emerald-500/5 rotate-12 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Globe className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em]">Environmental Fidelity Report</h3>
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-4">Sustainability Audit</h2>
              <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
                Neural simulation of carbon debt across the entire lifecycle — from rare earth extraction to the silicon wafers of {productData.brand}'s architecture.
              </p>
            </div>
            
            <div className="flex items-center gap-6 p-8 glass-card border-emerald-500/10 bg-emerald-500/[0.02]">
               <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Eco Score</p>
                  <p className="text-5xl font-medium text-emerald-400 tracking-tighter">{productData.ecoScore}<span className="text-xl text-emerald-400/50">/100</span></p>
               </div>
               <div className="w-px h-16 bg-white/10" />
               <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Carbon Debt</p>
                  <p className="text-5xl font-medium text-white tracking-tighter">{Math.round(productData.carbonFootprint?.total || 0)}<span className="text-xl text-slate-500">kg</span></p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Carbon Radar Comparison */}
             <div className="glass-card border-white/5 bg-white/[0.01] p-10 flex flex-col items-center">
                <h4 className="text-sm font-medium mb-8 text-center text-slate-400">Lifecycle Comparison: A vs B</h4>
                <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ecoComparisonData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name={recommendation.productA?.brand || 'Product A'}
                          dataKey="A"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name={recommendation.productB?.brand || 'Product B'}
                          dataKey="B"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <p className="mt-6 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Amortized Silicon Debt Projection</p>
             </div>

             {/* Footprint Breakdown Pie */}
             <div className="glass-card border-white/5 bg-white/[0.01] p-10 flex flex-col items-center">
                <h4 className="text-sm font-medium mb-8 text-center text-slate-400">{productData.name} Breakdown</h4>
                <div className="h-[350px] w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={footprintBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1500}
                         >
                            {footprintBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px' }}
                            formatter={(value: number) => [`${value} kg CO2e`, 'Impact']}
                         />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Leaf className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Impact</span>
                   </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6 w-full">
                   {footprintBreakdown.map(item => (
                     <div key={item.name} className="flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.value}kg</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* AI Comparison Summary Section */}
      {recommendation.comparisonSummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75 }}
          className="glass-premium rounded-[3rem] p-12 mb-12 border-blue-500/10 overflow-hidden relative"
        >
          {/* Abstract background intelligence icon */}
          <Sparkles className="absolute -top-20 -left-20 w-80 h-80 text-blue-500/5 rotate-12 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.4em]">Neural Integration Analysis</h3>
            </div>
            
            <h2 className="text-4xl font-medium tracking-tight mb-8">Engineering Verdict</h2>
            
            <div className="prose prose-invert prose-blue max-w-none prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-strong:text-blue-400 prose-li:text-slate-400">
              <ReactMarkdown>{recommendation.comparisonSummary}</ReactMarkdown>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
              {[
                { label: 'Performance', icon: Cpu, scoreA: recommendation.productA?.performanceScore || 0, scoreB: recommendation.productB?.performanceScore || 0 },
                { label: 'Durability', icon: Shield, scoreA: recommendation.productA?.durabilityScore || 0, scoreB: recommendation.productB?.durabilityScore || 0 },
                { label: 'Eco-Friendliness', icon: Leaf, scoreA: recommendation.productA?.ecoScore || 0, scoreB: recommendation.productB?.ecoScore || 0 },
                { label: 'Value Efficiency', icon: Award, scoreA: Math.min(100, ((recommendation.productA?.estimatedLifespan || 0) / 10) * 100), scoreB: Math.min(100, ((recommendation.productB?.estimatedLifespan || 0) / 10) * 100) },
              ].map((metric) => (
                <div key={metric.label} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{metric.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-tighter">
                      <span className={recommendation.winnerId === 'A' ? 'text-blue-400 font-bold' : 'text-slate-500'}>Product A</span>
                      <span className="text-white font-mono">{Math.round(metric.scoreA)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${metric.scoreA}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-tighter">
                      <span className={recommendation.winnerId === 'B' ? 'text-blue-400 font-bold' : 'text-slate-500'}>Product B</span>
                      <span className="text-white font-mono">{Math.round(metric.scoreB)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${metric.scoreB}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hidden Engineering Warnings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card border-amber-500/10 bg-amber-500/[0.03] mb-12 shadow-inner p-10"
      >
         <h3 className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-2.5">
           <AlertTriangle className="w-4 h-4" />
           Hidden Engineering Warnings
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {productData.hiddenWarnings.map((w, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 + (i * 0.1) }}
               className="flex gap-3 text-sm text-amber-200/60 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5"
             >
               <span className="text-amber-500 font-bold">•</span>
               {w}
             </motion.div>
           ))}
         </div>
      </motion.div>

      {/* Technical Specifications Accordion */}
      <motion.div 
        layout
        className="glass-card border-white/5 bg-white/[0.02] mb-12 overflow-hidden shadow-2xl"
      >
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/80 mb-0.5">Hardware Foundation</h3>
              <p className="text-xl font-medium tracking-tight">Technical Specifications</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showSpecs ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showSpecs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-8 pt-0 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 mt-8">
                  {Object.entries(productData.specs).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="flex flex-col gap-1 py-3 border-b border-white/[0.03] group/item"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</span>
                      <span className="text-base text-slate-200 group-hover/item:text-blue-400 transition-colors font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-center mb-12">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="flex items-center gap-3 py-5 px-12 rounded-2xl glass-premium hover:bg-slate-800/80 transition-all group"
        >
          <motion.div
            animate={{ rotate: showAnalysis ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Info className="w-5 h-5 text-blue-400" />
          </motion.div>
          <span className="font-medium tracking-tight text-lg">{showAnalysis ? 'Collapse Engineering Insight' : 'View Detailed Build Analysis'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-premium rounded-[3rem] p-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <h2 className="text-3xl font-medium flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Activity className="w-7 h-7 text-blue-400" />
                      </div>
                      Engineering Component Audit
                    </h2>
                    
                    <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                      {[
                        { id: 'Default', label: 'Reset' },
                        { id: 'Tier', label: 'Tier' },
                        { id: 'Health', label: 'Health' },
                        { id: 'Impact', label: 'Lifespan' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortComponentsBy(option.id as any)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            sortComponentsBy === option.id 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {sortedComponents && sortedComponents.length > 0 ? (
                    <div className="space-y-4">
                      {sortedComponents.map((comp, idx) => (
                        <ComponentAccordion key={`${comp.name}-${idx}`} component={comp} />
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-blue max-w-none prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-strong:text-blue-400">
                      <ReactMarkdown>{productData.componentAnalysis}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass-card border-rose-500/10 bg-rose-500/[0.02] p-10">
                  <h2 className="text-xl font-medium mb-6 flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                    Failure Propensity
                  </h2>
                  <p className="text-slate-400 leading-relaxed italic text-base">
                    "{productData.failureProbability}"
                  </p>
                  
                  <div className="mt-12 pt-10 border-t border-white/5">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Repair Score</span>
                      <span className="text-4xl font-mono text-blue-400 font-bold">{productData.repairabilityScore}<span className="text-slate-600 text-base">/10</span></span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${productData.repairabilityScore * 10}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card glass-premium p-10">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-10 border-b border-white/5 pb-4">Hardware DNA</h3>
                   <div className="space-y-7">
                     {Object.entries(productData.specs).slice(0, 6).map(([k, v]) => (
                       <div key={k} className="flex justify-between items-center group">
                         <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">{k}</span>
                         <span className="text-base font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{v}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card glass-premium grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center p-10"
            >
               {Object.entries(productData.specs).slice(6).map(([k, v]) => (
                 <div key={k} className="space-y-2">
                   <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">{k}</span>
                   <span className="text-base font-medium text-slate-300">{String(v)}</span>
                 </div>
               ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 pt-12 border-t border-white/5 text-center"
      >
        <div className="glass-card max-w-2xl mx-auto p-10 border-blue-500/10">
          <AnimatePresence mode="wait">
            {!feedbackSubmitted ? (
              <motion.div 
                key="question"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h4 className="text-xl font-medium mb-2 tracking-tight">Was this recommendation accurate?</h4>
                <p className="text-slate-500 text-sm mb-8">Help us improve our neural engineering analysis.</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => handleFeedback(true)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes, it's accurate
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-medium"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No, something is off
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="thank-you"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-medium text-white">Thank you for your feedback!</h4>
                  <p className="text-slate-500 text-sm mt-1">Your contribution helps refine our predictive durability models.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

