import React from 'react';
import { PhiLogoIcon, AboutIcon, ContactIcon, PhiSymbolIcon } from './icons/Icons';
import Tooltip from './Tooltip';

interface HeaderProps {
    onAboutClick: () => void;
    onContactClick: () => void;
    onGoldenRatioClick: () => void;
}

const NavButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode }> = ({ onClick, ariaLabel, children }) => (
    <button
      onClick={onClick}
      className="p-2.5 bg-white/10 dark:bg-slate-800/20 hover:bg-white/20 dark:hover:bg-slate-700/40 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500"
      aria-label={ariaLabel}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ onAboutClick, onContactClick, onGoldenRatioClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500">
        <div className="absolute inset-0 bg-slate-200/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-300/50 dark:border-slate-800/50"></div>
        <nav className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 h-20 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <PhiLogoIcon className="w-10 h-12 text-slate-800 dark:text-slate-200"/>
                <div className="hidden sm:block">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">PhiColors</h1>
                    <p className="text-sm font-semibold tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400">Golden Colors</p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <Tooltip content="The Golden Ratio">
                  <NavButton onClick={onGoldenRatioClick} ariaLabel="Learn about the Golden Ratio">
                    <PhiSymbolIcon className="w-5 h-5" />
                  </NavButton>
                </Tooltip>
                <Tooltip content="About PhiColors">
                  <NavButton onClick={onAboutClick} ariaLabel="About the application">
                    <AboutIcon className="w-5 h-5" />
                  </NavButton>
                </Tooltip>
                <Tooltip content="Contact Us">
                  <NavButton onClick={onContactClick} ariaLabel="Contact us">
                      <ContactIcon className="w-5 h-5" />
                  </NavButton>
                </Tooltip>
            </div>
        </nav>
    </header>
  );
};

export default Header;