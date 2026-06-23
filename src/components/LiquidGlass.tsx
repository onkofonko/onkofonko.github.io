"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  use,
  useMemo,
  memo,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type MouseEventHandler,
  type Ref,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
  type MotionStyle,
} from "motion/react";
import { SPRING } from "../utils/springConfig";
import { useIsMobile } from "../hooks/useMediaQuery";

const DEFAULT_STYLE: CSSProperties = {};
const WHITESPACE_REGEX = /\s+/g;

interface RippleProps {
  clickPos: { x: number; y: number };
  rippleRadius: MotionValue<number>;
  rippleOpacity: MotionValue<number>;
}

const Ripple = ({ clickPos, rippleRadius, rippleOpacity }: RippleProps) => (
  <motion.span
    className="absolute pointer-events-none z-10 rounded-full bg-white blur-[6px] mix-blend-screen"
    style={{
      left: clickPos.x,
      top: clickPos.y,
      width: rippleRadius,
      height: rippleRadius,
      x: "-50%",
      y: "-50%",
      opacity: rippleOpacity,
    }}
  />
);

function useRipple(enabled: boolean) {
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const rippleRadius = useMotionValue(0);
  const rippleOpacity = useMotionValue(0);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickPos({ x, y });

      const maxRadius = Math.max(rect.width, rect.height) * 2.2;

      animate(rippleRadius, [0, maxRadius], {
        type: "spring",
        stiffness: 85,
        damping: 14,
        mass: 0.5,
      });

      animate(rippleOpacity, [0.06, 0], {
        duration: 0.55,
        ease: "easeOut",
      });
    },
    [enabled, rippleRadius, rippleOpacity],
  );

  return {
    clickPos,
    rippleRadius,
    rippleOpacity,
    onPointerDown: handlePointerDown,
  };
}

export interface LiquidGlassProps {
  children?: ReactNode;
  as?: "div" | "button" | "a" | "article" | "section" | "span";
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
  interactive?: boolean;
  springScale?: boolean;
  roundedClass?: string;
  magnetic?: boolean;
  tilt?: boolean;
  magneticStrength?: number;
  tiltStrength?: number;
  ripple?: boolean;
  variant?: "flat" | "sunken" | "beveled";
  active?: boolean;
  specularGlow?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow arbitrary attributes
}

export type LiquidGlassButtonProps = Omit<
  LiquidGlassProps,
  "as" | "springScale"
>;

export interface LiquidGlassTabsProps {
  children: ReactNode;
  value: string | number; // Active tab/section identifier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void; // Active tab state setter
  layoutId: string; // Framer Motion layoutId for slide transition
  hoverSlide?: boolean; // Smoothly slide highlighting to hovered tab (default: true)
  ripple?: boolean; // Enable pointer-down light ripple (default: true)
  roundedClass?: string; // Border radius of the highlight pill (default: 'rounded-full')
  className?: string; // Custom styling for container wrapper
  highlightClassName?: string; // Additional classes for the sliding highlight pill
  highlightStyle?: CSSProperties; // Inline styles for the sliding highlight pill
  style?: CSSProperties; // Forward style prop
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow arbitrary props (like onMouseEnter, onMouseLeave)
}

export interface LiquidGlassTabProps extends Omit<
  ComponentPropsWithoutRef<typeof motion.button>,
  "value" | "children"
> {
  value: string | number; // Unique identifier matching parent value
  children?: ReactNode;
  activeClassName?: string; // Styles applied specifically when tab is active
  highlightClassName?: string; // Override default highlight styles for this tab specifically
  highlightStyle?: CSSProperties;
}

// =========================================================================
// Pill State Scale Configuration: Tweak sizes individually here!
// =========================================================================
const FLAT_SCALE_X = 1.0;
const FLAT_SCALE_Y = 1.0;

// Fixed absolute pixel growth spacing deltas
const HOVER_DELTA_MOBILE = 2;
const HOVER_DELTA_DESKTOP = 5;

const STRETCH_DELTA_MOBILE = 10;
const STRETCH_DELTA_DESKTOP = 25;

const TAP_DELTA_MOBILE = 4;
const TAP_DELTA_DESKTOP = 8;

// Vertical (Y) scaling values
const HOVER_SCALE_Y_MOBILE = 1.03;
const HOVER_SCALE_Y_DESKTOP = 1.06;

