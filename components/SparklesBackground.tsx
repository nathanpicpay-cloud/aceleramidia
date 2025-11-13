import React from 'react';

interface Sparkle {
  id: number;
  top: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: number;
  tx1: string;
  ty1: string;
  tx2: string;
  ty2: string;
  tx3: string;
  ty3: string;
}

const generateSparkles = (count: number): Sparkle[] => {
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    const driftRange = 30; // pixels
    sparkles.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: Math.random() * 2.5 + 1,
      tx1: `${(Math.random() - 0.5) * 2 * driftRange}px`,
      ty1: `${(Math.random() - 0.5) * 2 * driftRange}px`,
      tx2: `${(Math.random() - 0.5) * 2 * driftRange}px`,
      ty2: `${(Math.random() - 0.5) * 2 * driftRange}px`,
      tx3: `${(Math.random() - 0.5) * 2 * driftRange}px`,
      ty3: `${(Math.random() - 0.5) * 2 * driftRange}px`,
    });
  }
  return sparkles;
};

const SparklesBackground: React.FC<{ count?: number; className?: string; }> = ({ count = 50, className = '' }) => {
  const sparkles = generateSparkles(count);

  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: s.animationDuration,
            animationDelay: s.animationDelay,
            '--tx1': s.tx1,
            '--ty1': s.ty1,
            '--tx2': s.tx2,
            '--ty2': s.ty2,
            '--tx3': s.tx3,
            '--ty3': s.ty3,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default SparklesBackground;