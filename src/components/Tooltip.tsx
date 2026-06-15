import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// Coordinated delay manager module-level variables
let globalLastActiveTooltipTime = 0;
let globalActiveTooltipCount = 0;

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [isInstant, setIsInstant] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, position: 'top' });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const visibleRef = useRef(visible);

  // Sync visible ref for unmount cleanup
  React.useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (visibleRef.current) {
        globalActiveTooltipCount = Math.max(0, globalActiveTooltipCount - 1);
        globalLastActiveTooltipTime = Date.now();
      }
    };
  }, []);

  const showTooltip = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const now = Date.now();
    const timeSinceLastActive = now - globalLastActiveTooltipTime;
    const isCloseSequence = globalActiveTooltipCount > 0 || timeSinceLastActive < 350;

    if (isCloseSequence) {
      globalActiveTooltipCount = globalActiveTooltipCount + 1;
      globalLastActiveTooltipTime = now;
      setIsInstant(true);
      setVisible(true);
    } else {
      setIsInstant(false);
      hoverTimeoutRef.current = setTimeout(() => {
        globalActiveTooltipCount = globalActiveTooltipCount + 1;
        globalLastActiveTooltipTime = Date.now();
        setVisible(true);
      }, 120);
    }
  };

  const hideTooltip = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (visible) {
      globalActiveTooltipCount = Math.max(0, globalActiveTooltipCount - 1);
      globalLastActiveTooltipTime = Date.now();
    }
    setVisible(false);
  };

  useLayoutEffect(() => {
    if (!visible) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      let position = 'top';

      // Flip to bottom if overflowing top of screen
      if (top < 8) {
        top = triggerRect.bottom + 8;
        position = 'bottom';
      }

      // Adjust horizontal overflow
      const viewportWidth = window.innerWidth;
      if (left < 8) {
        left = 8;
      } else if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      setCoords({
        top: top + window.scrollY,
        left: left + window.scrollX,
        position
      });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible]);

  const isPositioned = coords.top !== 0 || coords.left !== 0;

  return (
    <span
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className="inline-flex cursor-help"
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={tooltipRef}
              role="tooltip"
              initial={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 0.95,
                y: prefersReducedMotion ? 0 : coords.position === 'top' ? 4 : -4
              }}
              animate={{
                opacity: isPositioned ? 1 : 0,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 0.95,
                y: prefersReducedMotion ? 0 : coords.position === 'top' ? 2 : -2
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.1 }
                  : isInstant
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }
              }
              style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className="pointer-events-none px-2.5 py-1.5 rounded-lg border border-white/10 bg-surface/95 backdrop-blur-md shadow-xl text-[10px] font-medium text-text-primary tracking-normal max-w-xs leading-relaxed text-center"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}

