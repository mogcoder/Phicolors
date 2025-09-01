import React from 'react';

interface GradientProps {
  id: string;
  colors: [string, string];
  angle: number;
}
interface PhiLogoIconProps extends React.SVGProps<SVGSVGElement> {
  gradient?: GradientProps;
}
export const PhiLogoIcon: React.FC<PhiLogoIconProps> = ({ gradient, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" overflow="visible" viewBox="0 0 709 867"
        fill={gradient ? `url(#${gradient.id})` : "currentColor"}
        {...props}
    >
      {gradient && (
        <defs>
          <linearGradient id={gradient.id} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${gradient.angle}, 0.5, 0.5)`}>
            <stop offset="0%" stopColor={gradient.colors[0]} />
            <stop offset="100%" stopColor={gradient.colors[1]} />
          </linearGradient>
        </defs>
      )}
      <path d="M318 566.734V493.89c0-101.719 2-173.797 6.031-216.234 4.016-42.422 10.672-79.25 19.984-110.5 16.891-54.438 40.75-95.906 71.594-124.406S483.203 0 525.875 0c51.953 0 95.469 23.641 130.531 70.891C691.469 118.156 709 179.125 709 253.812c0 102.969-26.828 186.719-80.453 251.281S504.406 603.625 417 607v260h-99V607c-100.938-7.188-179.171-38.922-234.703-95.266C27.766 455.406 0 379.562 0 284.188c0-88.594 18.047-158.109 54.172-208.547C90.281 25.219 139.375 0 201.468 0c29.984 0 56.797 7.703 80.453 23.094s44.344 38.891 62.094 70.516l-31.094 19c-12.266-21.953-26.328-38.203-42.172-48.766S236.828 48 216.546 48c-35.938 0-61.5 17.422-76.718 52.25C124.609 135.094 117 194.938 117 279.812c0 83.609 17.109 149.906 51.359 198.891 34.234 48.985 84.109 78.328 149.641 88.031zM417 568c72.094 0 131.109-29.016 177.062-87.078S663 347.812 663 255.75c0-63.75-12.125-114.734-36.359-152.953-24.25-38.219-55.766-57.328-94.547-57.328-42.594 0-72.422 19.219-89.484 57.641C425.531 141.531 417 211.406 417 312.75V568z"/>
    </svg>
);

export const PhiSymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
    <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
    <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
    <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
    <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
    <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
  </svg>
);

export const AboutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const ContactIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
    <path d="M9.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
    <path d="M12.5 12a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
    <path d="M8.5 15a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
    <path d="M15.5 15a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
  </svg>
);

export const DribbbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
  </svg>
);

export const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const ExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
