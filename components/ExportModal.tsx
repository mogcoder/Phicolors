import React, { useState, useMemo, useCallback } from 'react';
import Modal from './Modal';
import CodeBlock from './CodeBlock';
import type { FullColor, ColorMap, ColorRole } from '../types';
import { mixColorsGoldenMean, rgbToHsl, rgbToHex } from '../utils/colorUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: FullColor[];
  colorMap: ColorMap | null;
}

type ExportTab = 'image' | 'css' | 'scss' | 'figma';

const camelCaseToKebab = (str: string) => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, palette, colorMap }) => {
    const [activeTab, setActiveTab] = useState<ExportTab>('css');

    const tabs: { id: ExportTab; label: string }[] = [
        { id: 'css', label: 'CSS' },
        { id: 'scss', label: 'SCSS' },
        { id: 'figma', label: 'Figma Tokens' },
        { id: 'image', label: 'Image' },
    ];

    const cssCode = useMemo(() => {
        if (!colorMap) return '/* Color map is not available. Please select a harmony. */';
        const variables = Object.entries(colorMap)
            .map(([role, hex]) => `  --${camelCaseToKebab(role)}: ${hex};`)
            .join('\n');
        return `:root {\n${variables}\n}`;
    }, [colorMap]);

    const scssCode = useMemo(() => {
        if (!colorMap) return '// Color map is not available. Please select a harmony.';
        return Object.entries(colorMap)
            .map(([role, hex]) => `$${camelCaseToKebab(role)}: ${hex};`)
            .join('\n');
    }, [colorMap]);

    const figmaJsonCode = useMemo(() => {
        if (!colorMap) return '{\n  "error": "Color map is not available. Please select a harmony."\n}';
        const tokens: Record<string, { $value: string, $type: string }> = {};
        for (const [role, hex] of Object.entries(colorMap)) {
            tokens[role] = {
                $value: hex,
                $type: 'color'
            };
        }
        return JSON.stringify({ phicolors: { color: tokens } }, null, 2);
    }, [colorMap]);

     const handleExportImage = useCallback(() => {
        if (palette.length === 0) return;
        
        const [baseColor, ...complementaryColors] = palette;

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
    }, [palette]);


    const renderContent = () => {
        switch (activeTab) {
            case 'css':
                return <CodeBlock code={cssCode} />;
            case 'scss':
                return <CodeBlock code={scssCode} />;
            case 'figma':
                return <CodeBlock code={figmaJsonCode} />;
            case 'image':
                return (
                    <div className="text-center space-y-4">
                         <p className="text-slate-600 dark:text-slate-400">
                           Export the current base color, complementary colors, and their golden mean mixes as a high-quality PNG image.
                        </p>
                        <button
                            onClick={handleExportImage}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 dark:bg-slate-200 hover:bg-slate-600 dark:hover:bg-slate-300 text-white dark:text-slate-800 font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-slate-500"
                        >
                            <span className="text-lg" aria-hidden="true">🖼️</span>
                            <span>Download PNG</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Palette & Code">
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-full bg-slate-200/60 dark:bg-slate-800/80 p-1">
                    {tabs.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500 ${
                                activeTab === id
                                ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                 <div className="pt-4">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