const SWELL_SCALE_Y_MOBILE = 1.04;
const SWELL_SCALE_Y_DESKTOP = 1.08;

const TAP_SCALE_Y_MOBILE = 0.98;
const TAP_SCALE_Y_DESKTOP = 0.96;
// =========================================================================

interface LiquidGlassPropsWithRef extends LiquidGlassProps {
  ref?: Ref<HTMLElement | null>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function LiquidGlassMobile({
  children,
  as = "div",
  href,
  download,
  target,
  rel,
  ariaLabel,
  onClick,
  className = "",
  innerClassName = "",
  style = DEFAULT_STYLE,
  interactive = true,
  springScale = false,
  roundedClass = "rounded-full",
  magnetic = false,
  tilt = false,
  magneticStrength = 0.02,
  tiltStrength = 2,
  ripple = true,
  variant = "flat",
  active = false,
  specularGlow = false,
  ref,
  ...rest
}: LiquidGlassPropsWithRef) {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const localRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(120);

  // Synchronize internal ref with forwarded ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else {
      (ref as MutableRefObject<HTMLElement | null>).current = localRef.current;
    }
  }, [ref]);

  // Click ripple state & logic hook
  const {
    clickPos,
    rippleRadius,
    rippleOpacity,
    onPointerDown: handlePointerDown,
  } = useRipple(interactive && springScale && ripple);

  // Keyboard handler: support Enter/Space activation for non-semantic interactive elements
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if ((e.key === "Enter" || e.key === " ") && onClick) {
        e.preventDefault();
        onClick(e as unknown as MouseEvent<HTMLElement>);
      }
    },
    [onClick],
  );

  const borderActiveClasses = active
    ? "border-white/[0.15] bg-white/[0.04]"
    : "border-white/[0.04] group-hover:border-white/[0.08] bg-white/[0.015] group-hover:bg-white/[0.03]";

  const baseClasses = `
    group relative inline-flex items-center justify-center
    backdrop-blur-lg
    text-text-primary select-none
    overflow-hidden ${
      as === "button" || href || onClick
        ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        : "cursor-default"
    } ${roundedClass}
  `
    .replace(WHITESPACE_REGEX, " ")
    .trim();

  // Combine inline styles to form realistic glass depth (soft and subtle)
  const innerGlassStyle = useMemo<CSSProperties>(() => {
    if (variant === "sunken") {
      return {
        boxShadow: active
          ? "inset 0 3px 8px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.12), 0 4px 12px rgba(0, 0, 0, 0.2)"
          : "inset 0 2px 5px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 1px 2px rgba(255, 255, 255, 0.02)",
      };
    }
    if (variant === "beveled") {
      return {
        boxShadow: active
          ? "inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 6px 12px rgba(255, 255, 255, 0.06), 0 8px 16px rgba(0, 0, 0, 0.15)"
          : "inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 4px 8px rgba(255, 255, 255, 0.03), 0 4px 10px rgba(0, 0, 0, 0.08)",
      };
    }
    const defaultShadow =
      "inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 4px 8px rgba(255, 255, 255, 0.03), 0 4px 10px rgba(0, 0, 0, 0.08)";
    return {
      boxShadow:
        specularGlow && active
          ? `inset 0 1px 2px rgba(255, 255, 255, 0.24), inset 0 8px 16px rgba(255, 255, 255, 0.06), ${defaultShadow}`
          : defaultShadow,
    };
  }, [variant, active, specularGlow]);

  const tagStyle = useMemo<CSSProperties>(() => {
    return {
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      willChange: style?.willChange ?? "transform, filter, backdrop-filter",
      ...style,
    };
  }, [style]);

  const { tapScaleX, tapScaleY } = useMemo(() => {
    const tapDeltaX = TAP_DELTA_MOBILE;
    const tapScaleX = 1 + tapDeltaX / width;
    const tapScaleY = TAP_SCALE_Y_MOBILE;

    return { tapScaleX, tapScaleY };
  }, [width]);

  const handlePointerDownWrapper = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (localRef.current) {
        setWidth(localRef.current.offsetWidth);
      }
      handlePointerDown(e);
    },
    [handlePointerDown],
  );

  const sharedAnimationProps = useMemo(
    () => ({
      whileTap: springScale
        ? { scaleX: tapScaleX, scaleY: tapScaleY }
        : undefined,
      transition: springScale
        ? {
            scaleX: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.6,
            },
            scaleY: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.6,
            },
          }
        : undefined,
      onPointerDown: handlePointerDownWrapper,
    }),
    [springScale, handlePointerDownWrapper, tapScaleX, tapScaleY],
  );

  // Determine container tag and layout styles dynamically based on semantics
  const ContentTag =
    as === "a" || as === "button" || as === "span" ? "span" : "div";
  const contentClasses = `relative z-30 w-full h-full ${
    as === "a" || as === "button" || as === "span"
      ? "flex items-center justify-center gap-2 font-semibold"
      : ""
  } ${innerClassName}`.trim();

  const innerElements = (
    <>
      <span
        className={`absolute inset-0 pointer-events-none z-0 border ${borderActiveClasses} ${roundedClass} transition-[border-color,background-color,box-shadow] duration-300 ease-out`}
        style={innerGlassStyle}
      />
      {interactive ? (
        springScale && ripple ? (
          <Ripple
            clickPos={clickPos}
            rippleRadius={rippleRadius}
            rippleOpacity={rippleOpacity}
          />
        ) : null
      ) : null}

      {/* Label and icons */}
      <ContentTag className={contentClasses}>{children}</ContentTag>
    </>
  );

  const Tag = href
    ? motion.a
    : as === "button"
      ? motion.button
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (motion as any)[as];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagProps: any = {
    className: `${baseClasses} ${className}`,
    style: tagStyle,
    "aria-label": ariaLabel,
    ...sharedAnimationProps,
    ...rest,
  };

  if (href) {
    tagProps.href = href;
    tagProps.download = download;
    tagProps.target = target;
    tagProps.rel = rel;
    tagProps.onClick = onClick as MouseEventHandler<HTMLAnchorElement>;
  } else if (as === "button") {
    tagProps.type = "button";
    tagProps.onClick = onClick as MouseEventHandler<HTMLButtonElement>;
  } else if (onClick) {
    tagProps.onClick = onClick;
    // For non-semantic elements, add keyboard accessibility
    if (as !== "a" && (as as string) !== "button") {
      tagProps.tabIndex = 0;
      tagProps.onKeyDown = handleKeyDown;
      tagProps.role = "button";
    }
  }

  return (
    <Tag ref={localRef} {...tagProps}>
      {innerElements}
    </Tag>
  );
}

