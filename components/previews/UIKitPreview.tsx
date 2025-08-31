
import React from 'react';
import type { ColorMap } from '../../types';

interface UIKitPreviewProps {
  colorMap: ColorMap;
}

const UIKitPreview: React.FC<UIKitPreviewProps> = ({ colorMap }) => {
  // Helper to provide a fallback color if the map is somehow incomplete.
  const c = (role: keyof ColorMap) => colorMap[role] || '#888888';

  return (
    <div
      className="p-6 rounded-lg transition-colors duration-300"
      style={{ backgroundColor: c('background'), color: c('textOnBackground') }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold" style={{ color: c('heading') }}>Project Dashboard</h3>
          <p style={{ opacity: 0.8 }}>
            A preview of your new color palette.
          </p>
        </div>

        <div
          className="p-4 rounded-lg space-y-4 shadow-md"
          style={{ backgroundColor: c('surface'), color: c('textOnSurface') }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color: c('primary') }} aria-hidden="true">✔</span>
            <h4 className="font-semibold">User Interface Elements</h4>
          </div>
          <p className="text-sm" style={{ opacity: 0.8 }}>
            These are examples of how your colors will look on different components.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-transform hover:scale-105"
              style={{ backgroundColor: c('primary'), color: c('textOnPrimary') }}
            >
              Primary Button
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:bg-black/10"
              style={{
                borderColor: c('secondary'),
                color: c('secondary'),
                borderWidth: '2px',
              }}
            >
              Secondary Button
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Example input field..."
              className="w-full px-3 py-2 rounded-lg text-sm bg-black/10 placeholder:text-current placeholder:opacity-60 outline-none"
              style={{ 
                color: c('textOnSurface'),
                borderColor: c('secondary'), 
                borderWidth: '1px',
             }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIKitPreview;
