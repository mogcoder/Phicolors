

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { FullColor } from '../../types';
import { PhiLogoIcon } from '../icons/Icons';
import Tooltip from '../Tooltip';

interface LogoPreviewProps {
  palette: FullColor[];
}

const RadioButton: React.FC<{
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}> = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="form-radio h-4 w-4 text-slate-600 bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 focus:ring-slate-500"
    />
    {label}
  </label>
);

const ColorSelector: React.FC<{
  palette: FullColor[];
  selectedColor: string;
  onSelect: (hex: string) => void;
  label: string;
}> = ({ palette, selectedColor, onSelect, label }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</label>
        <div className="flex flex-wrap items-center gap-4 pt-1">
            {palette.map((color) => (
              <Tooltip key={color.hex} content={color.hex} position="bottom">
                <button
                    onClick={() => onSelect(color.hex)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-300 dark:focus:ring-offset-slate-900 focus:ring-slate-500 ${
                        selectedColor === color.hex ? 'ring-2 ring-slate-500 scale-110' : 'ring-1 ring-black/20'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Set color to ${color.hex}`}
                />
              </Tooltip>
            ))}
        </div>
    </div>
);

const AngleSlider: React.FC<{
  label: string;
  angle: number;
  onAngleChange: (angle: number) => void;
}> = ({ label, angle, onAngleChange }) => {
  const [inputValue, setInputValue] = useState(String(angle));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(String(angle));
    }
  }, [angle]);

  const handleInputBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      setInputValue(String(angle));
      return;
    }
    // Wrap value between 0-360
    let wrappedValue = ((numValue % 360) + 360) % 360;
    // If the original input was exactly 360, keep it as 360, otherwise it becomes 0
    if (numValue === 360) {
      wrappedValue = 360;
    }
    setInputValue(String(wrappedValue));
    if (wrappedValue !== angle) {
      onAngleChange(wrappedValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };
  
  const snapPoints = useMemo(() => [0, 45, 90, 135, 180, 225, 270, 315, 360], []);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let finalValue = Number(e.target.value);
    const SNAP_THRESHOLD = 5; // Degrees of tolerance for snapping

    for (const point of snapPoints) {
      if (Math.abs(finalValue - point) <= SNAP_THRESHOLD) {
        finalValue = point;
        break;
      }
    }
    onAngleChange(finalValue);
    setInputValue(String(finalValue)); // Sync input value immediately while dragging
  };
  
  const progress = (angle / 360) * 100;

  return (
    <div className="space-y-2 pt-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={0}
            max={360}
            className="w-20 text-center font-mono bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white pl-2 pr-6 py-1 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500"
            aria-label={`${label} value in degrees`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-sans text-slate-500 dark:text-slate-400">°</span>
        </div>
      </div>
      <div className="relative h-5 w-full flex items-center group">
        {/* Track Background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-lg bg-slate-300 dark:bg-slate-700">
           {/* Progress Fill */}
           <div 
                className="h-full rounded-l-lg bg-slate-500 dark:bg-slate-400"
                style={{ width: `${progress}%` }}
            />
        </div>
        {/* Snap Point Markers */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 flex items-center">
            {snapPoints.map((pointValue, index) => {
                const percentage = (pointValue / 360) * 100;
                return (
                    <div 
                        key={index}
                        className="w-1.5 h-1.5 bg-slate-500/70 dark:bg-slate-400/70 rounded-full transition-transform group-hover:scale-150"
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
            min={0}
            max={360}
            step={1}
            value={angle}
            onChange={handleRangeChange}
            className="absolute w-full h-full rounded-lg appearance-none bg-transparent cursor-pointer"
            aria-label={`${label} slider`}
        />
      </div>
    </div>
  );
};


const LogoPreview: React.FC<LogoPreviewProps> = ({ palette }) => {
    const [bgType, setBgType] = useState<'solid' | 'gradient'>('solid');
    const [logoType, setLogoType] = useState<'solid' | 'gradient'>('solid');

    const [bgSolidColor, setBgSolidColor] = useState<string>('#ffffff');
    const [bgGradientFrom, setBgGradientFrom] = useState<string>('#ffffff');
    const [bgGradientTo, setBgGradientTo] = useState<string>('#000000');
    const [bgGradientAngle, setBgGradientAngle] = useState(45);
    
    const [logoSolidColor, setLogoSolidColor] = useState<string>('#333333');
    const [logoGradientFrom, setLogoGradientFrom] = useState<string>('#ffffff');
    const [logoGradientTo, setLogoGradientTo] = useState<string>('#000000');
    const [logoGradientAngle, setLogoGradientAngle] = useState(45);
    
    useEffect(() => {
        if (palette.length > 0) {
            setBgSolidColor(palette[0].hex);
            setLogoSolidColor(palette.length > 2 ? palette[2].hex : palette[0].hex);
        } else {
             setBgSolidColor('#f1f5f9');
             setLogoSolidColor('#0f172a');
        }

        if (palette.length > 1) {
            setBgGradientFrom(palette[0].hex);
            setBgGradientTo(palette[1].hex);
            setLogoGradientFrom(palette[0].hex);
            setLogoGradientTo(palette[1].hex);
        } else if (palette.length === 1) {
            setBgGradientFrom(palette[0].hex);
            setBgGradientTo(palette[0].hex);
            setLogoGradientFrom(palette[0].hex);
            setLogoGradientTo(palette[0].hex);
        } else {
            setBgGradientFrom('#4f46e5');
            setBgGradientTo('#0ea5e9');
            setLogoGradientFrom('#4f46e5');
            setLogoGradientTo('#0ea5e9');
        }
    }, [palette]);


    const previewStyle = useMemo(() => {
        if (bgType === 'solid') {
            return { backgroundColor: bgSolidColor };
        } else {
            return { backgroundImage: `linear-gradient(${bgGradientAngle}deg, ${bgGradientFrom}, ${bgGradientTo})` };
        }
    }, [bgType, bgSolidColor, bgGradientFrom, bgGradientTo, bgGradientAngle]);

    return (
        <div className="space-y-6">
            <div
                className="w-full h-64 flex items-center justify-center rounded-lg shadow-inner transition-all duration-300"
                style={previewStyle}
            >
                {logoType === 'solid' ? (
                    <PhiLogoIcon className="w-32 h-32" style={{ color: logoSolidColor }} />
                ) : (
                    <PhiLogoIcon
                        className="w-32 h-32"
                        gradient={{
                            id: 'logo-preview-gradient',
                            colors: [logoGradientFrom, logoGradientTo],
                            angle: logoGradientAngle,
                        }}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-300/50 dark:border-slate-700">
                {/* Background Controls */}
                <div className="space-y-4 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Background Options</h3>
                    <div className="flex gap-4">
                        <RadioButton label="Solid" name="bg-type" value="solid" checked={bgType === 'solid'} onChange={() => setBgType('solid')} />
                        <RadioButton label="Gradient" name="bg-type" value="gradient" checked={bgType === 'gradient'} onChange={() => setBgType('gradient')} />
                    </div>
                    {bgType === 'solid' ? (
                        <ColorSelector palette={palette} selectedColor={bgSolidColor} onSelect={setBgSolidColor} label="Background Color" />
                    ) : (
                        <div className="space-y-3">
                            <ColorSelector palette={palette} selectedColor={bgGradientFrom} onSelect={setBgGradientFrom} label="From" />
                            <ColorSelector palette={palette} selectedColor={bgGradientTo} onSelect={setBgGradientTo} label="To" />
                            <AngleSlider label="Angle" angle={bgGradientAngle} onAngleChange={setBgGradientAngle} />
                        </div>
                    )}
                </div>

                {/* Logo Controls */}
                <div className="space-y-4 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Logo Options</h3>
                     <div className="flex gap-4">
                        <RadioButton label="Solid" name="logo-type" value="solid" checked={logoType === 'solid'} onChange={() => setLogoType('solid')} />
                        <RadioButton label="Gradient" name="logo-type" value="gradient" checked={logoType === 'gradient'} onChange={() => setLogoType('gradient')} />
                    </div>
                     {logoType === 'solid' ? (
                        <ColorSelector palette={palette} selectedColor={logoSolidColor} onSelect={setLogoSolidColor} label="Logo Color" />
                     ) : (
                        <div className="space-y-3">
                           <ColorSelector palette={palette} selectedColor={logoGradientFrom} onSelect={setLogoGradientFrom} label="From" />
                           <ColorSelector palette={palette} selectedColor={logoGradientTo} onSelect={setLogoGradientTo} label="To" />
                           <AngleSlider label="Angle" angle={logoGradientAngle} onAngleChange={setLogoGradientAngle} />
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default LogoPreview;