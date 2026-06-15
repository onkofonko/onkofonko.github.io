import { useEffect, useState, memo } from 'react';
import { FileText } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, Variants } from 'motion/react';
import LiquidGlass from './LiquidGlass';
import BpmnNodeBadge from './BpmnNodeBadge';

const ROLES = ['Process Analyst', 'Digital Transformer', 'Solution Designer', 'Business Consultant'];
const preloadPdfModal = () => import('./PdfViewerModal');

interface HeroProps {
  onViewCv: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const nameVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.0,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const scrollIndicatorVariants: Variants = {
  initial: { y: 0 },
  hover: { y: 5 },
};

const circleVariants: Variants = {
  initial: { stroke: "rgba(255, 255, 255, 0.12)", scale: 1 },
  animate: {
    stroke: ["rgba(255, 255, 255, 0.12)", "hsl(244, 75%, 76%)", "rgba(255, 255, 255, 0.12)"],
    scale: 1,
    transition: {
      stroke: { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, delay: 0, ease: "easeInOut" as const }
    }
  },
  hover: {
    stroke: "hsl(244, 75%, 76%)",
    scale: 1.15,
    transition: { type: "spring" as const, stiffness: 300, damping: 15 }
  }
};

const lineVariants: Variants = {
  initial: { stroke: "rgba(255, 255, 255, 0.12)", strokeDashoffset: 0 },
  animate: {
    stroke: ["rgba(255, 255, 255, 0.12)", "hsl(244, 75%, 76%)", "rgba(255, 255, 255, 0.12)"],
    strokeDashoffset: 0,
    transition: {
      stroke: { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, delay: 0.3, ease: "easeInOut" as const }
    }
  },
  hover: {
    stroke: "hsl(244, 75%, 76%)",
    strokeDashoffset: [0, -6],
    transition: {
      strokeDashoffset: { ease: "linear" as const, duration: 0.5, repeat: Infinity }
    }
  }
};

const arrowVariants: Variants = {
  initial: { stroke: "rgba(255, 255, 255, 0.12)", y: 0 },
  animate: {
    stroke: ["rgba(255, 255, 255, 0.12)", "hsl(244, 75%, 76%)", "rgba(255, 255, 255, 0.12)"],
    y: 0,
    transition: {
      stroke: { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, delay: 0.6, ease: "easeInOut" as const }
    }
  },
  hover: {
    stroke: "hsl(244, 75%, 76%)",
    y: 1.5,
    transition: {
      stroke: { type: "spring" as const, stiffness: 300, damping: 15 },
      y: { type: "spring" as const, stiffness: 300, damping: 15 }
    }
  }
};


const roleVariants: Variants = {
  hidden: (prefersReducedMotion: boolean) => ({
    y: prefersReducedMotion ? 0 : 8,
    opacity: 0,
    filter: prefersReducedMotion ? 'none' : 'blur(4px)',
    transition: { duration: prefersReducedMotion ? 0.1 : 0.15, ease: 'easeIn' as const }
  }),
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const }
  },
  exit: (prefersReducedMotion: boolean) => ({
    y: prefersReducedMotion ? 0 : -8,
    opacity: 0,
    filter: prefersReducedMotion ? 'none' : 'blur(4px)',
    transition: { duration: prefersReducedMotion ? 0.1 : 0.15, ease: 'easeIn' as const }
  })
};


function Hero({ onViewCv }: HeroProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const scrollOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const scrollYOffset = useTransform(scrollY, [0, 150], [0, 15]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center pt-24 pb-28 md:py-0">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto w-full"
      >
        {/* Eyebrow */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted uppercase font-medium mb-8 text-pretty flex items-center gap-1.5"
        >
          <BpmnNodeBadge type="start-event-none" />
          Business Analyst Portfolio
        </motion.p>

        {/* Name */}
        <motion.h1
          variants={nameVariants}
          className="text-[clamp(3.5rem,8vw,6.0rem)] font-display italic leading-[1.1] pb-2 text-text-primary mb-6 text-balance"
        >
          Ondrej Michal Očkaj
        </motion.h1>

        {/* Role line */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-muted mb-4 text-pretty"
        >
          <span className="block md:inline">Based in Slovakia, </span>
          <span className="inline-block">
            working as a{' '}
            <span className="inline-block text-text-primary font-semibold">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={roleIndex}
                  custom={prefersReducedMotion}
                  variants={roleVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-block"
                >
                  {ROLES[roleIndex]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-muted max-w-md mb-12 text-pretty"
        >
          Specializing in process analysis, BPMN modeling, and digital transformation solutions for enterprises.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="inline-flex gap-4 flex-wrap justify-center md:justify-start"
        >
          <span onMouseEnter={preloadPdfModal} onFocusCapture={preloadPdfModal} className="inline-flex">
            <LiquidGlass.Button
              onClick={onViewCv}
              className="px-8 py-4"
              ariaLabel="View CV"
              magnetic={true}
              tilt={true}
              magneticStrength={0.02}
              specularGlow
            >
              View CV
              <FileText size={16} className="transition-transform duration-200 group-hover:scale-105" />
            </LiquidGlass.Button>
          </span>
          <LiquidGlass.Button
            href="#work"
            className="px-8 py-4"
            ariaLabel="View Case Studies"
            magnetic={true}
            tilt={true}
            magneticStrength={0.02}
            specularGlow
          >
            View Case Studies
          </LiquidGlass.Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - Styled as a BPMN Message Flow */}
      <motion.a
        href="#work"
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
        style={{ opacity: scrollOpacity, y: scrollYOffset }}
        variants={scrollIndicatorVariants}
        initial="initial"
        animate={prefersReducedMotion ? undefined : "animate"}
        whileHover="hover"
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-[10px] text-muted group-hover:text-accent uppercase font-semibold tracking-[0.25em] transition-colors duration-300">
          Scroll
        </span>
        <svg width="24" height="50" viewBox="0 0 24 50" fill="none" className="text-muted/50 group-hover:text-accent/50 transition-colors duration-300" aria-hidden="true">
          {/* Top Open Circle (BPMN Message Flow Start) */}
          <motion.circle 
            cx="12" 
            cy="6" 
            r="3" 
            strokeWidth="1.5" 
            fill="none" 
            variants={circleVariants}
            style={{ transformOrigin: "12px 6px" }}
          />
          
          {/* Dashed Line */}
          <motion.line 
            x1="12" 
            y1="10" 
            x2="12" 
            y2="34" 
            strokeWidth="1.5" 
            strokeDasharray="3 3" 
            variants={lineVariants}
          />
          
          {/* Bottom Open Arrowhead (BPMN Message Flow Target) */}
          <motion.polygon 
            points="8,36 12,44 16,36" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinejoin="round" 
            variants={arrowVariants}
            style={{ transformOrigin: "12px 40px" }}
          />
        </svg>
      </motion.a>
    </section>
  );
}

export default memo(Hero);
