

import React, { useState } from 'react';
import type { FullColor, ColorMap, ColorRole } from '../../types';
import UIKitPreview from './UIKitPreview';
import TypographyPreview from './TypographyPreview';
import GradientsPreview from './GradientsPreview';
import ThemeMapper from './ThemeMapper';
import LogoPreview from './LogoPreview';

interface PreviewAreaProps {
  palette: FullColor[];
  colorMap: ColorMap | null;
  onColorMapChange: (role: ColorRole, hex: string) => void;
  onResetMap: () => void;
}

type PreviewTab = 'ui' | 'typography' | 'gradients' | 'logo';

const PreviewArea: React.FC<PreviewAreaProps> = ({ palette, colorMap, onColorMapChange, onResetMap }) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('ui');

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: 'ui', label: 'UI Kit' },
    { id: 'typography', label: 'Typography' },
    { id: 'gradients', label: 'Gradients' },
    { id: 'logo', label: 'Logo' },
  ];

  const renderActiveTab = () => {
    if (!colorMap) return <div className="text-center text-slate-500 dark:text-slate-400">Loading color map...</div>;

    switch (activeTab) {
      case 'ui':
        return <UIKitPreview colorMap={colorMap} />;
      case 'typography':
        return <TypographyPreview colorMap={colorMap} />;
      case 'gradients':
        return <GradientsPreview palette={palette} />; // Gradients still use the raw palette
      case 'logo':
        return <LogoPreview palette={palette} />;
      default:
        return <UIKitPreview colorMap={colorMap} />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {colorMap && (
        <ThemeMapper 
          palette={palette} 
          colorMap={colorMap} 
          onColorMapChange={onColorMapChange} 
          onResetMap={onResetMap}
        />
      )}
      <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/50 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🖥️</span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Preview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-full bg-slate-300/60 dark:bg-slate-900/60 p-1 self-start sm:self-center">
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
        </div>
        <div className="pt-4 border-t border-slate-300/50 dark:border-slate-700">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default PreviewArea;
