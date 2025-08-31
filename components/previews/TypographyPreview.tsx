
import React from 'react';
import type { ColorMap } from '../../types';

interface TypographyPreviewProps {
  colorMap: ColorMap;
}

const TextSample: React.FC<{
  bg: string,
  text: string,
  heading: string,
  accent: string,
}> = ({ bg, text, heading, accent }) => (
  <div
    className="p-6 rounded-lg transition-colors duration-300 space-y-3 flex-1"
    style={{ backgroundColor: bg, color: text }}
  >
    <h1 className="text-3xl font-bold" style={{ color: heading }}>Aa - Heading 1</h1>
    <h2 className="text-2xl font-semibold">Aa - Heading 2</h2>
    <h3 className="text-xl font-medium">Aa - Heading 3</h3>
    <p className="text-base" style={{ opacity: 0.8 }}>
      The quick brown fox jumps over the lazy dog. This sentence contains all
      the letters of the alphabet, making it perfect for previewing typography.
      <a href="#" className="font-semibold underline ml-1" style={{color: accent}}>A text link</a>.
    </p>
  </div>
);


const TypographyPreview: React.FC<TypographyPreviewProps> = ({ colorMap }) => {
  // Helper to provide a fallback color.
  const c = (role: keyof ColorMap) => colorMap[role] || '#888888';

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <TextSample 
        bg={c('background')}
        text={c('textOnBackground')}
        heading={c('heading')}
        accent={c('primary')}
      />
      <TextSample 
        bg={c('surface')}
        text={c('textOnSurface')}
        heading={c('heading')}
        accent={c('secondary')}
      />
    </div>
  );
};

export default TypographyPreview;
