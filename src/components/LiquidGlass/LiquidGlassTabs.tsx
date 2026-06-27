import {
  createContext,
  use,
  useMemo,
  useState,
  memo,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
  type PointerEvent,
  type KeyboardEvent,
  type HTMLAttributes,
  type ComponentPropsWithoutRef,
} from "react";
import { motion } from "motion/react";
import { SPRING } from "../../utils/springConfig";
import Ripple from "./Ripple";
import { useRipple } from "./useRipple";
import { DEFAULT_STYLE } from "./types";
import { scaleDeltas, scaleVertical, springs, hoverDelta } from "./config";

export interface LiquidGlassTabsProps {
  children: ReactNode;
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  layoutId: string;
  hoverSlide?: boolean;
  ripple?: boolean;
  roundedClass?: string;
  squircle?: boolean;
  className?: string;
  highlightClassName?: string;
  highlightStyle?: CSSProperties;
  style?: CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface LiquidGlassTabProps extends Omit<
  ComponentPropsWithoutRef<typeof motion.button>,
  "value" | "children"
> {
  value: string | number;
  children?: ReactNode;
  activeClassName?: string;
  highlightClassName?: string;
  highlightStyle?: CSSProperties;
}

export interface LiquidGlassTabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  children?: ReactNode;
}

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
  squircle: boolean;
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
  squircle = false,
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
      squircle,
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
      squircle,
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

const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
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
  nextTab.click();
};

// hoist static layout transition to prevent new object recreation on each render of Tab
const HIGHLIGHT_TRANSITION = { layout: SPRING.highlight } as const;

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
    squircle,
    highlightClassName: contextHighlightClass,
    highlightStyle: contextHighlightStyle,
  } = useTabsContext();

  const { rippleX, rippleY, rippleRadius, rippleOpacity, onPointerDown } =
    useRipple(ripple);

  const isActive = activeValue === value;
  const isHovered = hoveredValue === value;
  const isMobileNav = layoutId?.includes("mobile");

  const tabRole = rest.role !== undefined ? rest.role : "tab";
  const isTabRole = tabRole === "tab";

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 120, height: 36 });

  // measure element layout sizes using callback ref instead of mount useEffect to prevent extra render cycles
  const setButtonRef = useCallback((node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (!node) return;
    setDimensions({ width: node.offsetWidth, height: node.offsetHeight });
  }, []);

  const tapDeltaX = isMobileNav
    ? scaleDeltas.tap.mobile
    : scaleDeltas.tap.desktop;

  const delta = isMobileNav ? hoverDelta.mobile : hoverDelta.desktop;

  const pillWidth = dimensions.width;
  const pillHeight = dimensions.height;

  const HOVER_SCALE_X = 1 + (2 * delta) / pillWidth;
  const HOVER_SCALE_Y = 1 + (2 * delta) / pillHeight;

  const TAP_SCALE_X = 1 + tapDeltaX / dimensions.width;
  const TAP_SCALE_Y = isMobileNav
    ? scaleVertical.tap.mobile
    : scaleVertical.tap.desktop;

  const [isPressed, setIsPressed] = useState(false);

  const isNavbarActive = contextHighlightClass?.includes(
    "navbar-highlight-active",
  );

  const targetScaleX = isPressed
    ? TAP_SCALE_X
    : isNavbarActive
      ? HOVER_SCALE_X
      : 1;

  const targetScaleY = isPressed
    ? TAP_SCALE_Y
    : isNavbarActive
      ? HOVER_SCALE_Y
      : 1;

  const showHighlight = hoverSlide
    ? isHovered || (isActive && hoveredValue === null)
    : isActive;

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onPointerDown(e);
    },
    [disabled, onPointerDown],
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled || !hoverSlide) return;
    setHoveredValue(value);
  }, [disabled, hoverSlide, value, setHoveredValue]);

  const selectOption = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (onChange) onChange(value);
      if (onClick) onClick(e);
    },
    [disabled, onChange, onClick, value],
  );

  const scaleAnimationTarget = useMemo(
    () =>
      ({
        "--scale-x": targetScaleX,
        "--scale-y": targetScaleY,
      }) as Record<string, number>,
    [targetScaleX, targetScaleY],
  );

  const outerHighlightClass =
    `absolute inset-0 z-[-1] pointer-events-none ${roundedClass}`.trim();
  const baseRadius = squircle
    ? Math.min(dimensions.height / 2, 16)
    : dimensions.height / 2;

  const outerHighlightStyle = {
    ...contextHighlightStyle,
    ...highlightStyle,
    "--base-radius": `${baseRadius}px`,
  };

  const innerHighlightClass =
    `absolute inset-0 highlight-pill overflow-hidden ${roundedClass} ${contextHighlightClass} ${highlightClassName}`.trim();

  return (
    <motion.button
      ref={setButtonRef}
      type="button"
      disabled={disabled}
      onClick={selectOption}
      onPointerDown={(e) => {
        if (buttonRef.current) {
          setDimensions({
            width: buttonRef.current.offsetWidth,
            height: buttonRef.current.offsetHeight,
          });
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
          setDimensions({
            width: buttonRef.current.offsetWidth,
            height: buttonRef.current.offsetHeight,
          });
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
      onKeyDown={isTabRole ? handleTabKeyDown : rest.onKeyDown}
    >
      {showHighlight ? (
        <motion.span
          layoutId={layoutId}
          className={outerHighlightClass}
          style={outerHighlightStyle as CSSProperties}
          transition={HIGHLIGHT_TRANSITION}
        >
          <motion.span
            animate={scaleAnimationTarget}
            transition={springs.scale}
            className={innerHighlightClass}
            style={{
              transform: "scale(var(--scale-x), var(--scale-y))",
              borderRadius:
                "calc((var(--base-radius) * var(--scale-y)) / var(--scale-x)) / var(--base-radius)",
              transformOrigin: "center center",
            }}
          >
            {ripple ? (
              <Ripple
                rippleX={rippleX}
                rippleY={rippleY}
                rippleRadius={rippleRadius}
                rippleOpacity={rippleOpacity}
              />
            ) : null}
          </motion.span>
        </motion.span>
      ) : null}
      {children}
    </motion.button>
  );
});

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

export { Tabs, Tab, TabPanel };
