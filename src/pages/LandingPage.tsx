import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <div className="flex justify-center mb-32">
          <Logo size="xl" />
        </div>
        
        <p className="text-xl md:text-2xl text-slate-400 font-sans tracking-tight mb-12">
          Beyond Specs. <span className="text-white">Built for Years.</span>
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="premium-btn text-lg px-12 py-4"
        >
          Start Analysis
        </motion.button>
      </motion.div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-blue-500 to-transparent"
        />
      </div>
    </div>
  );
}
