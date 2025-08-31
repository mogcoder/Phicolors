

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { HSLColor, FullColor } from '../types';
import { formatHslString, formatRgbString, getContrastYIQ, calculateContrastRatio, findOptimalLightnessForContrast, mixColorsGoldenMean, rgbToHsl, rgbToHex } from '../utils/colorUtils';
import Tooltip from './Tooltip';

interface ColorSwatchProps {
  isBaseColor: boolean;
  color: FullColor;
  baseColor?: FullColor;
  onColorChange?: (newHsl: HSLColor) => void;
  autoAdjustContrast?: boolean;
}

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  style: React.CSSProperties;
  textColorClass: string;
}> = ({ label, value, onChange, style, textColorClass }) => {
  const handleDecrement = () => {
    onChange(Math.max(0, value - 1));
  };
  const handleIncrement = () => {
    onChange(Math.min(100, value + 1));
  };

  const buttonClasses = `w-6 h-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed ${textColorClass}`;
  
  const isDarkTextOnLightBg = textColorClass === 'text-slate-900';
  const thumbColor = isDarkTextOnLightBg ? '#334155' /* slate-700 */ : '#e2e8f0' /* slate-200 */;
  const thumbBorderColor = isDarkTextOnLightBg ? '#94a3b8' /* slate-400 */ : '#475569' /* slate-600 */;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <label className={`font-medium ${textColorClass}`}>{label}</label>
        <span className={`font-mono font-semibold ${textColorClass}`}>{Math.round(value)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content={`Decrease ${label}`}>
          <button onClick={handleDecrement} disabled={value <= 0} className={buttonClasses} aria-label={`Decrease ${label}`}>
            <span aria-hidden="true">➖</span>
          </button>
        </Tooltip>
        <div className="relative h-5 w-full flex-grow flex items-center group">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-lg"
            style={style}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute w-full h-full rounded-lg appearance-none bg-transparent cursor-pointer"
            style={{
                '--thumb-color': thumbColor,
                '--thumb-border-color': thumbBorderColor,
            } as React.CSSProperties}
          />
        </div>
        <Tooltip content={`Increase ${label}`}>
          <button onClick={handleIncrement} disabled={value >= 100} className={buttonClasses} aria-label={`Increase ${label}`}>
            <span aria-hidden="true">➕</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};


const ColorValue: React.FC<{ 
    value: string;
    textColorClass: string;
    iconColorClass: string;
    ringColorClass: string;
}> = ({ value, textColorClass, iconColorClass, ringColorClass }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip content={`Copy ${value}`} className="flex-grow">
      <button 
        onClick={handleCopy} 
        className={`group w-full flex items-center gap-2 bg-black/10 backdrop-blur-sm p-2 rounded-xl transition-colors hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${ringColorClass}`}
        aria-label={`Copy ${value}`}
      >
        <span className={`font-mono text-sm ${textColorClass}`}>{value}</span>
        <div className="flex-grow"></div>
        {copied 
          ? <span className="text-green-400">✔</span> 
          : <span className={`transition-opacity opacity-50 group-hover:opacity-100`}>📋</span>
        }
      </button>
    </Tooltip>
  );
};

