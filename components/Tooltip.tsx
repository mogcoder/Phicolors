import React, { useState, useId, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // For the wrapper div
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      const margin = 8; // 8px viewport and trigger gap

      switch (position) {
        case 'bottom':
          top = triggerRect.bottom + margin;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - margin;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + margin;
          break;
        case 'top':
        default:
          top = triggerRect.top - tooltipRect.height - margin;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
      }

      // Keep tooltip within viewport bounds
      if (left < margin) {
        left = margin;
      }
      if (top < margin) {
        top = margin;
      }
      if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin;
      }
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = window.innerHeight - tooltipRect.height - margin;
      }

      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    }
  }, [isVisible, position]);
  
  const getArrowClasses = () => {
    switch(position) {
        case 'bottom': return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
        case 'left': return 'top-1/2 right-0 -translate-y-1/2 translate-x-1/2';
        case 'right': return 'top-1/2 left-0 -translate-y-1/2 -translate-x-1/2';
        case 'top':
        default: return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-flex items-center justify-center ${className || ''}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {React.cloneElement(children, {
        // FIX: ARIA attributes in React should be kebab-cased. Changed from camelCase to resolve the type error.
        'aria-describedby': content ? id : undefined,
      })}
      {isVisible && content && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          id={id}
          className="fixed z-[9999] w-max max-w-xs whitespace-nowrap px-2.5 py-1.5 text-xs font-semibold text-white dark:text-slate-900 bg-slate-800 dark:bg-slate-200 rounded-md shadow-lg pointer-events-none animate-fade-in-fast"
        >
          {content}
          <div 
             className={`absolute w-2 h-2 bg-slate-800 dark:bg-slate-200 rotate-45 ${getArrowClasses()}`}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;