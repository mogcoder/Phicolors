import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

const ThemeToggle: React.FC = () => {
    // Initialize state from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('phicolors-theme')) {
            return localStorage.getItem('phicolors-theme') === 'dark';
        }
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Effect to update the DOM and localStorage when state changes
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('phicolors-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('phicolors-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    const NavButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode }> = ({ onClick, ariaLabel, children }) => (
        <button
          onClick={onClick}
          className="p-2.5 bg-white/10 dark:bg-slate-800/20 hover:bg-white/20 dark:hover:bg-slate-700/40 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-slate-900 focus:ring-slate-500"
          aria-label={ariaLabel}
        >
            {children}
        </button>
    );

    return (
        <Tooltip content={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
            <NavButton onClick={toggleTheme} ariaLabel="Toggle dark mode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20" height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="theme-toggle-icon overflow-visible"
                >
                  <mask id="moon-mask-svg">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <circle cx="12" cy="4" r="9" fill="black" className="theme-toggle-moon-mask" />
                  </mask>

                  <circle cx="12" cy="12" r="5" className="theme-toggle-sun-body" mask="url(#moon-mask-svg)" />
                  
                  <g className="theme-toggle-sun-rays" stroke="currentColor">
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </g>
                </svg>
            </NavButton>
        </Tooltip>
    );
};

export default ThemeToggle;
