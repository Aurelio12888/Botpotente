import { useEffect, useState, useRef } from 'react';

const generateInitialData = (count: number) => {
  const data = [];
  let prev = 50;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 4;
    prev += change;
    data.push(prev);
  }
  return data;
};

interface ChartPlaceholderProps {
  isActive?: boolean;
}

export function ChartPlaceholder({ isActive = true }: ChartPlaceholderProps) {
  const [data, setData] = useState(() => generateInitialData(50));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(current => {
        const lastValue = current[current.length - 1];
        const change = (Math.random() - 0.5) * 4;
        const newValue = lastValue + change;
        return [...current.slice(1), newValue];
      });
    }, 500); // Faster update for better visual

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const min = Math.min(...data) - 5;
      const max = Math.max(...data) + 5;
      const range = max - min;

      const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / range) * height
      }));

      // Determine color
      const isUp = data[data.length - 1] > data[data.length - 5];
      const color = isUp ? "#22c55e" : "#ef4444";

      // Draw Area
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, color + '66');
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw Last Point Pulse
      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    render();
  }, [data]);

  return (
    <div className="w-full h-full relative bg-[#0f141f]">
      {/* Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
          backgroundSize: '40px 40px'
        }} 
      />
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="w-full h-full relative z-10"
      />
      
      {isActive && (
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1a202c]/90 px-2 py-1 rounded border border-white/10 text-[10px] font-mono font-bold z-20 flex items-center gap-1"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${data[data.length-1] > data[data.length-5] ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className={data[data.length-1] > data[data.length-5] ? 'text-green-500' : 'text-red-500'}>
            {data[data.length-1].toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
