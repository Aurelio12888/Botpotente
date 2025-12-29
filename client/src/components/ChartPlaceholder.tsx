import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';

// Generate some random initial data
const generateInitialData = (count: number) => {
  const data = [];
  let prev = 100;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 2;
    prev += change;
    data.push({ value: prev });
  }
  return data;
};

interface ChartPlaceholderProps {
  isActive?: boolean;
  color?: string; // Hex color
}

export function ChartPlaceholder({ isActive = true, color = "#22c55e" }: ChartPlaceholderProps) {
  const [data, setData] = useState(() => generateInitialData(50));

  // Simulate live data tick
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setData(current => {
        const lastValue = current[current.length - 1].value;
        const change = (Math.random() - 0.5) * 3; // Random movement
        const newValue = lastValue + change;
        const newData = [...current.slice(1), { value: newValue }];
        return newData;
      });
    }, 1000); // 1 tick per second

    return () => clearInterval(interval);
  }, [isActive]);

  // Determine color based on trend (just for visual flair)
  const isUp = data[data.length - 1].value > data[data.length - 5].value;
  const strokeColor = isUp ? "#22c55e" : "#ef4444";
  const fillColor = isUp ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl bg-card/50 border border-white/5 shadow-inner">
      {/* Grid background effect */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
          backgroundSize: '20px 20px' 
        }} 
      />
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis domain={['auto', 'auto']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Live price indicator */}
      <motion.div 
        className="absolute right-0 flex items-center gap-1 bg-card/90 px-2 py-1 rounded-l-md border-l border-y border-white/10 text-xs font-mono font-bold"
        style={{ top: '40%' }} // Static vertical position for simplicity in demo
        animate={{ y: isUp ? -5 : 5 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <span className={isUp ? 'text-green-500' : 'text-red-500'}>
          {data[data.length - 1].value.toFixed(4)}
        </span>
      </motion.div>
    </div>
  );
}