LiquidGlassMobile.displayName = "LiquidGlassMobile";

function LiquidGlassDesktop({
  children,
  as = "div",
  href,
  download,
  target,
  rel,
  ariaLabel,
  onClick,
  className = "",
  innerClassName = "",
  style = DEFAULT_STYLE,
  interactive = true,
  springScale = false,
  roundedClass = "rounded-full",
  magnetic = false,
  tilt = false,
  magneticStrength = 0.02,
  tiltStrength = 2,
  ripple = true,
  variant = "flat",
  active = false,
  specularGlow = false,
  ref,
  ...rest
}: LiquidGlassPropsWithRef) {
  const localRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(120);

  const effectiveTiltStrength = useMemo(() => {
    const referenceWidth = 240;
    const raw = tiltStrength * (referenceWidth / Math.max(width, 1));
    // Clamp to prevent extreme tilt on tiny elements
    return Math.min(raw, 12);
  }, [width, tiltStrength]);

  // Synchronize internal ref with forwarded ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else {
      (ref as MutableRefObject<HTMLElement | null>).current = localRef.current;
    }
  }, [ref]);

  // Motion values for tracking cursor relative to container center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(0);

  // Spring physics for primary blob (fast, snappy fluid)
  const springX = useSpring(mouseX, {
    damping: 28,
    stiffness: 180,
    mass: 0.6,
  });
  const springY = useSpring(mouseY, {
    damping: 28,
    stiffness: 180,
    mass: 0.6,
  });
  const springOpacity = useSpring(opacity, { damping: 20, stiffness: 120 });

  // Spring physics for secondary blob (lagging, viscous fluid)
  const lagX = useSpring(mouseX, { damping: 38, stiffness: 110, mass: 1.0 });
  const lagY = useSpring(mouseY, { damping: 38, stiffness: 110, mass: 1.0 });

  const rectRef = useRef<DOMRect | null>(null);

  // Derived motion values using useTransform - runs in O(1) with zero spring solver ticking
  const springPullX = useTransform(springX, (x) =>
    magnetic ? x * magneticStrength : 0,
  );
  const springPullY = useTransform(springY, (y) =>
    magnetic ? y * magneticStrength : 0,
  );

  const springTiltX = useTransform(springY, (y) => {
    if (!tilt || !rectRef.current) return 0;
    const halfHeight = rectRef.current.height / 2;
    const pctY = y / halfHeight;
    return -pctY * effectiveTiltStrength;
  });

  const springTiltY = useTransform(springX, (x) => {
    if (!tilt || !rectRef.current) return 0;
    const halfWidth = rectRef.current.width / 2;
    const pctX = x / halfWidth;
    return pctX * effectiveTiltStrength;
  });

  const [isHovered, setIsHovered] = useState(false);

  // Click ripple state & logic hook
  const {
    clickPos,
    rippleRadius,
    rippleOpacity,
    onPointerDown: handlePointerDown,
  } = useRipple(interactive && springScale && ripple);

  // Measure bounds to compute offset
  const updateRect = useCallback(() => {
    if (localRef.current) {
      rectRef.current = localRef.current.getBoundingClientRect();
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (interactive) {
      if (localRef.current) {
        setWidth(localRef.current.offsetWidth);
      }
      updateRect();
      opacity.set(1);
      setIsHovered(true);
    }
  }, [interactive, updateRect, opacity]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!interactive) return;
      if (!rectRef.current) {
        updateRect();
      }
      const currentRect = rectRef.current;
      if (!currentRect) return;

      const x = e.clientX - currentRect.left - currentRect.width / 2;
      const y = e.clientY - currentRect.top - currentRect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    },
    [interactive, updateRect, mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      opacity.set(0);
      mouseX.set(0);
      mouseY.set(0);
      setIsHovered(false);
    }
  }, [interactive, opacity, mouseX, mouseY]);

  // Keyboard handler: support Enter/Space activation for non-semantic interactive elements
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if ((e.key === "Enter" || e.key === " ") && onClick) {
        e.preventDefault();
        onClick(e as unknown as MouseEvent<HTMLElement>);
      }
    },
    [onClick],
  );

  const updateRectRef = useRef(updateRect);
  useEffect(() => {
    updateRectRef.current = updateRect;
  }, [updateRect]);

  useEffect(() => {
    const handleResize = () => {
      updateRectRef.current();
    };
    if (interactive && isHovered) {
      window.addEventListener("resize", handleResize, { passive: true });
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [interactive, isHovered]);

  // Compute cursor-following border spotlight gradient (softer glare)
  const borderGradient = useTransform([springX, springY], ([x, y]) => {
    return `radial-gradient(180px circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(255, 255, 255, 0.06) 0%, transparent 80%)`;
  });

  const borderActiveClasses = active
    ? "border-white/[0.15] bg-white/[0.04]"
    : "border-white/[0.04] group-hover:border-white/[0.08] bg-white/[0.015] group-hover:bg-white/[0.03]";

  const baseClasses = `
    group relative inline-flex items-center justify-center
    backdrop-blur-lg
    text-text-primary select-none
    overflow-hidden ${
      as === "button" || href || onClick
        ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        : "cursor-default"
    } ${roundedClass}
  `
    .replace(WHITESPACE_REGEX, " ")
    .trim();

  // Combine inline styles to form realistic glass depth (soft and subtle)
  const innerGlassStyle = useMemo<CSSProperties>(() => {
    const isEffectivelyActive = active || isHovered;
    if (variant === "sunken") {
      return {
        boxShadow: isEffectivelyActive
          ? "inset 0 3px 8px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.12), 0 4px 12px rgba(0, 0, 0, 0.2)"
          : "inset 0 2px 5px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 1px 2px rgba(255, 255, 255, 0.02)",
      };
    }
    if (variant === "beveled") {
      return {
        boxShadow: isEffectivelyActive
          ? "inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 6px 12px rgba(255, 255, 255, 0.06), 0 8px 16px rgba(0, 0, 0, 0.15)"
          : "inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 4px 8px rgba(255, 255, 255, 0.03), 0 4px 10px rgba(0, 0, 0, 0.08)",
      };
    }
    const defaultShadow =
      "inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 4px 8px rgba(255, 255, 255, 0.03), 0 4px 10px rgba(0, 0, 0, 0.08)";
    return {
      boxShadow:
        specularGlow && isEffectivelyActive
          ? `inset 0 1px 2px rgba(255, 255, 255, 0.24), inset 0 8px 16px rgba(255, 255, 255, 0.06), ${defaultShadow}`
          : defaultShadow,
    };
  }, [variant, active, isHovered, specularGlow]);

  const tagStyle = useMemo<MotionStyle>(() => {
    return {
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      willChange: style?.willChange ?? "transform, filter, backdrop-filter",
      x: magnetic ? springPullX : undefined,
      y: magnetic ? springPullY : undefined,
      rotateX: tilt ? springTiltX : undefined,
      rotateY: tilt ? springTiltY : undefined,
      transformStyle: tilt ? "preserve-3d" : undefined,
      transformPerspective: tilt ? 1000 : undefined,
      ...style,
    };
  }, [
    style,
    magnetic,
    springPullX,
    springPullY,
    tilt,
    springTiltX,
    springTiltY,
  ]);

  const { hoverScaleX, hoverScaleY, tapScaleX, tapScaleY } = useMemo(() => {
    const hoverDeltaX = HOVER_DELTA_DESKTOP;
    const hoverScaleX = 1 + hoverDeltaX / width;
    const hoverScaleY = HOVER_SCALE_Y_DESKTOP;

    const tapDeltaX = TAP_DELTA_DESKTOP;
    const tapScaleX = 1 + tapDeltaX / width;
    const tapScaleY = TAP_SCALE_Y_DESKTOP;

    return { hoverScaleX, hoverScaleY, tapScaleX, tapScaleY };
  }, [width]);

  const handlePointerDownWrapper = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (localRef.current) {
        setWidth(localRef.current.offsetWidth);
      }
      handlePointerDown(e);
    },
    [handlePointerDown],
  );

  const sharedAnimationProps = useMemo(
    () => ({
      whileHover: springScale
        ? { scaleX: hoverScaleX, scaleY: hoverScaleY }
        : undefined,
      whileTap: springScale
        ? { scaleX: tapScaleX, scaleY: tapScaleY }
        : undefined,
      transition: springScale
        ? {
            scaleX: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.6,
            },
            scaleY: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.6,
            },
          }
        : undefined,
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onPointerDown: handlePointerDownWrapper,
    }),
    [
      springScale,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handlePointerDownWrapper,
      hoverScaleX,
      hoverScaleY,
      tapScaleX,
      tapScaleY,
    ],
  );

  // Determine container tag and layout styles dynamically based on semantics
  const ContentTag =
    as === "a" || as === "button" || as === "span" ? "span" : "div";
  const contentClasses = `relative z-30 w-full h-full ${
    as === "a" || as === "button" || as === "span"
      ? "flex items-center justify-center gap-2 font-semibold"
      : ""
  } ${innerClassName}`.trim();

  const innerElements = (
    <>
      <span
        className={`absolute inset-0 pointer-events-none z-0 border ${borderActiveClasses} ${roundedClass} transition-[border-color,background-color,box-shadow] duration-300 ease-out`}
        style={innerGlassStyle}
      />
      {interactive ? (
        <>
          <span
            className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${roundedClass}`}
          >
            <motion.span
              className="absolute size-48 -mt-24 -ml-24 rounded-full bg-gradient-to-r from-[#7A7BBF]/6 to-[#6667AB]/6 blur-2xl pointer-events-none mix-blend-screen"
              style={{
                x: springX,
                y: springY,
                opacity: springOpacity,
                left: "50%",
                top: "50%",
              }}
            />
            <motion.span
              className="absolute size-32 -mt-16 -ml-16 rounded-full bg-gradient-to-r from-[#F26B5B]/3 to-[#926AA6]/3 blur-xl pointer-events-none mix-blend-screen"
              style={{
                x: lagX,
                y: lagY,
                opacity: springOpacity,
                left: "50%",
                top: "50%",
              }}
            />
          </span>

          {springScale && ripple ? (
            <Ripple
              clickPos={clickPos}
              rippleRadius={rippleRadius}
              rippleOpacity={rippleOpacity}
            />
          ) : null}

          <motion.span
            className={`absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${roundedClass}`}
            style={{ background: borderGradient, mixBlendMode: "overlay" }}
          />
        </>
      ) : null}

      {/* Label and icons */}
      <ContentTag className={contentClasses}>{children}</ContentTag>
    </>
  );

  const Tag = href
    ? motion.a
    : as === "button"
      ? motion.button
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (motion as any)[as];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagProps: any = {
    className: `${baseClasses} ${className}`,
    style: tagStyle,
    "aria-label": ariaLabel,
    ...sharedAnimationProps,
    ...rest,
  };

  if (href) {
    tagProps.href = href;
    tagProps.download = download;
    tagProps.target = target;
    tagProps.rel = rel;
    tagProps.onClick = onClick as MouseEventHandler<HTMLAnchorElement>;
  } else if (as === "button") {
    tagProps.type = "button";
    tagProps.onClick = onClick as MouseEventHandler<HTMLButtonElement>;
  } else if (onClick) {
    tagProps.onClick = onClick;
    // For non-semantic elements, add keyboard accessibility
    if (as !== "a" && (as as string) !== "button") {
      tagProps.tabIndex = 0;
      tagProps.onKeyDown = handleKeyDown;
      tagProps.role = "button";
    }
  }

  return (
    <Tag ref={localRef} {...tagProps}>
      {innerElements}
    </Tag>
  );
}

LiquidGlassDesktop.displayName = "LiquidGlassDesktop";

export const LiquidGlass = memo(
  ({ ref, ...props }: LiquidGlassProps & { ref?: Ref<HTMLElement | null> }) => {
    const isMobile = useIsMobile();
    if (isMobile) {
      return <LiquidGlassMobile ref={ref} {...props} />;
    }
    return <LiquidGlassDesktop ref={ref} {...props} />;
  },
);

LiquidGlass.displayName = "LiquidGlass";

interface LiquidGlassButtonPropsWithRef extends LiquidGlassButtonProps {
  ref?: Ref<HTMLElement | null>;
}

function LiquidGlassButtonComponent({
  children,
  onClick,
  className = "",
  href,
  download,
  target,
  rel,
  ariaLabel,
  magnetic,
  tilt,
  magneticStrength,
  tiltStrength,
  ref,
  ...rest
}: LiquidGlassButtonPropsWithRef) {
  return (
    <LiquidGlass
      ref={ref}
      as={href ? "a" : "button"}
      href={href}
      download={download}
      target={target}
      rel={rel}
      onClick={onClick}
      className={className}
      ariaLabel={ariaLabel}
      springScale
      magnetic={magnetic}
      tilt={tilt}
      magneticStrength={magneticStrength}
      tiltStrength={tiltStrength}
      {...rest}
    >
      {children}
    </LiquidGlass>
  );
}

LiquidGlassButtonComponent.displayName = "LiquidGlassButtonComponent";

export const LiquidGlassButton = memo(LiquidGlassButtonComponent);

LiquidGlassButton.displayName = "LiquidGlass.Button";

interface TabsContextValue {
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  layoutId: string;
  hoveredValue: string | number | null;
  setHoveredValue: (value: string | number | null) => void;
  hoverSlide: boolean;
  ripple: boolean;
  roundedClass: string;
  highlightClassName?: string;
  highlightStyle?: CSSProperties;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = use(TabsContext);
  if (!context) {
    throw new Error(
      "LiquidGlass.Tab must be used within a LiquidGlass.Tabs component",
    );
  }
  return context;
}

const Tabs = memo(function Tabs({
  value,
  onChange,
  layoutId,
  children,
  hoverSlide = true,
  ripple = true,
  roundedClass = "rounded-full",
  className = "",
  highlightClassName = "",
  highlightStyle = DEFAULT_STYLE,
  style,
  ...rest
}: LiquidGlassTabsProps) {
  const [hoveredValue, setHoveredValue] = useState<string | number | null>(
    null,
  );

  const contextValue = useMemo(
    () => ({
      value,
      onChange,
      layoutId,
      hoveredValue,
      setHoveredValue,
      hoverSlide,
      ripple,
      roundedClass,
      highlightClassName,
      highlightStyle,
    }),
    [
      value,
      onChange,
      layoutId,
      hoveredValue,
      hoverSlide,
      ripple,
      roundedClass,
      highlightClassName,
      highlightStyle,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        role="tablist"
        tabIndex={-1}
        className={`flex ${className}`}
        style={style}
        {...rest}
        onMouseLeave={(e) => {
          setHoveredValue(null);
          if (rest.onMouseLeave) {
            rest.onMouseLeave(e);
          }
        }}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
  const tabs = Array.from(
    e.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll('[role="tab"]') ?? [],
  );
  const idx = tabs.indexOf(e.currentTarget);
  let nextIdx = idx;

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextIdx = (idx + 1) % tabs.length;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    nextIdx = (idx - 1 + tabs.length) % tabs.length;
  } else if (e.key === "Home") {
    nextIdx = 0;
  } else if (e.key === "End") {
    nextIdx = tabs.length - 1;
  } else {
    return;
  }

  e.preventDefault();
  const nextTab = tabs[nextIdx] as HTMLButtonElement;
  nextTab.focus();
  nextTab.click(); // triggers onChange
};

const Tab = memo(function Tab({
  value,
  children,
  className = "",
  activeClassName = "",
  highlightClassName = "",
  highlightStyle = DEFAULT_STYLE,
  onClick,
  disabled = false,
  ...rest
}: LiquidGlassTabProps) {
  const {
    value: activeValue,
    onChange,
    layoutId,
    hoveredValue,
    setHoveredValue,
    hoverSlide,
    ripple,
    roundedClass,
    highlightClassName: contextHighlightClass,
    highlightStyle: contextHighlightStyle,
  } = useTabsContext();

  const { clickPos, rippleRadius, rippleOpacity, onPointerDown } =
    useRipple(ripple);

  const isActive = activeValue === value;
  const isHovered = hoveredValue === value;
  const isMobileNav = layoutId?.includes("mobile");

  const tabRole = rest.role !== undefined ? rest.role : "tab";
  const isTabRole = tabRole === "tab";

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(120);

  // Fixed absolute pixel growth spacing delta
  const hoverDeltaX = isMobileNav ? HOVER_DELTA_MOBILE : HOVER_DELTA_DESKTOP;
  const stretchDeltaX = isMobileNav
    ? STRETCH_DELTA_MOBILE
    : STRETCH_DELTA_DESKTOP;
  const tapDeltaX = isMobileNav ? TAP_DELTA_MOBILE : TAP_DELTA_DESKTOP;

  const HOVER_SCALE_X = 1 + hoverDeltaX / buttonWidth;
  const HOVER_SCALE_Y = isMobileNav
    ? HOVER_SCALE_Y_MOBILE
    : HOVER_SCALE_Y_DESKTOP;

  const TRANSITION_STRETCH_X = 1 + stretchDeltaX / buttonWidth; // grow wider during transition
  const TRANSITION_SWELL_Y = isMobileNav
    ? SWELL_SCALE_Y_MOBILE
    : SWELL_SCALE_Y_DESKTOP; // grow taller during transition

  const TAP_SCALE_X = 1 + tapDeltaX / buttonWidth; // grow wider on hold/click
  const TAP_SCALE_Y = isMobileNav ? TAP_SCALE_Y_MOBILE : TAP_SCALE_Y_DESKTOP; // grow taller on hold/click

  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const prevHighlightedTabRef = useRef<string | number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const highlightedTab = hoveredValue ?? activeValue;
  const isCurrentlyHighlighted = hoveredValue !== null ? isHovered : isActive;
  const isNavbarActive = contextHighlightClass?.includes(
    "navbar-highlight-active",
  );

  useEffect(() => {
    const targetX = isPressed
      ? TAP_SCALE_X
      : isNavbarActive
        ? HOVER_SCALE_X
        : FLAT_SCALE_X;
    const targetY = isPressed
      ? TAP_SCALE_Y
      : isNavbarActive
        ? HOVER_SCALE_Y
        : FLAT_SCALE_Y;

    if (
      isCurrentlyHighlighted &&
      highlightedTab !== prevHighlightedTabRef.current
    ) {
      const isMobileNav = layoutId?.includes("mobile");
      if (isMobileNav) {
        // Vertical layout: grow wider horizontally first, then grow taller vertically, and settle
        animate(scaleX, [scaleX.get(), TRANSITION_SWELL_Y, targetX, targetX], {
          duration: 0.3,
          times: [0, 0.1, 0.4, 1],
          ease: [0.19, 1, 0.22, 1],
        });
        animate(
          scaleY,
          [scaleY.get(), targetY, TRANSITION_STRETCH_X, targetY],
          {
            duration: 0.3,
            times: [0, 0.1, 0.4, 1],
            ease: [0.19, 1, 0.22, 1],
          },
        );
      } else {
        // Horizontal layout: grow taller vertically first, then grow wider horizontally, and settle
        animate(
          scaleX,
          [scaleX.get(), targetX, TRANSITION_STRETCH_X, targetX],
          {
            duration: 0.3,
            times: [0, 0.1, 0.4, 1],
            ease: [0.19, 1, 0.22, 1],
          },
        );
        animate(scaleY, [scaleY.get(), TRANSITION_SWELL_Y, targetY, targetY], {
          duration: 0.3,
          times: [0, 0.1, 0.4, 1],
          ease: [0.19, 1, 0.22, 1],
        });
      }
    } else if (isCurrentlyHighlighted) {
      // Stationary hover enter / hover release / pointer down / pointer up toggles
      animate(scaleX, targetX, {
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.6,
      });
      animate(scaleY, targetY, {
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.6,
      });
    }
    prevHighlightedTabRef.current = highlightedTab;
  }, [
    activeValue,
    hoveredValue,
    isActive,
    isHovered,
    layoutId,
    highlightedTab,
    isCurrentlyHighlighted,
    isNavbarActive,
    isPressed,
    scaleX,
    scaleY,
    TAP_SCALE_X,
    HOVER_SCALE_X,
    TAP_SCALE_Y,
    HOVER_SCALE_Y,
    TRANSITION_SWELL_Y,
    TRANSITION_STRETCH_X,
  ]);

  const showHighlight = hoverSlide
    ? isHovered || (isActive && hoveredValue === null)
    : isActive;

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onPointerDown(e);
  };

  const handleMouseEnter = () => {
    if (disabled || !hoverSlide) return;
    setHoveredValue(value);
  };

  const selectOption = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onChange) onChange(value);
    if (onClick) onClick(e);
  };

  const combinedHighlightClass =
    `absolute inset-0 z-[-1] highlight-pill overflow-hidden ${roundedClass} ${contextHighlightClass} ${highlightClassName}`.trim();
  const combinedHighlightStyle = {
    ...contextHighlightStyle,
    ...highlightStyle,
    scaleX,
    scaleY,
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      onClick={selectOption}
      onPointerDown={(e) => {
        if (buttonRef.current) {
          setButtonWidth(buttonRef.current.offsetWidth);
        }
        handlePointerDown(e);
        setIsPressed(true);
      }}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false);
      }}
      onMouseEnter={() => {
        if (buttonRef.current) {
          setButtonWidth(buttonRef.current.offsetWidth);
        }
        handleMouseEnter();
      }}
      className={`relative select-none z-10 transition-colors duration-200 focus-visible:outline-none ${className} ${
        isActive ? activeClassName : ""
      }`}
      {...rest}
      role={tabRole ?? undefined}
      aria-selected={
        rest["aria-selected"] !== undefined
          ? rest["aria-selected"]
          : isTabRole
            ? isActive
              ? "true"
              : undefined
            : undefined
      }
      aria-controls={
        rest["aria-controls"] !== undefined
          ? rest["aria-controls"]
          : isTabRole
            ? `tabpanel-${value}`
            : undefined
      }
      id={`tab-${value}`}
      tabIndex={
        rest.tabIndex !== undefined
          ? rest.tabIndex
          : isTabRole
            ? isActive
              ? 0
              : -1
            : undefined
      }
      onKeyDown={isTabRole ? handleKeyDown : rest.onKeyDown}
    >
      {showHighlight ? (
        <motion.span
          layoutId={layoutId}
          className={combinedHighlightClass}
          style={combinedHighlightStyle}
          transition={{
            layout: SPRING.highlight,
          }}
        >
          {ripple ? (
            <Ripple
              clickPos={clickPos}
              rippleRadius={rippleRadius}
              rippleOpacity={rippleOpacity}
            />
          ) : null}
        </motion.span>
      ) : null}
      {children}
    </motion.button>
  );
});

export interface LiquidGlassTabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  children?: ReactNode;
}

const TabPanel = memo(function TabPanel({
  value,
  children,
  ...rest
}: LiquidGlassTabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      {...rest}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = "LiquidGlass.TabPanel";

// eslint-disable-next-line react-refresh/only-export-components
export default Object.assign(LiquidGlass, {
  Button: LiquidGlassButton,
  Tabs,
  Tab,
  TabPanel,
});
