import { useState, useEffect, useCallback } from "react";
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

export default function Navbar({
  activeSection,
  onNavClick,
  sentinelRef,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const isMobile = useIsMobile();

  // States to track navbar interaction (flat vs. active/premium highlights)
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track scroll state on mobile for dynamic backdrop blur performance optimization
  // ponytail: Keep it simple using standard window scroll listener and React state
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    let t: number;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(t);
      t = window.setTimeout(() => {
        setIsScrolling(false);
      }, 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(t);
    };
  }, [isMobile]);

  const active = activeSection;

  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    setIsTransitioning(true);
  }

  // Reset transitioning state after a delay
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // 500ms covers the 400ms CSS transition and animation settling
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
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
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const handleNav = useCallback(
    (label: string) => {
      onNavClick(label);
      setIsOpen(false); // Close mobile menu dropdown
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          highlightClassName={
            isHovered || isTransitioning
              ? "navbar-highlight-active"
              : "navbar-highlight-flat"
          }
          className="flex items-center gap-1 md:gap-1.5"
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
          >
            <span className="relative size-6 rounded-full bg-bg flex items-center justify-center z-10 overflow-hidden border border-white/5 flex-shrink-0">
              {avatarError ? (
                <span className="text-[9px] font-bold text-accent font-mono leading-none tracking-normal select-none">
                  OMO
                </span>
              ) : (
                <img
                  src="https://avatars.githubusercontent.com/u/36997301?v=4&s=24"
                  alt="Ondrej Michal Očkaj"
                  width="24"
                  height="24"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              )}
            </span>

            <span className="text-[13px] font-medium leading-none whitespace-nowrap">
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
            className="text-xs md:text-sm px-3.5 md:px-4 py-1.5 md:py-2"
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
            onClick={() => setIsOpen(!isOpen)}
            className="size-10 p-0"
            ariaLabel="Toggle Menu"
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
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/10 backdrop-blur-[1px] md:hidden z-40 pointer-events-auto"
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>

          <div className="md:hidden z-50 w-72 mt-2 pointer-events-none">
            <LiquidGlass.Tabs
              value={active}
              onChange={handleNav}
              layoutId="active-mobile-nav-highlight"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              highlightClassName={`border border-white/10 ${isHovered || isTransitioning ? "navbar-highlight-active" : "navbar-highlight-flat"}`}
              highlightStyle={{
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
              className="relative w-full p-3 rounded-2xl border border-white/10 bg-surface/35 backdrop-blur-2xl shadow-2xl flex flex-col gap-1.5"
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
            >
              {["Home", ...NAV_LINKS].map((link) => (
                <LiquidGlass.Tab
                  key={link}
                  value={link}
                  className={`relative w-full text-center flex justify-center items-center text-sm font-medium rounded-full px-4 py-2.5 transition-colors duration-300 select-none z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    active === link
                      ? "text-text-primary"
                      : "text-muted hover:text-text-primary hover:bg-white/[0.02]"
                  }`}
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
