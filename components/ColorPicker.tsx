import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { HSLColor } from '../types';
import ColorWheel from './ColorWheel';
import { hexToRgb, rgbToHsl } from '../utils/colorUtils';
import Tooltip from './Tooltip';

interface ColorPickerProps {
  baseHsl: HSLColor;
  baseHex: string;
  onBaseHslChange: (newColor: HSLColor) => void;
  complementaryHues: number[];
  numComplementary: number;
  onNumComplementaryChange: (count: number) => void;
  autoAdjustContrast: boolean;
  onAutoAdjustContrastChange: (enabled: boolean) => void;
  contrastTarget: number;
  onContrastTargetChange: (target: number) => void;
}

const HexImporter: React.FC<{
    baseHex: string;
    onBaseHslChange: (newColor: HSLColor) => void;
}> = ({ baseHex, onBaseHslChange }) => {
    const [inputValue, setInputValue] = useState(baseHex.substring(1));
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setInputValue(baseHex.substring(1));
            setIsValid(true);
        }
    }, [baseHex]);

    const processColorInput = (value: string) => {
        const rgb = hexToRgb(value);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            onBaseHslChange(hsl);
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const sanitizedText = text.trim();
            const hexValue = sanitizedText.startsWith('#') ? sanitizedText.substring(1) : sanitizedText;
            setInputValue(hexValue);
            processColorInput(sanitizedText);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };
    
    const handleRandomize = () => {
        const h = Math.floor(Math.random() * 361);
        const s = Math.floor(Math.random() * 41) + 50; // 50-90 for good saturation
        const l = Math.floor(Math.random() * 31) + 40; // 40-70 for good lightness
        onBaseHslChange({ h, s, l });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsValid(!!hexToRgb(value));
    };
    
    const handleBlur = () => {
         processColorInput(inputValue);
         if(!isValid){
            setInputValue(baseHex.substring(1));
            setIsValid(true);
         }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            processColorInput(inputValue);
            inputRef.current?.blur();
        }
    };
    
    const buttonClasses = "p-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-slate-500";

    return (
        <div className="space-y-3 p-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl border border-slate-300/50 dark:border-slate-700/50">
             <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Import or Generate Color</label>
             <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-500 dark:text-slate-400">#</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        maxLength={6}
                        className={`w-full font-mono bg-slate-100 dark:bg-slate-900/70 text-slate-800 dark:text-white pl-7 pr-3 py-2.5 rounded-lg text-base outline-none transition-all duration-200 border-2 border-transparent ${isValid ? 'focus:ring-2 focus:ring-slate-500 focus:border-slate-500' : 'ring-2 ring-red-500 border-red-500'}`}
                        aria-label="Hex color code input"
                        placeholder="1a2b3c"
                    />
                </div>
                <Tooltip content="Paste Hex code from clipboard">
                  <button 
                      onClick={handlePaste} 
                      className={buttonClasses}
                      aria-label="Paste color from clipboard"
                  >
                      <span className="text-xl" aria-hidden="true">📋</span>
                  </button>
                </Tooltip>
                <Tooltip content="Generate a random color">
                  <button 
                      onClick={handleRandomize} 
                      className={buttonClasses}
                      aria-label="Generate random color"
                  >
                      <span className="text-xl" aria-hidden="true">🪄</span>
                  </button>
                </Tooltip>
             </div>
        </div>
    );
};


