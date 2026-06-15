import { useEffect, useRef, ReactNode, memo } from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';
import { X } from 'lucide-react';
import LiquidGlass from './LiquidGlass';
import { SPRING } from '../utils/springConfig';
import { useIsMobile } from '../hooks/useMediaQuery';

interface BaseDrawerProps {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

const drawerVariants: Variants = {
  hidden: (custom: { prefersReducedMotion: boolean; isMobile: boolean }) => ({
    x: custom.prefersReducedMotion ? 0 : '100%',
    opacity: custom.prefersReducedMotion ? 0 : 1,
    transition: custom.prefersReducedMotion ? { duration: 0.15 } : { type: 'tween' as const, duration: 0.18, ease: 'easeIn' as const }
  }),
  visible: (custom: { prefersReducedMotion: boolean; isMobile: boolean }) => ({
    x: 0,
    opacity: 1,
    transition: custom.prefersReducedMotion
      ? { duration: 0.15 }
      : (custom.isMobile
          ? { type: 'tween' as const, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }
          : SPRING.drawer)
  })
};

const BaseDrawer = memo(function BaseDrawer({ title, icon, onClose, children, maxWidthClass }: BaseDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Close drawer on Escape key press, active only when drawer is mounted
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-none md:backdrop-blur-sm"
      />

      {/* Drawer Body */}
      <motion.div
        custom={{ prefersReducedMotion, isMobile }}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={drawerVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 right-0 h-full w-full ${maxWidthClass || 'max-w-2xl'} z-[100] bg-surface md:bg-surface/90 md:backdrop-blur-xl border-l border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ${isMobile ? 'will-change-transform' : ''}`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-20">
          <div className="flex items-center gap-2 text-xs text-muted uppercase font-medium" id="drawer-title">
            {icon && icon}
            <span>{title}</span>
          </div>
          <LiquidGlass.Button
            onClick={onClose}
            ariaLabel="Close panel"
            className="size-10 p-0"
          >
            <X size={16} />
          </LiquidGlass.Button>
        </div>

        {/* Content wrapper */}
        {children}
      </motion.div>
    </>
  );
});

export default BaseDrawer;
