


import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { HSLColor, FullColor, ColorMap, ColorRole } from './types';
import { generateGoldenRatioPaletteHues, hslToRgb, rgbToHex, adjustLightnessForContrast, createDefaultColorMap, generateHarmonyPalette, Harmony, mixColorsGoldenMean, rgbToHsl } from './utils/colorUtils';
import ColorPicker from './components/ColorPicker';
import ColorSwatch from './components/ColorSwatch';
import Header from './components/Header';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import HarmonySuggestions from './components/HarmonySuggestions';
import PreviewArea from './components/previews/PreviewArea';
import Tooltip from './components/Tooltip';
import GoldenRatioModal from './components/GoldenRatioModal';

/**
 * Generates and optionally corrects a full color palette.
 * This is a pure function, moved outside the component to prevent closure issues.
 */
const generatePalette = (base: HSLColor, num: number, autoAdjust: boolean, targetRatio: number): FullColor[] => {
    const hues = generateGoldenRatioPaletteHues(base.h, num);
    const baseRgb = hslToRgb(base.h, base.s, base.l);

    return hues.map(hue => {
        let hsl: HSLColor = { h: hue, s: base.s, l: base.l };

        if (autoAdjust) {
          hsl = adjustLightnessForContrast(hsl, baseRgb, targetRatio);
        }

        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        return { hsl, rgb, hex };
    });
};

