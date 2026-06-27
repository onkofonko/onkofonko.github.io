import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { LiquidGlass, LiquidGlassButton } from "./LiquidGlass/LiquidGlass";
import BpmnNodeBadge from "./BpmnNodeBadge";
import { useIsMobile } from "../hooks/useMediaQuery";

export default function BpmnOverlay() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const typedBufferRef = useRef<string[]>([]);
  const [showHotkeyTip, setShowHotkeyTip] = useState(false);

  // Keyboard shortcut listener for 'B-P-M-N'
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses in input fields or textareas
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      const key = e.key.toLowerCase();
      if (["b", "p", "m", "n"].includes(key)) {
        typedBufferRef.current = [...typedBufferRef.current, key].slice(-4);
        if (typedBufferRef.current.join("") === "bpmn") {
          setIsOpen(true);
          typedBufferRef.current = [];
        }
      } else {
        typedBufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Show a brief toast notification on how to trigger if user spends time on the site
  useEffect(() => {
    if (isMobile) return;

    const timer = setTimeout(() => {
      setShowHotkeyTip(true);
      // Fade out after 6 seconds
      const fadeTimer = setTimeout(() => {
        setShowHotkeyTip(false);
      }, 6000);
      return () => clearTimeout(fadeTimer);
    }, 12000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleTaskClick = (sectionId: string) => {
    setIsOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // SVGs for the Interactive BPMN Diagram
  return (
    <>
      {/* Subtle Toast Tip */}
      <AnimatePresence>
        {showHotkeyTip && !isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="hidden md:block fixed bottom-6 right-6 z-40 max-w-sm text-xs pointer-events-auto"
          >
            <LiquidGlass
              as="div"
              roundedClass="rounded-xl"
              className="p-3 shadow-2xl border border-white/10"
              innerClassName="flex items-center gap-3 w-full"
              interactive
              specularGlow
            >
              <BpmnNodeBadge type="script-task" className="flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-text-primary text-[12px]">
                  Process Analyst Easter Egg
                </p>
                <p className="text-muted text-[11px] mt-0.5 leading-tight text-pretty">
                  Type{" "}
                  <span className="font-mono text-accent font-bold">
                    B-P-M-N
                  </span>{" "}
                  on your keyboard to reveal the portfolio's meta-diagram.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHotkeyTip(false)}
                className="text-muted hover:text-white p-1 flex-shrink-0"
              >
                <X size={12} />
              </button>
            </LiquidGlass>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Full Screen Blueprint BPMN Overlay */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#05070D]/96 backdrop-blur-md flex flex-col justify-between p-6 md:p-10 select-none overflow-y-auto"
            style={{
              backgroundImage:
                "radial-gradient(rgba(102,103,171,0.06) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* Header Area */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4 w-full">
              <div>
                <h1 className="text-xl md:text-3xl font-display text-text-primary">
                  Portfolio System Operation Blueprint
                </h1>
                <p className="text-xs text-muted max-w-xl leading-relaxed mt-1 text-pretty">
                  Click any visitor task box in the upper lane to navigate
                  directly to that section. Press{" "}
                  <span className="font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-xl text-accent font-bold">
                    ESC
                  </span>{" "}
                  or click close to dismiss.
                </p>
              </div>
              <LiquidGlassButton
                onClick={() => setIsOpen(false)}
                ariaLabel="Close model overlay"
                className="size-11 p-0 flex-shrink-0"
              >
                <X size={18} />
              </LiquidGlassButton>
            </div>

            {/* BPMN Diagram Core */}
            <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center py-6 md:py-10 overflow-x-auto custom-cv-scrollbar">
              <svg
                viewBox="0 0 1000 330"
                className="min-w-[950px] w-full h-auto text-accent"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Glowing visual filters */}
                  <filter
                    id="bpmn-glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>
                  {/* Arrow markers */}
                  <marker
                    id="bpmn-arrow"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M 0 1.5 L 8 5 L 0 8.5 z"
                      fill="hsl(var(--accent))"
                    />
                  </marker>
                </defs>

                {/* Pool Frame */}
                <rect
                  x="30"
                  y="50"
                  width="940"
                  height="250"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.1"
                  fill="#0A0E1A"
                  fillOpacity="0.4"
                />
                <line
                  x1="65"
                  y1="50"
                  x2="65"
                  y2="300"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.1"
                />
                <text
                  x="45"
                  y="175"
                  fill="currentColor"
                  fillOpacity="0.4"
                  fontSize="12"
                  fontWeight="bold"
                  transform="rotate(-90,45,175)"
                  letterSpacing="0.15em"
                  textAnchor="middle"
                  className="font-mono"
                >
                  PORTFOLIO
                </text>

                {/* Lane Divider */}
                <text
                  x="58"
                  y="175"
                  fill="currentColor"
                  fillOpacity="0.3"
                  fontSize="9.5"
                  fontWeight="bold"
                  transform="rotate(-90,58,175)"
                  letterSpacing="0.05em"
                  textAnchor="middle"
                  className="font-mono"
                >
                  LANE: VISITOR / USER
                </text>

                {/* ================== VISITOR LANE NODES ================== */}

                {/* Start Event */}
                <circle
                  cx="105"
                  cy="150"
                  r="15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="currentColor"
                  fillOpacity="0.05"
                />
                <text
                  x="105"
                  y="180"
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity="0.5"
                  fontSize="10"
                  className="font-mono"
                >
                  Arrives at URL
                </text>

                {/* Flow: Start -> Hero */}
                <path
                  d="M 120,150 L 155,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* Task: View Hero */}
                <g
                  className="cursor-pointer group/node"
                  onClick={() => handleTaskClick("home")}
                >
                  <rect
                    x="155"
                    y="115"
                    width="110"
                    height="70"
                    rx="6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                    style={{ filter: "url(#bpmn-glow)" }}
                  />
                  {/* Task label */}
                  <text
                    x="210"
                    y="146"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    View Hero
                  </text>
                  <text
                    x="210"
                    y="160"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.5"
                    fontSize="9"
                    className="font-mono"
                  >
                    Landing Page
                  </text>
                </g>

                {/* Flow: Hero -> Gateway */}
                <path
                  d="M 265,150 L 320,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* Split Parallel Gateway */}
                <polygon
                  points="320,150 335,135 350,150 335,165"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="#0A0E17"
                />
                <path
                  d="M 335,141 L 335,159 M 326,150 L 344,150"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Parallel Gateway branches */}
                <path
                  d="M 335,135 L 335,90 L 370,90"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <path
                  d="M 350,150 L 370,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <path
                  d="M 335,165 L 335,210 L 370,210"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* Task: Browse Case Studies */}
                <g
                  className="cursor-pointer group/node animate-pulse-slow"
                  onClick={() => handleTaskClick("work")}
                >
                  <rect
                    x="370"
                    y="70"
                    width="135"
                    height="40"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                  />
                  <text
                    x="437.5"
                    y="90"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10.5"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    Browse Case Studies
                  </text>
                  <text
                    x="437.5"
                    y="100"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.4"
                    fontSize="8.5"
                    className="font-mono"
                  >
                    User Task
                  </text>
                </g>

                {/* Task: Scan Skills */}
                <g
                  className="cursor-pointer group/node"
                  onClick={() => handleTaskClick("skills")}
                >
                  <rect
                    x="370"
                    y="130"
                    width="135"
                    height="40"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                  />
                  <text
                    x="437.5"
                    y="150"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10.5"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    Scan Competencies
                  </text>
                  <text
                    x="437.5"
                    y="160"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.4"
                    fontSize="8.5"
                    className="font-mono"
                  >
                    User Task
                  </text>
                </g>

                {/* Task: Review Process Library */}
                <g
                  className="cursor-pointer group/node"
                  onClick={() => handleTaskClick("processes")}
                >
                  <rect
                    x="370"
                    y="190"
                    width="135"
                    height="40"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                  />
                  <text
                    x="437.5"
                    y="210"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10.5"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    Inspect Process Library
                  </text>
                  <text
                    x="437.5"
                    y="220"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.4"
                    fontSize="8.5"
                    className="font-mono"
                  >
                    User Task
                  </text>
                </g>

                {/* Add Journal task path slightly offset */}
                <path
                  d="M 335,165 L 335,260 L 370,260"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* Task: Consume Journal */}
                <g
                  className="cursor-pointer group/node"
                  onClick={() => handleTaskClick("journal")}
                >
                  <rect
                    x="370"
                    y="240"
                    width="135"
                    height="40"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                  />
                  <text
                    x="437.5"
                    y="260"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10.5"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    Read Thought Pieces
                  </text>
                  <text
                    x="437.5"
                    y="270"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.4"
                    fontSize="8.5"
                    className="font-mono"
                  >
                    User Task
                  </text>
                </g>

                {/* Branch merges to Join Parallel Gateway */}
                <path
                  d="M 505,90 L 540,90 L 540,135"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <path
                  d="M 505,150 L 525,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <path
                  d="M 505,210 L 540,210 L 540,165"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <path
                  d="M 505,260 L 540,260 L 540,210"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />

                {/* Join Parallel Gateway */}
                <polygon
                  points="525,150 540,135 555,150 540,165"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="#0A0E17"
                />
                <path
                  d="M 540,141 L 540,159 M 531,150 L 549,150"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                <path
                  d="M 555,150 L 605,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* Exclusive Gateway: Contact wanted? */}
                <polygon
                  points="605,150 620,135 635,150 620,165"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="#0A0E17"
                />
                <path
                  d="M 614,144 L 626,156 M 626,144 L 614,156"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <text
                  x="620"
                  y="125"
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity="0.6"
                  fontSize="10"
                  className="font-mono"
                >
                  Contact wanted?
                </text>

                {/* Flow Yes -> Contact Task */}
                <path
                  d="M 635,150 L 675,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <text
                  x="647"
                  y="144"
                  fill="currentColor"
                  fillOpacity="0.8"
                  fontSize="10"
                  className="font-mono"
                >
                  Yes
                </text>

                {/* Task: Get in Touch */}
                <g
                  className="cursor-pointer group/node"
                  onClick={() => handleTaskClick("contact")}
                >
                  <rect
                    x="675"
                    y="115"
                    width="115"
                    height="70"
                    rx="6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="#0A0E17"
                    className="transition-[stroke,fill] duration-200 ease-out group-hover/node:stroke-accent group-hover/node:fill-accent/5"
                    style={{ filter: "url(#bpmn-glow)" }}
                  />
                  <text
                    x="732.5"
                    y="146"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="bold"
                    className="group-hover/node:fill-accent font-sans"
                  >
                    Get in Touch
                  </text>
                  <text
                    x="732.5"
                    y="160"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.5"
                    fontSize="9.5"
                    className="font-mono"
                  >
                    Call to Action
                  </text>
                </g>

                {/* Flow No -> End Event */}
                <path
                  d="M 620,165 L 620,240 L 810,240 L 810,150 L 865,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />
                <text
                  x="626"
                  y="180"
                  fill="currentColor"
                  fillOpacity="0.8"
                  fontSize="10"
                  className="font-mono"
                >
                  No
                </text>

                {/* Merge Contact flow to End */}
                <path
                  d="M 790,150 L 865,150"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bpmn-arrow)"
                />

                {/* End Event */}
                <circle
                  cx="880"
                  cy="150"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="currentColor"
                  fillOpacity="0.08"
                />
                <text
                  x="880"
                  y="180"
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity="0.5"
                  fontSize="10"
                  className="font-mono"
                >
                  Exploration End
                </text>
              </svg>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
