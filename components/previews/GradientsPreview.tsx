

import React, { useState } from 'react';
import type { FullColor } from '../../types';
import Tooltip from '../Tooltip';

interface GradientsPreviewProps {
  palette: FullColor[];
}

const GradientCard: React.FC<{ from: string; to: string; angle?: string }> = ({ from, to, angle = '45deg' }) => {
    const [copied, setCopied] = useState(false);
    const gradientStyle = {
        backgroundImage: `linear-gradient(${angle}, ${from}, ${to})`,
    };
    const cssToCopy = `background-image: linear-gradient(${angle}, ${from}, ${to});`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div
            className="relative w-full aspect-video rounded-lg shadow-md animated-bg group"
            style={gradientStyle}
        >
            <Tooltip content="Copy CSS Gradient" position="left" className="absolute top-2 right-2">
              <button
                  onClick={handleCopy}
                  aria-label="Copy CSS Gradient"
                  className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                  {copied ? (
                      <span className="text-lg" aria-hidden="true">✅</span>
                  ) : (
                      <span className="text-lg font-mono font-bold" aria-hidden="true">&lt;/&gt;</span>
                  )}
              </button>
            </Tooltip>
        </div>
    );
};

const GradientsPreview: React.FC<GradientsPreviewProps> = ({ palette }) => {
    if (palette.length < 2) {
        return (
            <div className="text-center text-slate-500 dark:text-slate-400">
                Need at least 2 colors to generate gradients.
            </div>
        );
    }
    
    // Create pairs of colors for gradients
    const gradients = [];
    for (let i = 0; i < palette.length - 1; i++) {
        gradients.push({ from: palette[i].hex, to: palette[i+1].hex });
    }
    // Add a gradient from the last color back to the first
    if (palette.length > 2) {
        gradients.push({ from: palette[palette.length - 1].hex, to: palette[0].hex });
    }
     // Add a gradient from the first to the last
    if (palette.length > 2) {
         gradients.push({ from: palette[0].hex, to: palette[palette.length - 1].hex });
    }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {gradients.map((grad, index) => (
        <GradientCard key={index} from={grad.from} to={grad.to} />
      ))}
       {palette.length > 2 && (
         <GradientCard from={palette[0].hex} to={palette[2].hex} angle="90deg" />
       )}
       {palette.length > 3 && (
         <GradientCard from={palette[1].hex} to={palette[3].hex} angle="to bottom right" />
       )}
    </div>
  );
};

export default GradientsPreview;
