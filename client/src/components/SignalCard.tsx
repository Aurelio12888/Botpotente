import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Clock, Activity, CheckCircle2 } from "lucide-react";
import type { GenerateSignalResponse } from "@shared/schema"; // Mock import based on prompt context

interface SignalCardProps {
  isLoading: boolean;
  signal: GenerateSignalResponse | null;
  onReset: () => void;
}

export function SignalCard({ isLoading, signal, onReset }: SignalCardProps) {
  if (isLoading) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <Activity className="absolute inset-0 m-auto text-primary w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-xl font-display font-bold text-white animate-pulse">ANALYZING MARKET</h3>
            <p className="text-sm text-white/50 font-mono">Scanning volatility & trends...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!signal) return null;

  const isCall = signal.type === "CALL";
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 bg-background/95 backdrop-blur-md rounded-2xl"
      >
        <div className={`
          w-full max-w-sm rounded-2xl border-2 p-6 text-center shadow-2xl relative overflow-hidden
          ${isCall 
            ? 'border-green-500/50 bg-gradient-to-b from-green-500/10 to-transparent shadow-green-500/20' 
            : 'border-red-500/50 bg-gradient-to-b from-red-500/10 to-transparent shadow-red-500/20'
          }
        `}>
          {/* Result Glow Background */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 blur-[60px] opacity-40 rounded-full ${isCall ? 'bg-green-500' : 'bg-red-500'}`} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className={`
              w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl
              ${isCall ? 'bg-green-500 animate-glow-green' : 'bg-red-500 animate-glow-red'}
            `}
          >
            {isCall 
              ? <ArrowUp className="w-14 h-14 text-white" strokeWidth={3} />
              : <ArrowDown className="w-14 h-14 text-white" strokeWidth={3} />
            }
          </motion.div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-black tracking-tighter mb-2 ${isCall ? 'text-green-400 neon-text-green' : 'text-red-400 neon-text-red'}`}
          >
            {isCall ? "CALL ⬆" : "PUT ⬇"}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 font-medium text-lg mb-6"
          >
            {signal.pair} <span className="text-white/40 mx-2">•</span> {signal.timeframe}
          </motion.p>

          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-white/60 bg-white/5 py-2 px-4 rounded-full mx-auto w-fit">
            <Clock className="w-4 h-4" />
            <span>Valid for exactly <strong className="text-white">1 candle</strong></span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="w-full py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          >
            New Analysis
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