const App: React.FC = () => {
  const [baseHsl, setBaseHsl] = useState<HSLColor>({ h: 173, s: 83, l: 59 });
  const [numComplementary, setNumComplementary] = useState<number>(3);
  const [complementaryColors, setComplementaryColors] = useState<FullColor[]>([]);
  const [autoAdjustContrast, setAutoAdjustContrast] = useState<boolean>(true);
  const [contrastTarget, setContrastTarget] = useState<number>(4.5);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isGoldenRatioModalOpen, setIsGoldenRatioModalOpen] = useState(false);
  
  const [harmonyKey, setHarmonyKey] = useState(0);
  const [colorMap, setColorMap] = useState<ColorMap | null>(null);
  const [activeHarmony, setActiveHarmony] = useState<Harmony | 'current'>('current');

  const baseColor = useMemo<FullColor>(() => {
    const rgb = hslToRgb(baseHsl.h, baseHsl.s, baseHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hsl: baseHsl, rgb, hex };
  }, [baseHsl]);
  
  const fullColorPalette = useMemo(() => [baseColor, ...complementaryColors], [baseColor, complementaryColors]);
  
  const previewPalette = useMemo(() => {
    if (activeHarmony === 'current') return null;
    return generateHarmonyPalette(baseColor.hsl, activeHarmony);
  }, [activeHarmony, baseColor]);

  const activePalette = useMemo(() => previewPalette || fullColorPalette, [previewPalette, fullColorPalette]);

  // Effect to regenerate the Golden Ratio palette when controls are changed.
  useEffect(() => {
    const newComplementary = generatePalette(baseHsl, numComplementary, autoAdjustContrast, contrastTarget);
    setComplementaryColors(newComplementary);
  }, [baseHsl, numComplementary, autoAdjustContrast, contrastTarget]);
  
  // Effect to regenerate the default theme map when the harmony type is changed or a major palette version changes.
  useEffect(() => {
    if (activePalette.length > 0) {
      setColorMap(createDefaultColorMap(activePalette));
    }
  }, [activeHarmony, harmonyKey, activePalette]);

  // This effect automatically triggers a theme map update for the 'current' palette
  // whenever the palette is programmatically changed (e.g., by sliders, contrast toggles).
  // It uses a ref to compare the previous and current palette state to avoid unwanted triggers.
  // FIX: Initialize useRef with null to prevent potential issues with tooling or React versions.
  const prevFullPaletteRef = useRef<string | null>(null);
  useEffect(() => {
      const currentPaletteJSON = JSON.stringify(fullColorPalette);
      // We only trigger a reset if the palette has changed AND the user is on the 'current' tab.
      if (activeHarmony === 'current' && prevFullPaletteRef.current && prevFullPaletteRef.current !== currentPaletteJSON) {
          setHarmonyKey(k => k + 1);
      }
      // Update the ref for the next render.
      prevFullPaletteRef.current = currentPaletteJSON;
  }, [fullColorPalette, activeHarmony]);


  const handleBaseHslChange = (newHsl: HSLColor) => {
    setBaseHsl(newHsl);
    // A change to the base color is a fundamental palette alteration that affects
    // all harmony suggestions, so it should always trigger a theme map reset.
    setHarmonyKey(k => k + 1);
  };
  
  const handleComplementaryColorChange = (index: number, newHsl: HSLColor) => {
    setComplementaryColors(prevColors => {
        const newColors = [...prevColors];
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        newColors[index] = { hsl: newHsl, rgb: newRgb, hex: newHex };
        return newColors;
    });
  };

  const handleNumComplementaryChange = (count: number) => {
    setNumComplementary(count);
  };
  
  const handleAutoAdjustContrastChange = (enabled: boolean) => {
    setAutoAdjustContrast(enabled);
  };

  const handleContrastTargetChange = (target: number) => {
    setContrastTarget(target);
  };


  const handleSavePalette = () => {
    if (fullColorPalette.length === 0) return;
    const dataStr = JSON.stringify(fullColorPalette, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const baseHex = fullColorPalette[0].hex.substring(1);
    link.download = `phicolors-palette-${baseHex}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExportImage = () => {
    const mixedColors = complementaryColors.map(compColor => {
      const mixedRgb = mixColorsGoldenMean(baseColor.rgb, compColor.rgb);
      const mixedHsl = rgbToHsl(mixedRgb.r, mixedRgb.g, mixedRgb.b);
      const mixedHex = rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
      return { hsl: mixedHsl, rgb: mixedRgb, hex: mixedHex };
    });

    const PADDING = 50;
    const SWATCH_SIZE = 150;
    const GAP = 30;
    const SECTION_TITLE_MARGIN_BOTTOM = 20;
    const SECTION_GAP = 60;
    const HEX_CODE_MARGIN_TOP = 15;
    
    const FONT_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
    const FONT_H1 = `bold 32px ${FONT_STACK}`;
    const FONT_H2 = `bold 24px ${FONT_STACK}`;
    const FONT_HEX = `18px ${FONT_STACK}`;

    const H1_HEIGHT = 40;
    const H2_HEIGHT = 30;
    const HEX_HEIGHT = 20;
    
    const BG_COLOR = '#f8fafc';
    const TEXT_COLOR = '#0f172a';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const sections = [
      { title: 'Base Color', colors: [baseColor] },
      { title: 'Complementary Colors', colors: complementaryColors },
      { title: 'Golden Mean Mixes', colors: mixedColors },
    ].filter(s => s.colors.length > 0);

    const maxSwatchesInRow = Math.max(...sections.map(s => s.colors.length));
    const contentWidth = maxSwatchesInRow * SWATCH_SIZE + (maxSwatchesInRow - 1) * GAP;
    const canvasWidth = PADDING * 2 + contentWidth;

    let totalHeight = PADDING;
    totalHeight += H1_HEIGHT;
    totalHeight += SECTION_GAP;

    sections.forEach((section, index) => {
        totalHeight += H2_HEIGHT;
        totalHeight += SECTION_TITLE_MARGIN_BOTTOM;
        totalHeight += SWATCH_SIZE;
        totalHeight += HEX_CODE_MARGIN_TOP;
        totalHeight += HEX_HEIGHT;
        if (index < sections.length - 1) {
            totalHeight += SECTION_GAP;
        }
    });
    totalHeight += PADDING;

    canvas.width = canvasWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = FONT_H1;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText('PhiColors Palette', canvas.width / 2, PADDING + H1_HEIGHT / 2);
    
    let currentY = PADDING + H1_HEIGHT + SECTION_GAP;
    
    sections.forEach(section => {
      const sectionWidth = section.colors.length * SWATCH_SIZE + (section.colors.length - 1) * GAP;
      const startX = (canvas.width - sectionWidth) / 2;

      ctx.font = FONT_H2;
      ctx.fillStyle = TEXT_COLOR;
      ctx.textAlign = 'left';
      ctx.fillText(section.title, startX, currentY + H2_HEIGHT / 2);
      currentY += H2_HEIGHT + SECTION_TITLE_MARGIN_BOTTOM;

      section.colors.forEach((color, i) => {
        const x = startX + i * (SWATCH_SIZE + GAP);
        const y = currentY;

        ctx.fillStyle = color.hex;
        ctx.fillRect(x, y, SWATCH_SIZE, SWATCH_SIZE);
        
        ctx.font = FONT_HEX;
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText(color.hex, x + SWATCH_SIZE / 2, y + SWATCH_SIZE + HEX_CODE_MARGIN_TOP + HEX_HEIGHT / 2);
      });
      
      currentY += SWATCH_SIZE + HEX_CODE_MARGIN_TOP + HEX_HEIGHT + SECTION_GAP;
    });

    const link = document.createElement('a');
    link.download = `phicolors-palette-${baseColor.hex.substring(1)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleLoadPalette = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File content is not readable.');
        const data: FullColor[] = JSON.parse(text);
        if (!Array.isArray(data) || data.length === 0 || !data[0].hsl || typeof data[0].hsl.h !== 'number' || typeof data[0].hsl.s !== 'number' || typeof data[0].hsl.l !== 'number') {
          throw new Error('Invalid palette file format.');
        }
        
        const [newBase, ...newComplementary] = data;
        const newNumComplementary = newComplementary.length;

        if (newNumComplementary < 0 || newNumComplementary > 4) throw new Error('Palette must contain between 1 and 5 colors.');
        
        setBaseHsl(newBase.hsl);
        setNumComplementary(newNumComplementary);
        setComplementaryColors(newComplementary);
        setActiveHarmony('current'); // Reset harmony view to current
        setHarmonyKey(k => k + 1); // Force remount of HarmonySuggestions and trigger colorMap reset

      } catch (error) {
        console.error('Failed to load palette:', error);
        alert('Failed to load palette. Please ensure it is a valid JSON file in the correct format.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleColorMapChange = (role: ColorRole, hex: string) => {
    setColorMap(prevMap => prevMap ? { ...prevMap, [role]: hex } : null);
  };

  const handleResetMap = () => {
    // We re-trigger the main useEffect by changing its dependency, ensuring the logic is centralized.
    setHarmonyKey(k => k + 1);
  };


  return (
    <div className="text-slate-800 dark:text-slate-200">
      <Header 
        onAboutClick={() => setIsAboutModalOpen(true)}
        onContactClick={() => setIsContactModalOpen(true)}
        onGoldenRatioClick={() => setIsGoldenRatioModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] xl:grid-cols-[580px_1fr] 2xl:grid-cols-[1060px_1fr] h-screen pt-20">
        {/* --- Control Panel (Sidebar) --- */}
        <aside className="lg:h-[calc(100vh-5rem)] lg:overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 lg:border-r lg:border-slate-300/50 dark:lg:border-slate-800/50">
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                {/* --- Column 1: Picker & Actions --- */}
                <div className="space-y-6 relative z-10">
                    <div className="bg-slate-200/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/50 backdrop-blur-xl">
                         <ColorPicker 
                          baseHsl={baseHsl} 
                          baseHex={baseColor.hex}
                          onBaseHslChange={handleBaseHslChange}
                          complementaryHues={complementaryColors.map(c => c.hsl.h)}
                          numComplementary={numComplementary}
                          onNumComplementaryChange={handleNumComplementaryChange}
                          autoAdjustContrast={autoAdjustContrast}
                          onAutoAdjustContrastChange={handleAutoAdjustContrastChange}
                          contrastTarget={contrastTarget}
                          onContrastTargetChange={handleContrastTargetChange}
                        />
                    </div>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Tooltip content="Save the current palette as a JSON file.">
                          <button
                            onClick={handleSavePalette}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-slate-500"
                          >
                            <span className="text-lg" aria-hidden="true">💾</span>
                            <span>Save</span>
                          </button>
                        </Tooltip>

                        <Tooltip content="Export palette as a PNG image.">
                          <button
                            onClick={handleExportImage}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-slate-500"
                          >
                            <span className="text-lg" aria-hidden="true">🖼️</span>
                            <span>Export</span>
                          </button>
                        </Tooltip>
                        
                        <Tooltip content="Import a palette from a JSON file.">
                          <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full transition-colors duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-100 dark:focus-within:ring-offset-slate-900 focus-within:ring-slate-500">
                            <span className="text-lg" aria-hidden="true">📂</span>
                            <span>Import</span>
                            <input type="file" accept=".json,application/json" className="hidden" onChange={handleLoadPalette} />
                          </label>
                        </Tooltip>
                    </div>
                </div>

                {/* --- Column 2: Color Palette Swatches --- */}
                <div className="w-full space-y-4 relative">
                    <ColorSwatch isBaseColor={true} color={baseColor} />
                    {complementaryColors.map((color, index) => (
                      <ColorSwatch 
                          key={index}
                          isBaseColor={false}
                          color={color}
                          baseColor={baseColor}
                          onColorChange={(newHsl) => handleComplementaryColorChange(index, newHsl)}
                          autoAdjustContrast={autoAdjustContrast}
                      />
                    ))}
                </div>
            </div>
        </aside>

        {/* --- Main Preview Area --- */}
        <main className="lg:h-[calc(100vh-5rem)] lg:overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <HarmonySuggestions 
                key={harmonyKey}
                baseColor={baseColor}
                currentPalette={fullColorPalette}
                activeTab={activeHarmony}
                onTabChange={setActiveHarmony}
            />
            <PreviewArea 
                palette={activePalette}
                colorMap={colorMap}
                onColorMapChange={handleColorMapChange}
                onResetMap={handleResetMap}
            />
        </main>
      </div>

      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <GoldenRatioModal isOpen={isGoldenRatioModalOpen} onClose={() => setIsGoldenRatioModalOpen(false)} />
    </div>
  );
};

export default App;