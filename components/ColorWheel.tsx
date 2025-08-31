import React, { useRef, useState, useCallback, useMemo } from 'react';

interface ColorWheelProps {
  hue: number;
  saturation: number;
  lightness: number;
  onHueChange: (newHue: number) => void;
  complementaryHues: number[];
}

// Converts HSL hue (0-360, 0 is top, clockwise) to a mathematical angle in degrees
// (0 is right, counter-clockwise) for use with trigonometric functions.
const hueToAngle = (hue: number): number => (hue - 90 + 360) % 360;

// Converts a mathematical angle in degrees (from atan2) back to an HSL hue.
const angleToHue = (angle: number): number => (angle + 90 + 360) % 360;

const Indicator: React.FC<{
  hue: number;
  saturation: number;
  lightness: number;
  size: string;
  border: string;
  extraClasses?: string;
}> = ({ hue, saturation, lightness, size, border, extraClasses = '' }) => {
    const angle = hueToAngle(hue);
    const angleRad = (angle * Math.PI) / 180;
    const radius = 45; // Percentage from center to place the indicator
    
    // Calculate x/y coordinates using trigonometry.
    const x = 50 + radius * Math.cos(angleRad);
    // Y is positive because CSS `top` property increases downwards.
    const y = 50 + radius * Math.sin(angleRad);

    return (
        <div
            className={`absolute rounded-full ${size} ${border} ${extraClasses} shadow-lg pointer-events-none`}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`
            }}
        />
    );
};

const ColorWheel: React.FC<ColorWheelProps> = ({ hue, saturation, lightness, onHueChange, complementaryHues }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    const newHue = angleToHue(angle);

    onHueChange(newHue);
  }, [onHueChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  
  const wheelStyle = {
      background: 'conic-gradient(hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'
  };

  const centerColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div
      ref={wheelRef}
      className="relative w-full aspect-square rounded-full cursor-pointer touch-none shadow-2xl"
      style={wheelStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={isDragging ? handlePointerMove : undefined}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hue)}
      aria-label="Color Hue Selector"
    >
        <div className="absolute inset-[15%] rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center backdrop-blur-sm">
            <div 
                className="w-[70%] h-[70%] rounded-full border-4 border-slate-400 dark:border-slate-700 shadow-inner"
                style={{ backgroundColor: centerColor }}
            />
        </div>
      
      {/* Complementary Indicators */}
      {complementaryHues.map((h, i) => (
        <Indicator 
            key={`comp-${i}`} 
            hue={h} 
            saturation={saturation}
            lightness={lightness}
            size="w-4 h-4" 
            border="border-2 border-white/75" 
        />
      ))}
      
      {/* Main Indicator with Halo */}
      <Indicator 
        hue={hue} 
        saturation={saturation}
        lightness={lightness}
        size="w-6 h-6" 
        border="border-4 border-white" 
        extraClasses="halo" 
      />
    </div>
  );
};

export default ColorWheel;