const ContrastMeter: React.FC<{ ratio: number, textColorClass: string }> = ({ ratio, textColorClass }) => {
  const VISUAL_MAX_RATIO = 12;

  const fillPercentage = Math.min((ratio / VISUAL_MAX_RATIO) * 100, 100);
  const fillColorClass = textColorClass === 'text-slate-900' ? 'bg-black/40' : 'bg-white/60';
  
  const aaMarkerPosition = (4.5 / VISUAL_MAX_RATIO) * 100;
  const aaaMarkerPosition = (7 / VISUAL_MAX_RATIO) * 100;

  return (
    <div className="flex-grow space-y-2 text-center">
      <span className={`font-mono text-xl font-bold ${textColorClass}`}>
        {ratio.toFixed(2)}:1
      </span>
      <div className="w-full" title={`WCAG Contrast Ratio: ${ratio.toFixed(2)}`}>
        <div className="relative h-3 bg-black/20 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${fillColorClass}`}
            style={{ width: `${fillPercentage}%` }}
          />
          {/* Vertical marker lines */}
          <div className="absolute top-0 h-full w-0.5 bg-white/30" style={{ left: `${aaMarkerPosition}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-white/30" style={{ left: `${aaaMarkerPosition}%` }} />
        </div>
        {/* Labels below the bar in a neutral container */}
        <div className="relative h-5 mt-1 bg-black/10 rounded">
            <div 
                className="absolute" 
                style={{ top: '50%', left: `${aaMarkerPosition}%`, transform: 'translate(-50%, -50%)' }}
                title="WCAG AA Threshold (4.5:1)"
            >
                <span className="text-xl opacity-80" aria-hidden="true">🥈</span>
            </div>
            <div 
                className="absolute" 
                style={{ top: '50%', left: `${aaaMarkerPosition}%`, transform: 'translate(-50%, -50%)' }}
                title="WCAG AAA Threshold (7:1)"
            >
                <span className="text-xl opacity-80" aria-hidden="true">🥇</span>
            </div>
        </div>
      </div>
    </div>
  );
};


const ColorSwatch: React.FC<ColorSwatchProps> = ({ isBaseColor, color, baseColor, onColorChange, autoAdjustContrast = false }) => {
  const { hsl, rgb, hex } = color;
  const [showAdjustControls, setShowAdjustControls] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);

  const hslString = formatHslString(hsl);
  const rgbString = formatRgbString(rgb);
  
  const contrast = getContrastYIQ(rgb.r, rgb.g, rgb.b);
  const textColorClass = contrast === 'dark' ? 'text-slate-900' : 'text-slate-50';
  const iconColorClass = contrast === 'dark' ? 'text-slate-700' : 'text-slate-400';
  const ringColorClass = contrast === 'dark' ? 'focus:ring-slate-900/50' : 'focus:ring-white/50';

  const contrastCheck = useMemo(() => {
    if (isBaseColor || !baseColor) return null;
    return { ratio: calculateContrastRatio(color.rgb, baseColor.rgb) };
  }, [color, baseColor, isBaseColor]);
  
  const mixedColor = useMemo<FullColor | null>(() => {
      if (isBaseColor || !baseColor) return null;
      const mixedRgb = mixColorsGoldenMean(baseColor.rgb, color.rgb);
      const mixedHsl = rgbToHsl(mixedRgb.r, mixedRgb.g, mixedRgb.b);
      const mixedHex = rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
      return { hsl: mixedHsl, rgb: mixedRgb, hex: mixedHex };
  }, [color, baseColor, isBaseColor]);

  const MINIMUM_TARGET_RATIO = 4.5;
  
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const propsRef = useRef({ onColorChange, baseColor, autoAdjustContrast, hsl });
  useEffect(() => {
    propsRef.current = { onColorChange, baseColor, autoAdjustContrast, hsl };
  }, [onColorChange, baseColor, autoAdjustContrast, hsl]);

  const stopStepping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect to clean up timers when the component unmounts.
  // This is a safeguard against memory leaks if the component is removed
  // while a stepping operation is active.
  useEffect(() => {
    return () => {
      stopStepping();
    };
  }, [stopStepping]);
  
  const handleLighterStep = useCallback(() => {
    const { onColorChange, baseColor, autoAdjustContrast, hsl } = propsRef.current;
    if (!onColorChange) return;

    if (autoAdjustContrast) {
        if (!baseColor) return;
        const nextColorHsl = findOptimalLightnessForContrast(hsl, baseColor.rgb, 'lighter', MINIMUM_TARGET_RATIO);
        if (nextColorHsl) {
            onColorChange(nextColorHsl);
        } else {
            stopStepping();
        }
    } else {
        const newLightness = Math.min(100, Math.round(hsl.l) + 1);
        if (newLightness === hsl.l) {
            stopStepping();
        }
        onColorChange({ ...hsl, l: newLightness });
    }
  }, [stopStepping]);

  const handleDarkerStep = useCallback(() => {
    const { onColorChange, baseColor, autoAdjustContrast, hsl } = propsRef.current;
    if (!onColorChange) return;
    if (autoAdjustContrast) {
        if (!baseColor) return;
        const nextColorHsl = findOptimalLightnessForContrast(hsl, baseColor.rgb, 'darker', MINIMUM_TARGET_RATIO);
        if (nextColorHsl) {
            onColorChange(nextColorHsl);
        } else {
            stopStepping();
        }
    } else {
        const newLightness = Math.max(0, Math.round(hsl.l) - 1);
        if (newLightness === hsl.l) {
            stopStepping();
        }
        onColorChange({ ...hsl, l: newLightness });
    }
  }, [stopStepping]);

  const startStepping = useCallback((stepFn: () => void) => {
    stopStepping();
    stepFn();

    timeoutRef.current = window.setTimeout(() => {
        intervalRef.current = window.setInterval(stepFn, 50);
    }, 400);
  }, [stopStepping]);
  
  const canGoLighter = useMemo(() => {
    if (autoAdjustContrast) {
        if (!baseColor) return false;
        return !!findOptimalLightnessForContrast(hsl, baseColor.rgb, 'lighter', MINIMUM_TARGET_RATIO);
    }
    return hsl.l < 100;
  }, [hsl, baseColor, autoAdjustContrast]);

  const canGoDarker = useMemo(() => {
    if (autoAdjustContrast) {
        if (!baseColor) return false;
        return !!findOptimalLightnessForContrast(hsl, baseColor.rgb, 'darker', MINIMUM_TARGET_RATIO);
    }
    return hsl.l > 0;
  }, [hsl, baseColor, autoAdjustContrast]);


  const saturationGradient = { background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`};
  const lightnessGradient = { background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`};
  
  const stepperButtonClasses = `p-1.5 rounded-full hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${ringColorClass}`;

  return (
    <div 
        className="p-4 rounded-xl shadow-lg transition-all duration-300 space-y-3 backdrop-blur-sm" 
        style={{ backgroundColor: hslString }}
    >
        <div className="flex justify-between items-center">
            <span className={`font-bold text-lg ${textColorClass}`}>
              {isBaseColor ? 'Base Color' : 'Complementary Color'}
            </span>
            <div className="flex items-center gap-2">
              {!isBaseColor && onColorChange && (
                 <>
                    <Tooltip content="Mix with base using Golden Mean">
                      <button onClick={() => setIsMixerOpen(!isMixerOpen)} className={`p-1 rounded-full transition-colors ${isMixerOpen ? 'bg-black/20' : 'bg-transparent'} hover:bg-black/20 focus:outline-none focus:ring-2 ${ringColorClass}`} aria-label="Toggle Golden Mean Mixer">
                          <span className="text-2xl" aria-hidden="true">⚗️</span>
                      </button>
                    </Tooltip>
                    <Tooltip content="Adjust Saturation & Lightness">
                      <button onClick={() => setShowAdjustControls(!showAdjustControls)} className={`p-1 rounded-full transition-colors ${showAdjustControls ? 'bg-black/20' : 'bg-transparent'} hover:bg-black/20 focus:outline-none focus:ring-2 ${ringColorClass}`} aria-label="Toggle fine-tune controls">
                          <span className="text-2xl" aria-hidden="true">🎛️</span>
                      </button>
                    </Tooltip>
                 </>
              )}
              {isBaseColor 
                  ? <span className="text-2xl" aria-hidden="true">🎯</span>
                  : <span className="text-2xl" aria-hidden="true">✨</span>
              }
            </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <ColorValue value={hex} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
            <ColorValue value={rgbString} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
            <ColorValue value={hslString} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
        </div>

        {isMixerOpen && mixedColor && baseColor && (
             <div className="pt-3 mt-3 border-t border-black/10 space-y-3 bg-black/20 backdrop-blur-sm p-3 -m-1 rounded-lg">
                <h4 className={`text-sm font-bold ${textColorClass}`}>Golden Mean Mix</h4>
                <div className="p-3 rounded-lg" style={{ backgroundColor: mixedColor.hex }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                       <ColorValue value={mixedColor.hex} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
                       <ColorValue value={formatRgbString(mixedColor.rgb)} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
                       <ColorValue value={formatHslString(mixedColor.hsl)} textColorClass={textColorClass} iconColorClass={iconColorClass} ringColorClass={ringColorClass} />
                    </div>
                </div>
                <div className="bg-black/10 backdrop-blur-sm p-3 rounded-lg">
                    <ContrastMeter ratio={calculateContrastRatio(mixedColor.rgb, baseColor.rgb)} textColorClass={textColorClass} />
                </div>
            </div>
        )}

        {showAdjustControls && !isBaseColor && onColorChange && (
          <div className="pt-3 mt-3 border-t border-black/10 space-y-3 bg-black/10 backdrop-blur-sm p-3 -m-1 rounded-lg">
             <Slider 
              label="Saturation"
              value={hsl.s}
              onChange={(s) => onColorChange({ ...hsl, s })}
              style={saturationGradient}
              textColorClass={textColorClass}
            />
             <Slider 
              label="Lightness"
              value={hsl.l}
              onChange={(l) => onColorChange({ ...hsl, l })}
              style={lightnessGradient}
              textColorClass={textColorClass}
            />
          </div>
        )}
        
        {contrastCheck && (
          <div className="pt-3 mt-3 border-t border-black/10 space-y-3">
            <h4 className={`text-sm font-bold ${textColorClass}`}>Contrast with Base Color</h4>
            
            <div className="bg-black/10 backdrop-blur-sm p-3 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <Tooltip content="Find next lighter accessible color">
                    <button 
                      onPointerDown={() => startStepping(handleLighterStep)}
                      onPointerUp={stopStepping}
                      onPointerLeave={stopStepping}
                      disabled={!canGoLighter} 
                      className={stepperButtonClasses} 
                      aria-label="Find next lighter color (hold to repeat)"
                    >
                      <span className="text-xl" aria-hidden="true">◀️</span>
                    </button>
                  </Tooltip>

                  <ContrastMeter ratio={contrastCheck.ratio} textColorClass={textColorClass} />

                  <Tooltip content="Find next darker accessible color">
                    <button 
                      onPointerDown={() => startStepping(handleDarkerStep)}
                      onPointerUp={stopStepping}
                      onPointerLeave={stopStepping}
                      disabled={!canGoDarker} 
                      className={stepperButtonClasses} 
                      aria-label="Find next darker color (hold to repeat)"
                    >
                      <span className="text-xl" aria-hidden="true">▶️</span>
                    </button>
                  </Tooltip>
                </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ColorSwatch;