// Refactored Slider component with editable input, stepper buttons, and snap points
const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  style: React.CSSProperties;
  snapPointsCount?: number;
}> = ({ label, value, onChange, min = 0, max = 100, style, snapPointsCount = 5 }) => {
  const [inputValue, setInputValue] = useState(String(Math.round(value)));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(String(Math.round(value)));
    }
  }, [value]);

  const handleInputBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      setInputValue(String(Math.round(value)));
      return;
    }
    const clampedValue = Math.max(min, Math.min(max, numValue));
    setInputValue(String(clampedValue));
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };
  
  const snapPoints = useMemo(() => {
    if (!snapPointsCount) return [];
    return Array.from({ length: snapPointsCount }, (_, i) => 
      Math.round((i + 1) * (max - min) / (snapPointsCount + 1))
    );
  }, [snapPointsCount, min, max]);

  const handleDecrement = () => {
    const effectiveSnapPoints = [min, ...snapPoints.filter(p => p > min && p < max), max];
    const prevSnapPoint = [...effectiveSnapPoints].reverse().find(p => p < value);
    onChange(prevSnapPoint !== undefined ? prevSnapPoint : min);
  };

  const handleIncrement = () => {
    const effectiveSnapPoints = [min, ...snapPoints.filter(p => p > min && p < max), max];
    const nextSnapPoint = effectiveSnapPoints.find(p => p > value);
    onChange(nextSnapPoint !== undefined ? nextSnapPoint : max);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let finalValue = Number(e.target.value);
    const SNAP_THRESHOLD = 4;

    for (const point of snapPoints) {
      if (Math.abs(finalValue - point) <= SNAP_THRESHOLD) {
        finalValue = point;
        break;
      }
    }
    onChange(finalValue);
    setInputValue(String(Math.round(finalValue)));
  };

  const buttonClasses = `p-1.5 bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
        <label className="font-medium text-sm">{label}</label>
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          min={min}
          max={max}
          className="w-16 text-center font-mono bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white px-2 py-1 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500"
          aria-label={`${label} value`}
        />
      </div>
      <div className="flex items-center gap-3">
        <Tooltip content={`Decrease ${label}`}>
          <button onClick={handleDecrement} disabled={value <= min} className={buttonClasses} aria-label={`Decrease ${label}`}>
            <span aria-hidden="true" className="text-lg">➖</span>
          </button>
        </Tooltip>
        <div className="relative h-5 w-full flex-grow flex items-center">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-lg"
            style={style}
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 flex items-center">
            {snapPoints.map((pointValue, index) => {
                const percentage = (pointValue - min) / (max - min) * 100;
                return (
                    <div 
                        key={index}
                        className="w-1.5 h-1.5 bg-slate-500/70 rounded-full"
                        style={{
                            position: 'absolute',
                            left: `${percentage}%`,
                            transform: 'translateX(-50%)',
                        }}
                    />
                );
            })}
          </div>
          <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={handleRangeChange}
              className="absolute w-full h-full rounded-lg appearance-none bg-transparent"
          />
        </div>
        <Tooltip content={`Increase ${label}`}>
          <button onClick={handleIncrement} disabled={value >= max} className={buttonClasses} aria-label={`Increase ${label}`}>
              <span aria-hidden="true" className="text-lg">➕</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};


const ColorPicker: React.FC<ColorPickerProps> = ({ 
  baseHsl, 
  baseHex,
  onBaseHslChange, 
  complementaryHues, 
  numComplementary, 
  onNumComplementaryChange,
  autoAdjustContrast,
  onAutoAdjustContrastChange,
  contrastTarget,
  onContrastTargetChange
}) => {
  
  const saturationGradient = { background: `linear-gradient(to right, hsl(${baseHsl.h}, 0%, ${baseHsl.l}%), hsl(${baseHsl.h}, 100%, ${baseHsl.l}%))`};
  const lightnessGradient = { background: `linear-gradient(to right, hsl(${baseHsl.h}, ${baseHsl.s}%, 0%), hsl(${baseHsl.h}, ${baseHsl.s}%, 50%), hsl(${baseHsl.h}, ${baseHsl.s}%, 100%))`};

  const colorCounts = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <ColorWheel 
          hue={baseHsl.h}
          saturation={baseHsl.s}
          lightness={baseHsl.l}
          onHueChange={(h) => onBaseHslChange({ ...baseHsl, h })}
          complementaryHues={complementaryHues}
        />
      </div>

      <HexImporter baseHex={baseHex} onBaseHslChange={onBaseHslChange} />

      <div className="space-y-3 pt-4 border-t border-slate-300/50 dark:border-slate-700">
        <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Complementary Colors</label>
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 p-1">
          {colorCounts.map(count => (
            <Tooltip key={count} content={`Generate ${count} complementary color${count > 1 ? 's' : ''}`}>
              <button
                onClick={() => onNumComplementaryChange(count)}
                className={`w-full px-2 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                  numComplementary === count
                    ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {count}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

       <div className="space-y-3 pt-4 border-t border-slate-300/50 dark:border-slate-700">
        <label className="font-medium text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🪄</span>
          <span>Auto Contrast Correction</span>
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 p-1">
            <Tooltip content="Enable automatic contrast correction">
              <button
                onClick={() => onAutoAdjustContrastChange(true)}
                className={`w-full px-2 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                  autoAdjustContrast
                    ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                On
              </button>
            </Tooltip>
            <Tooltip content="Disable automatic contrast correction">
              <button
                onClick={() => onAutoAdjustContrastChange(false)}
                className={`w-full px-2 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                  !autoAdjustContrast
                    ? 'bg-slate-400 dark:bg-slate-600 text-white shadow'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                Off
              </button>
            </Tooltip>
        </div>
        <div className={`grid grid-cols-2 gap-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 p-1 transition-opacity ${!autoAdjustContrast ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Tooltip content="Set target to WCAG AA (4.5:1)">
              <button
                onClick={() => onContrastTargetChange(4.5)}
                disabled={!autoAdjustContrast}
                aria-label="Set contrast target to WCAG AA"
                className={`w-full flex items-center justify-center px-2 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                  contrastTarget === 4.5
                    ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg" aria-hidden="true">🥈</span>
              </button>
            </Tooltip>
            <Tooltip content="Set target to WCAG AAA (7:1)">
              <button
                onClick={() => onContrastTargetChange(7.0)}
                disabled={!autoAdjustContrast}
                aria-label="Set contrast target to WCAG AAA"
                className={`w-full flex items-center justify-center px-2 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                  contrastTarget === 7.0
                    ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg" aria-hidden="true">🥇</span>
              </button>
            </Tooltip>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
           {`Automatically adjusts color lightness to meet at least WCAG ${contrastTarget === 4.5 ? 'AA (4.5:1)' : 'AAA (7:1)'} contrast.`}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-300/50 dark:border-slate-700 space-y-6">
        <Slider
          label="Saturation"
          value={baseHsl.s}
          onChange={(s) => onBaseHslChange({ ...baseHsl, s })}
          style={saturationGradient}
        />
        <Slider
          label="Lightness"
          value={baseHsl.l}
          onChange={(l) => onBaseHslChange({ ...baseHsl, l })}
          style={lightnessGradient}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
