"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
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
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
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

export interface LiquidGlassTabProps {
  value: string | number; // Unique identifier matching parent value
  children: ReactNode;
  className?: string; // Style classes for this tab button
  activeClassName?: string; // Styles applied specifically when tab is active
  highlightClassName?: string; // Override default highlight styles for this tab specifically
  highlightStyle?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
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

function LiquidGlassComponent({
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
  const isMobile = useIsMobile();

  // Disable mouse-only effects on touch devices
  if (isMobile) {
    magnetic = false;
    tilt = false;
  }

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

  // Motion values for magnetic pull offset
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const springPullX = useSpring(pullX, {
    damping: 30,
    stiffness: 200,
    mass: 0.5,
  });
  const springPullY = useSpring(pullY, {
    damping: 30,
    stiffness: 200,
    mass: 0.5,
  });

  // Motion values for 3D tilt angles
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { damping: 25, stiffness: 150 });
  const springTiltY = useSpring(tiltY, { damping: 25, stiffness: 150 });

  const rectRef = useRef<DOMRect | null>(null);
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
  }, [interactive, updateRect, opacity, setWidth]);

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

      if (magnetic) {
        pullX.set(x * magneticStrength);
        pullY.set(y * magneticStrength);
      }

      if (tilt) {
        const pctX = x / (currentRect.width / 2);
        const pctY = y / (currentRect.height / 2);
        tiltX.set(-pctY * tiltStrength);
        tiltY.set(pctX * tiltStrength);
      }
    },
    [
      interactive,
      updateRect,
      mouseX,
      mouseY,
      magnetic,
      pullX,
      pullY,
      magneticStrength,
      tilt,
      tiltX,
      tiltStrength,
      tiltY,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      opacity.set(0);
      mouseX.set(0);
      mouseY.set(0);
      pullX.set(0);
      pullY.set(0);
      tiltX.set(0);
      tiltY.set(0);
      setIsHovered(false);
    }
  }, [interactive, opacity, mouseX, mouseY, pullX, pullY, tiltX, tiltY]);

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

  useEffect(() => {
    if (interactive && isHovered) {
      window.addEventListener("resize", updateRect, { passive: true });
      return () => {
        window.removeEventListener("resize", updateRect);
      };
    }
  }, [interactive, isHovered, updateRect]);

  // Compute cursor-following border spotlight gradient (softer glare)
  const borderGradient = useTransform([springX, springY], ([x, y]) => {
    return `radial-gradient(180px circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(255, 255, 255, 0.06) 0%, transparent 80%)`;
  });

  const borderActiveClasses = active
    ? "border-white/[0.15] bg-white/[0.04]"
    : "border-white/[0.04] group-hover:border-white/[0.08] bg-white/[0.015] group-hover:bg-white/[0.03]";

  const baseClasses = `
    group relative inline-flex items-center justify-center
    ${borderActiveClasses} backdrop-blur-lg
    text-text-primary transition-[border-color,background-color,box-shadow] duration-300 ease-out select-none
    overflow-hidden ${
      as === "button" || href || onClick
        ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        : "cursor-default"
    } ${roundedClass}
  `
    .replace(WHITESPACE_REGEX, " ")
    .trim();

  // Combine inline styles to form realistic glass depth (soft and subtle)
  const glassStyle = useMemo<CSSProperties>(() => {
    let shadow = `
      inset 0 1px 1px rgba(255, 255, 255, 0.25),
      inset 0 4px 8px rgba(255, 255, 255, 0.03),
      0 4px 10px rgba(0, 0, 0, 0.08)
    `;
    const isEffectivelyActive = active || isHovered;

    if (variant === "sunken") {
      shadow = isEffectivelyActive
        ? `
          inset 0 3px 8px rgba(0, 0, 0, 0.45),
          inset 0 1px 2px rgba(255, 255, 255, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.2)
        `
        : `
          inset 0 2px 5px rgba(0, 0, 0, 0.35),
          inset 0 1px 1px rgba(255, 255, 255, 0.05),
          0 1px 2px rgba(255, 255, 255, 0.02)
        `;
    } else if (variant === "beveled") {
      shadow = isEffectivelyActive
        ? `
          inset 0 1px 2px rgba(255, 255, 255, 0.4),
          inset 0 6px 12px rgba(255, 255, 255, 0.06),
          0 8px 16px rgba(0, 0, 0, 0.15)
        `
        : `
          inset 0 1px 1px rgba(255, 255, 255, 0.25),
          inset 0 4px 8px rgba(255, 255, 255, 0.03),
          0 4px 10px rgba(0, 0, 0, 0.08)
        `;
    }

    // Specular highlight bloom overlay
    if (specularGlow && isEffectivelyActive) {
      shadow = `inset 0 1px 2px rgba(255, 255, 255, 0.24), inset 0 8px 16px rgba(255, 255, 255, 0.06), ${shadow}`;
    }

    return {
      boxShadow: shadow,
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      willChange: style?.willChange ?? "transform, filter, backdrop-filter",
      ...style,
      x: magnetic ? springPullX : undefined,
      y: magnetic ? springPullY : undefined,
      rotateX: tilt ? springTiltX : undefined,
      rotateY: tilt ? springTiltY : undefined,
      transformStyle: tilt ? "preserve-3d" : undefined,
      perspective: tilt ? 1000 : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }, [
    style,
    magnetic,
    springPullX,
    springPullY,
    tilt,
    springTiltX,
    springTiltY,
    variant,
    active,
    isHovered,
    specularGlow,
  ]);

  const { hoverScaleX, hoverScaleY, tapScaleX, tapScaleY } = useMemo(() => {
    const hoverDeltaX = isMobile ? HOVER_DELTA_MOBILE : HOVER_DELTA_DESKTOP;
    const hoverScaleX = 1 + hoverDeltaX / width;
    const hoverScaleY = isMobile ? HOVER_SCALE_Y_MOBILE : HOVER_SCALE_Y_DESKTOP;

    const tapDeltaX = isMobile ? TAP_DELTA_MOBILE : TAP_DELTA_DESKTOP;
    const tapScaleX = 1 + tapDeltaX / width;
    const tapScaleY = isMobile ? TAP_SCALE_Y_MOBILE : TAP_SCALE_Y_DESKTOP;

    return { hoverScaleX, hoverScaleY, tapScaleX, tapScaleY };
  }, [isMobile, width]);

  const handlePointerDownWrapper = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (localRef.current) {
        setWidth(localRef.current.offsetWidth);
      }
      handlePointerDown(e);
    },
    [handlePointerDown, setWidth],
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
      {interactive ? (
        <>
          {!isMobile ? (
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
          ) : null}

          {springScale && ripple ? (
            <Ripple
              clickPos={clickPos}
              rippleRadius={rippleRadius}
              rippleOpacity={rippleOpacity}
            />
          ) : null}

          {!isMobile ? (
            <motion.span
              className={`absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${roundedClass}`}
              style={{ background: borderGradient, mixBlendMode: "overlay" }}
            />
          ) : null}
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
    style: glassStyle,
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

LiquidGlassComponent.displayName = "LiquidGlassComponent";

export const LiquidGlass = memo(LiquidGlassComponent);

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
      springScale={true}
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
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      "LiquidGlass.Tab must be used within a LiquidGlass.Tabs component",
    );
  }
  return context;
}

export const Tabs = memo(function Tabs({
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

export const Tab = memo(function Tab({
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

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
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
      onClick={handleClick}
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

export { LiquidGlassButton as Button };

// eslint-disable-next-line react-refresh/only-export-components
export default Object.assign(LiquidGlass, {
  Button: LiquidGlassButton,
  Tabs,
  Tab,
});
