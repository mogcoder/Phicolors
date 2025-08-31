

import React, { useMemo, useState } from 'react';
import type { FullColor } from '../types';
import { generateHarmonyPalette, Harmony } from '../utils/colorUtils';
import Tooltip from './Tooltip';

interface HarmonySuggestionsProps {
  baseColor: FullColor;
  currentPalette: FullColor[];
  activeTab: Harmony | 'current';
  onTabChange: (tab: Harmony | 'current') => void;
}

const harmonyTabs: { id: Harmony; label: string }[] = [
    { id: 'analogous', label: 'Analogous' },
    { id: 'monochromatic', label: 'Monochromatic' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'complementary', label: 'Complementary' },
    { id: 'split-complementary', label: 'Split Complementary' },
];

const currentPaletteTab = { id: 'current' as const, label: 'Current' };
const allTabs = [currentPaletteTab, ...harmonyTabs];

const ColorBlock: React.FC<{ color: FullColor }> = ({ color }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent any parent handlers from firing
        navigator.clipboard.writeText(color.hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="group relative h-10 flex-1 rounded-lg shadow-inner transition-all duration-300 flex items-center justify-center"
            style={{ backgroundColor: color.hex }}
            title={color.hex}
        >
            <Tooltip content={copied ? "Copied!" : `Copy ${color.hex}`} className="absolute inset-0 flex items-center justify-center">
              <button
                  onClick={handleCopy}
                  aria-label={`Copy color ${color.hex}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                  {copied ? (
                      <span className="text-lg" aria-hidden="true">✅</span>
                  ) : (
                      <span className="text-lg" aria-hidden="true">📋</span>
                  )}
              </button>
            </Tooltip>
        </div>
    );
};


const HarmonySuggestions: React.FC<HarmonySuggestionsProps> = ({ baseColor, currentPalette, activeTab, onTabChange }) => {

    const displayedPalette = useMemo(() => {
        if (activeTab === 'current') {
            return currentPalette;
        }
        return generateHarmonyPalette(baseColor.hsl, activeTab);
    }, [baseColor, activeTab, currentPalette]);

    const handleExport = () => {
        const palette = displayedPalette;
        const harmonyName = allTabs.find(t => t.id === activeTab)?.label || 'Palette';
        
        if (palette.length === 0) return;
    
        const PADDING = 40;
        const SWATCH_WIDTH = 150;
        const SWATCH_HEIGHT = 120;
        const GAP = 25;
        const TITLE_MARGIN_BOTTOM = 30;
        const HEX_CODE_MARGIN_TOP = 15;
        
        const FONT_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
        const FONT_H1 = `bold 24px ${FONT_STACK}`;
        const FONT_HEX = `18px ${FONT_STACK}`;
    
        const H1_HEIGHT = 30;
        const HEX_HEIGHT = 20;
        
        const BG_COLOR = '#f8fafc';
        const TEXT_COLOR = '#0f172a';
    
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const contentWidth = palette.length * SWATCH_WIDTH + (palette.length - 1) * GAP;
        canvas.width = PADDING * 2 + Math.max(contentWidth, 400); // Ensure a minimum width
        canvas.height = PADDING * 2 + H1_HEIGHT + TITLE_MARGIN_BOTTOM + SWATCH_HEIGHT + HEX_CODE_MARGIN_TOP + HEX_HEIGHT;
    
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.font = FONT_H1;
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        const title = `PhiColors - ${harmonyName} Harmony`;
        ctx.fillText(title, canvas.width / 2, PADDING + H1_HEIGHT / 2);
        
        const startY = PADDING + H1_HEIGHT + TITLE_MARGIN_BOTTOM;
        const startX = (canvas.width - contentWidth) / 2;
    
        palette.forEach((color, i) => {
            const x = startX + i * (SWATCH_WIDTH + GAP);
            
            ctx.fillStyle = color.hex;
            ctx.fillRect(x, startY, SWATCH_WIDTH, SWATCH_HEIGHT);
            
            ctx.font = FONT_HEX;
            ctx.fillStyle = TEXT_COLOR;
            ctx.textAlign = 'center';
            ctx.fillText(color.hex, x + SWATCH_WIDTH / 2, startY + SWATCH_HEIGHT + HEX_CODE_MARGIN_TOP + HEX_HEIGHT / 2);
        });
    
        const link = document.createElement('a');
        const fileName = `phicolors-harmony-${harmonyName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/50 backdrop-blur-xl space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-2xl" aria-hidden="true">🎨</span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Harmony Suggestions</h2>
                    <Tooltip content="Export this harmony as a PNG image">
                        <button
                            onClick={handleExport}
                            className="p-2 bg-slate-300/60 dark:bg-slate-900/60 hover:bg-slate-300 dark:hover:bg-slate-700/80 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500"
                            aria-label="Export harmony as PNG"
                        >
                            <span className="text-lg" aria-hidden="true">🖼️</span>
                        </button>
                    </Tooltip>
                </div>
                <div className="flex items-center justify-center gap-2 p-1 rounded-full bg-slate-300/60 dark:bg-slate-900/60 overflow-x-auto">
                    {allTabs.map(({ id, label }) => (
                         <button
                            key={id}
                            onClick={() => onTabChange(id)}
                            className={`flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500 ${
                                activeTab === id
                                ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-300/50 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    {displayedPalette.map((color, index) => (
                        <ColorBlock 
                            key={`${color.hex}-${index}`}
                            color={color}
                         />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HarmonySuggestions;