import { useEffect, useCallback, useReducer } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import LiquidGlass from "./LiquidGlass";
import { useIsMobile } from "../hooks/useMediaQuery";

const NAV_LINKS = ["Case Studies", "Skills", "Process Library", "Journal"];

interface NavbarProps {
  activeSection: string;
  onNavClick: (section: string) => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

interface NavbarState {
  scrolled: boolean;
  isOpen: boolean;
  avatarError: boolean;
  isHovered: boolean;
  isTransitioning: boolean;
  prevActive: string;
  isScrolling: boolean;
}

type NavbarAction =
  | { type: "SET_SCROLLED"; scrolled: boolean }
  | { type: "SET_IS_OPEN"; isOpen: boolean }
  | { type: "SET_AVATAR_ERROR"; error: boolean }
  | { type: "SET_IS_HOVERED"; hovered: boolean }
  | { type: "SET_IS_TRANSIENT"; transitioning: boolean }
  | { type: "SET_SCROLLING"; scrolling: boolean }
  | { type: "TRANSITION_SECTION"; prevActive: string; transitioning: boolean };

function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case "SET_SCROLLED":
      return { ...state, scrolled: action.scrolled };
    case "SET_IS_OPEN":
      return { ...state, isOpen: action.isOpen };
    case "SET_AVATAR_ERROR":
      return { ...state, avatarError: action.error };
    case "SET_IS_HOVERED":
      return { ...state, isHovered: action.hovered };
    case "SET_IS_TRANSIENT":
      return { ...state, isTransitioning: action.transitioning };
    case "SET_SCROLLING":
      return { ...state, isScrolling: action.scrolling };
    case "TRANSITION_SECTION":
      return {
        ...state,
        prevActive: action.prevActive,
        isTransitioning: action.transitioning,
      };
    default:
      return state;
  }
}

