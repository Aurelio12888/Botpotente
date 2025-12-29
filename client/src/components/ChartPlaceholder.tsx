import { useEffect, useState, useRef } from 'react';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

const generateInitialCandles = (count: number) => {
  const candles: Candle[] = [];
  let prevClose = 50;
  for (let i = 0; i < count; i++) {
    const open = prevClose;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 1;
    const low = Math.min(open, close) - Math.random() * 1;
    candles.push({ open, high, low, close, time: i });
    prevClose = close;
  }
  return candles;
};

interface ChartPlaceholderProps {
  isActive?: boolean;
  pair?: string;
  timeframe?: string;
}

export function ChartPlaceholder({ isActive = true, pair = "", timeframe = "" }: ChartPlaceholderProps) {
  // Use pair and timeframe in the dependency array to reset candles when they change
  const [candles, setCandles] = useState<Candle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate unique seed based on pair name for visual consistency per asset
    const seed = pair.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 30;
    const initialCandles: Candle[] = [];
    
    // Simple deterministic pseudo-random based on seed
    let currentPrice = 50 + (seed % 20);
    for (let i = 0; i < count; i++) {
      const open = currentPrice;
      const vol = 1 + (seed % 5) / 2; // Volatility based on asset
      const close = open + (Math.sin(i + seed) * vol);
      const high = Math.max(open, close) + Math.random() * (vol/2);
      const low = Math.min(open, close) - Math.random() * (vol/2);
      initialCandles.push({ open, high, low, close, time: i });
      currentPrice = close;
    }
    setCandles(initialCandles);

    const interval = setInterval(() => {
      setCandles(current => {
        if (current.length === 0) return current;
        const lastCandle = current[current.length - 1];
        const open = lastCandle.close;
        const vol = 1 + (seed % 5) / 2;
        const close = open + (Math.random() - 0.5) * vol;
        const high = Math.max(open, close) + Math.random() * (vol/4);
        const low = Math.min(open, close) - Math.random() * (vol/4);
        
        return [...current.slice(1), { open, high, low, close, time: Date.now() }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [pair, timeframe]); // Reset when selection changes

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const allValues = candles.flatMap(c => [c.high, c.low]);
      const min = Math.min(...allValues) - 2;
      const max = Math.max(...allValues) + 2;
      const range = max - min;

      const candleWidth = (width / candles.length) * 0.8;
      const gap = (width / candles.length) * 0.2;

      candles.forEach((c, i) => {
        const x = i * (candleWidth + gap) + gap / 2;
        const isBullish = c.close >= c.open;
        const color = isBullish ? "#22c55e" : "#ef4444";

        const yOpen = height - ((c.open - min) / range) * height;
        const yClose = height - ((c.close - min) / range) * height;
        const yHigh = height - ((c.high - min) / range) * height;
        const yLow = height - ((c.low - min) / range) * height;

        // Wick
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, yHigh);
        ctx.lineTo(x + candleWidth / 2, yLow);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyHeight = Math.abs(yClose - yOpen) || 1;
        ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);
      });
    };

    render();
  }, [candles]);

  const lastCandle = candles[candles.length - 1];
  const isUp = lastCandle ? lastCandle.close >= lastCandle.open : true;

  return (
    <div className="w-full h-full relative bg-[#06080c]">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
          backgroundSize: '40px 40px'
        }} 
      />
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-full relative z-10 p-2"
      />
      
      {isActive && lastCandle && (
        <div 
          className={`absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-mono font-bold z-20 flex items-center gap-1 border-y border-l border-white/10 ${isUp ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span>{lastCandle.close.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}
