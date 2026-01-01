import { useEffect, useState, useRef } from 'react';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

const generateInitialCandles = (count: number, seed: number) => {
  const candles: Candle[] = [];
  let currentPrice = 50 + (seed % 20);
  for (let i = 0; i < count; i++) {
    const open = currentPrice;
    const vol = 1 + (seed % 5) / 2;
    const close = open + (Math.sin(i + seed) * vol);
    const high = Math.max(open, close) + Math.random() * (vol / 2);
    const low = Math.min(open, close) - Math.random() * (vol / 2);
    candles.push({ open, high, low, close, time: i });
    currentPrice = close;
  }
  return candles;
};

interface ChartPlaceholderProps {
  isActive?: boolean;
  pair?: string;
  timeframe?: string;
}

export function ChartPlaceholder({ isActive = true, pair = "", timeframe = "" }: ChartPlaceholderProps) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const seed = (pair || "default").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const initial = generateInitialCandles(30, seed);
      setCandles(initial);

    const interval = setInterval(() => {
      setCandles(current => {
        if (!current || current.length === 0) return [];
        const lastCandle = current[current.length - 1];
        if (!lastCandle) return current;
        
        try {
          const open = lastCandle.close;
          const vol = 1 + (seed % 5) / 2;
          const close = open + (Math.random() - 0.5) * vol;
          const high = Math.max(open, close) + Math.random() * (vol / 4);
          const low = Math.min(open, close) - Math.random() * (vol / 4);
          
          return [...current.slice(1), { open, high, low, close, time: Date.now() }];
        } catch (e) {
          console.error("Error updating candles", e);
          return current;
        }
      });
    }, 2000);

      return () => clearInterval(interval);
    } catch (e) {
      console.error("Error initializing candles", e);
    }
  }, [pair, timeframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Use ResizeObserver to handle canvas sizing properly
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            canvas.width = Math.floor(width * window.devicePixelRatio);
            canvas.height = Math.floor(height * window.devicePixelRatio);
          }
        }
      });

      if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
      }
      return () => resizeObserver.disconnect();
    } catch (err) {
      console.error("ResizeObserver error:", err);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      try {
        const { width, height } = canvas;
        const dpr = window.devicePixelRatio || 1;
        
        ctx.save();
        ctx.scale(dpr, dpr);
        
        const drawWidth = width / dpr;
        const drawHeight = height / dpr;

        ctx.clearRect(0, 0, drawWidth, drawHeight);

        const allValues = candles.flatMap(c => c ? [c.high, c.low] : []);
        if (allValues.length === 0) {
          ctx.restore();
          return;
        }

        const min = Math.min(...allValues) - 2;
        const max = Math.max(...allValues) + 2;
        const range = max - min || 1;

        const candleWidth = (drawWidth / candles.length) * 0.8;
        const gap = (drawWidth / candles.length) * 0.2;

        candles.forEach((c, i) => {
          if (!c) return;
          const x = i * (candleWidth + gap) + gap / 2;
          const isBullish = c.close >= c.open;
          const color = isBullish ? "#22c55e" : "#ef4444";

          const yOpen = drawHeight - ((c.open - min) / range) * drawHeight;
          const yClose = drawHeight - ((c.close - min) / range) * drawHeight;
          const yHigh = drawHeight - ((c.high - min) / range) * drawHeight;
          const yLow = drawHeight - ((c.low - min) / range) * drawHeight;

          ctx.beginPath();
          ctx.moveTo(x + candleWidth / 2, yHigh);
          ctx.lineTo(x + candleWidth / 2, yLow);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = color;
          const bodyHeight = Math.abs(yClose - yOpen) || 1;
          ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);
        });
        
        ctx.restore();
      } catch (e) {
        console.error("Error rendering chart", e);
      }
    };

    render();
  }, [candles]);

  const lastCandle = (candles && candles.length > 0) ? candles[candles.length - 1] : null;
  const isUp = lastCandle ? lastCandle.close >= lastCandle.open : false;

  return (
    <div className="w-full h-full relative bg-[#06080c] rounded-xl overflow-hidden min-h-[200px]">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
          backgroundSize: '40px 40px'
        }} 
      />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full relative z-10"
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