export default function Navbar({
  activeSection,
  onNavClick,
  sentinelRef,
}: NavbarProps) {
  const isMobile = useIsMobile();

  const [state, dispatch] = useReducer(navbarReducer, {
    scrolled: false,
    isOpen: false,
    avatarError: false,
    isHovered: false,
    isTransitioning: false,
    prevActive: "",
    isScrolling: false,
  });

  const {
    scrolled,
    isOpen,
    avatarError,
    isHovered,
    isTransitioning,
    prevActive,
    isScrolling,
  } = state;

  useEffect(() => {
    if (!isMobile) return;
    let t: number;
    const handleScroll = () => {
      dispatch({ type: "SET_SCROLLING", scrolling: true });
      clearTimeout(t);
      t = window.setTimeout(() => {
        dispatch({ type: "SET_SCROLLING", scrolling: false });
      }, 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(t);
    };
  }, [isMobile]);

  const active = activeSection;

  if (activeSection !== prevActive) {
    dispatch({
      type: "TRANSITION_SECTION",
      prevActive: activeSection,
      transitioning: prevActive !== "",
    });
  }

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_IS_TRANSIENT", transitioning: false });
      }, 500); // 500ms covers the 400ms CSS transition and animation settling
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch({ type: "SET_IS_OPEN", isOpen: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile]);

  // Track scroll depth for the navbar backdrop collapse effect
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        dispatch({ type: "SET_SCROLLED", scrolled: !entry.isIntersecting }),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const handleNav = useCallback(
    (label: string) => {
      onNavClick(label);
      dispatch({ type: "SET_IS_OPEN", isOpen: false }); // Close mobile menu dropdown
      if (label === "Home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (label === "Case Studies") {
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      } else if (label === "Skills") {
        document
          .getElementById("skills")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (label === "Process Library") {
        document
          .getElementById("processes")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (label === "Journal") {
        document
          .getElementById("journal")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onNavClick],
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 md:pt-6 px-4 pointer-events-none">
      <span className="hidden" aria-hidden="true">
        {prevActive}
      </span>
      {/* Main Pill Capsule Container */}
      <div
        className={`pointer-events-auto flex items-center justify-between md:justify-start gap-1 md:gap-1.5 rounded-full border border-white/10 bg-surface/40 px-3 py-2.5 navbar-capsule w-full max-w-[85vw] md:w-auto relative z-50 md:max-w-[95vw] ${
          isScrolling ? "backdrop-blur-[3px]" : "backdrop-blur-md"
        } ${scrolled ? "border-white/20 bg-surface/60" : ""}`}
      >
        <LiquidGlass.Tabs
          value={active}
          onChange={handleNav}
          layoutId="active-nav-highlight"
          onMouseEnter={() =>
            dispatch({ type: "SET_IS_HOVERED", hovered: true })
          }
          onMouseLeave={() =>
            dispatch({ type: "SET_IS_HOVERED", hovered: false })
          }
          highlightClassName={
            isHovered || isTransitioning
              ? "navbar-highlight-active"
              : "navbar-highlight-flat"
          }
          className="flex items-center gap-1 md:gap-1.5"
          role="none"
        >
          {/* Home Button (Avatar + Name) */}
          <LiquidGlass.Tab
            value="Home"
            highlightClassName="hidden md:block"
            className={`relative text-xs sm:text-sm rounded-full pl-1.5 pr-3 py-1.5 transition-colors duration-200 select-none z-10 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              active === "Home"
                ? "text-text-primary"
                : "text-muted hover:text-text-primary"
            }`}
            aria-label="Home"
            role="link"
          >
            <span className="relative size-6 rounded-full bg-bg flex items-center justify-center z-10 overflow-hidden border border-white/5 flex-shrink-0">
              {avatarError ? (
                <span className="text-[9px] font-bold text-accent font-mono leading-none tracking-normal select-none">
                  OMO
                </span>
              ) : (
                <img
                  src="https://avatars.githubusercontent.com/u/36997301?v=4&s=24"
                  onError={() =>
                    dispatch({ type: "SET_AVATAR_ERROR", error: true })
                  }
                  alt="Ondrej Michal Ockaj"
                  width="24"
                  height="24"
                  className="w-full h-full object-cover"
                />
              )}
            </span>

            <span className="text-[13px] font-semibold leading-none whitespace-nowrap">
              Ondrej Michal Očkaj
            </span>
          </LiquidGlass.Tab>

          {/* Nav links (Desktop Only) */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <LiquidGlass.Tab
                key={link}
                value={link}
                className={`relative text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 transition-colors duration-200 select-none z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  active === link
                    ? "text-text-primary"
                    : "text-muted hover:text-text-primary"
                }`}
                role="link"
              >
                {link}
              </LiquidGlass.Tab>
            ))}
          </div>
        </LiquidGlass.Tabs>

        {/* Say hi button (Desktop Only) */}
        <div className="hidden md:block ml-2.5">
          <LiquidGlass.Button
            href="mailto:ondrej.michal.ockaj@gmail.com"
            className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
            ariaLabel="Send email"
            magnetic={true}
            tilt={true}
            magneticStrength={0.02}
          >
            Say hi
            <span className="text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </LiquidGlass.Button>
        </div>

        {/* Hamburger Menu Toggle (Mobile Only) */}
        <div className="flex md:hidden">
          <LiquidGlass.Button
            type="button"
            onClick={() => dispatch({ type: "SET_IS_OPEN", isOpen: !isOpen })}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="size-10 p-0"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </LiquidGlass.Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel (Mobile Only) */}
      {isMobile && (
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/10 backdrop-blur-[1px] md:hidden z-40 pointer-events-auto"
                onClick={() => dispatch({ type: "SET_IS_OPEN", isOpen: false })}
              />
            )}
          </AnimatePresence>

          <div className="md:hidden z-50 w-72 mt-2 pointer-events-none">
            <LiquidGlass.Tabs
              value={active}
              onChange={handleNav}
              layoutId="active-mobile-nav-highlight"
              onMouseEnter={() =>
                dispatch({ type: "SET_IS_HOVERED", hovered: true })
              }
              onMouseLeave={() =>
                dispatch({ type: "SET_IS_HOVERED", hovered: false })
              }
              highlightClassName={`border border-white/10 ${isHovered || isTransitioning ? "navbar-highlight-active" : "navbar-highlight-flat"}`}
              highlightStyle={{
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
              className="relative w-full p-3 rounded-3xl border border-white/10 bg-surface/35 backdrop-blur-2xl shadow-2xl flex flex-col gap-1.5"
              style={{
                boxShadow:
                  "inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
                opacity: isOpen ? 1 : 0,
                transform: isOpen
                  ? "translateY(0) scale(1)"
                  : "translateY(-8px) scale(0.96)",
                pointerEvents: isOpen ? "auto" : "none",
                transition:
                  "opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
                transformOrigin: "top",
              }}
              role="none"
            >
              {["Home", ...NAV_LINKS].map((link) => (
                <LiquidGlass.Tab
                  key={link}
                  value={link}
                  className={`relative w-full text-center flex justify-center items-center text-sm font-semibold rounded-full px-4 py-2 transition-colors duration-300 select-none z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    active === link
                      ? "text-text-primary"
                      : "text-muted hover:text-text-primary hover:bg-white/[0.02]"
                  }`}
                  role="link"
                >
                  {link}
                </LiquidGlass.Tab>
              ))}

              {/* Say Hi Button inside Mobile Menu */}
              <div className="mt-2 pt-2 border-t border-white/5 w-full">
                <LiquidGlass.Button
                  href="mailto:ondrej.michal.ockaj@gmail.com"
                  className="w-full text-sm py-3 justify-center"
                  ariaLabel="Send email"
                >
                  Say hi
                  <span className="text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </LiquidGlass.Button>
              </div>
            </LiquidGlass.Tabs>
          </div>
        </>
      )}
    </nav>
  );
}
