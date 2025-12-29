import { useState } from 'react';
import { useGenerateSignal } from '@/hooks/use-signals';
import { ChartPlaceholder } from '@/components/ChartPlaceholder';
import { SignalCard } from '@/components/SignalCard';
import { Selector } from '@/components/Selector';
import { Button } from '@/components/ui/button';
import { CandlestickChart, Clock, Zap, History, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

// Constants matching Schema
const ASSET_PAIRS = [
  "EUR/USD OTC",
  "GBP/USD OTC",
  "USD/JPY OTC",
  "AUD/USD OTC",
  "USD/CHF OTC",
  "EUR/GBP OTC",
  "EUR/JPY OTC",
  "GBP/JPY OTC",
] as const;

const TIMEFRAMES = ["1s", "5s", "30s", "1m", "5m"] as const;

export default function Home() {
  const [pair, setPair] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [signal, setSignal] = useState<any | null>(null);

  const { mutateAsync: generateSignal } = useGenerateSignal();
  const { toast } = useToast();

  const handleGetSignal = async () => {
    if (!pair || !timeframe) return;

    // Start UI animation state
    setAnalyzing(true);
    setSignal(null);

    try {
      // Wait for minimum animation time (2s) + API request
      const [result] = await Promise.all([
        generateSignal({ pair, timeframe }),
        new Promise(resolve => setTimeout(resolve, 2500)) // Force 2.5s delay for effect
      ]);
      setSignal(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating signal",
        description: "Please check your connection and try again.",
      });
      setAnalyzing(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSignal(null);
    setAnalyzing(false);
  };

  const isReady = !!pair && !!timeframe;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-white w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">Pocket Broker</h1>
            <span className="text-xs text-muted-foreground font-mono">AI Signal Bot v2.0</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-md mx-auto w-full gap-6 relative">
        
        {/* Signal Overlay Component */}
        <SignalCard 
          isLoading={analyzing} 
          signal={signal} 
          onReset={handleReset} 
        />

        {/* Controls Section */}
        <section className="space-y-4 z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Asset Pair (OTC)</label>
            <Selector
              placeholder="Select Asset..."
              options={ASSET_PAIRS}
              value={pair}
              onChange={setPair}
              icon={<CandlestickChart className="w-5 h-5" />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Timeframe</label>
            <Selector
              placeholder="Select Time..."
              options={TIMEFRAMES}
              value={timeframe}
              onChange={setTimeframe}
              icon={<Clock className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* Chart Visualization */}
        <section className="flex-1 min-h-[250px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/20">
          {isReady ? (
            <div className="absolute top-4 left-4 z-10 flex flex-col">
              <span className="text-xs text-muted-foreground font-mono">LIVE MARKET DATA</span>
              <span className="text-lg font-bold font-display text-white">{pair}</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="text-muted-foreground/50 text-sm font-medium">Select asset to view chart</span>
            </div>
          )}
          
          <ChartPlaceholder isActive={isReady} />
          
          {/* Active status indicator overlay */}
          {isReady && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono text-green-400">Connected</span>
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className="pt-2 pb-6 sticky bottom-0 z-20">
          <motion.div
            whileHover={isReady ? { scale: 1.02, translateY: -2 } : {}}
            whileTap={isReady ? { scale: 0.98 } : {}}
          >
            <Button
              size="lg"
              disabled={!isReady || analyzing}
              onClick={handleGetSignal}
              className={`
                w-full h-16 text-xl font-bold rounded-2xl shadow-lg transition-all duration-300
                ${isReady 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 border border-blue-400/20' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }
              `}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className={`w-6 h-6 ${isReady ? 'text-yellow-300 fill-yellow-300' : ''}`} />
                  GET SIGNAL
                </span>
              )}
            </Button>
          </motion.div>
          
          <p className="text-center text-[10px] text-muted-foreground/40 mt-3 font-mono">
            Analysis based on technical indicators. Trading involves risk.
          </p>
        </div>

      </main>
    </div>
  );
}
