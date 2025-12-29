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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setData(current => {
        const lastValue = current[current.length - 1].value;
        const change = (Math.random() - 0.5) * 3;
        const newValue = lastValue + change;
        const newData = [...current.slice(1), { value: newValue }];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isUp = data[data.length - 1].value > data[data.length - 5].value;
  const strokeColor = isUp ? "#22c55e" : "#ef4444";

  if (!isMounted) return <div className="w-full h-full bg-[#0f141f]" />;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0f141f]">
      {/* Grid background effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
          backgroundSize: '30px 30px',
          zIndex: 1
        }} 
      />
      
      <div className="absolute inset-0 z-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={100}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={['auto', 'auto']} hide />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Live price indicator */}
      {isActive && (
        <motion.div 
          className="absolute right-0 flex items-center gap-1 bg-[#1a202c]/90 px-2 py-1 rounded-l-md border-l border-y border-white/10 text-xs font-mono font-bold z-20"
          style={{ top: '50%' }}
          animate={{ y: isUp ? -2 : 2 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className={isUp ? 'text-green-500' : 'text-red-500'}>
            {data[data.length - 1].value.toFixed(4)}
          </span>
        </motion.div>
      )}
    </div>
  );
}
