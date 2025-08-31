

import React, { useMemo } from 'react';
import type { FullColor, ColorMap, ColorRole } from '../../types';
import Tooltip from '../Tooltip';

interface ThemeMapperProps {
  palette: FullColor[];
  colorMap: ColorMap;
  onColorMapChange: (role: ColorRole, hex: string) => void;
  onResetMap: () => void;
}

const colorRoles: { role: ColorRole; label: string }[] = [
    { role: 'background', label: 'Background' },
    { role: 'surface', label: 'Surface' },
    { role: 'primary', label: 'Primary' },
    { role: 'secondary', label: 'Secondary' },
    { role: 'heading', label: 'Heading Text' },
    { role: 'textOnBackground', label: 'Body Text' },
    { role: 'textOnSurface', label: 'Surface Text' },
    { role: 'textOnPrimary', label: 'Button Text' },
];


const ThemeMapper: React.FC<ThemeMapperProps> = ({ palette, colorMap, onColorMapChange, onResetMap }) => {
    
    // Add two generic text colors to the palette for selection and de-duplicate the entire list.
    const selectableColors = useMemo(() => {
        const textColors: FullColor[] = [
            { hex: '#f8fafc', hsl: { h: 210, s: 17, l: 98 }, rgb: { r: 248, g: 250, b: 252 } }, // slate-50
            { hex: '#0f172a', hsl: { h: 222, s: 47, l: 11 }, rgb: { r: 15, g: 23, b: 42 } }, // slate-900
        ];

        const combined = [...palette, ...textColors];
        const uniqueHexes = new Set<string>();
        return combined.filter(color => {
            if (!uniqueHexes.has(color.hex)) {
                uniqueHexes.add(color.hex);
                return true;
            }
            return false;
        });
    }, [palette]);

    return (
        <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/50 backdrop-blur-xl space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">🖌️</span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Theme Mapper</h2>
                </div>
                <Tooltip content="Reset all color roles to their default assignments">
                  <button
                      onClick={onResetMap}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-300/60 dark:bg-slate-900/60 hover:bg-slate-300 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500"
                  >
                      <span className="text-base" aria-hidden="true">🔄</span>
                      <span>Revert Changes</span>
                  </button>
                </Tooltip>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Manually assign colors from your palette to different UI roles for a custom theme. The preview will update instantly.
            </p>
            <div className="pt-4 border-t border-slate-300/50 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {colorRoles.map(({ role, label }) => (
                    <div key={role} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-300/40 dark:hover:bg-slate-900/40 transition-colors">
                        <label className="font-semibold text-slate-700 dark:text-slate-200 w-28 flex-shrink-0">{label}</label>
                        <div className="flex-grow flex items-center gap-2">
                            {selectableColors.map((color, index) => (
                                <Tooltip key={`${color.hex}-${index}`} content={color.hex} position="bottom">
                                  <button
                                      onClick={() => onColorMapChange(role, color.hex)}
                                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500 ${
                                          colorMap[role] === color.hex ? 'ring-2 ring-slate-500 scale-110' : 'ring-1 ring-black/20'
                                      }`}
                                      style={{ backgroundColor: color.hex }}
                                      aria-label={`Set ${label} to ${color.hex}`}
                                  />
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeMapper;
