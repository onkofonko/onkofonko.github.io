import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useCallback,
  startTransition,
  useReducer,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useModalHistory } from "./hooks/useModalHistory";
import { useIsMobile } from "./hooks/useMediaQuery";
import { useLazyMount } from "./hooks/useLazyMount";
import { BoneSuspense } from "boneyard-js/react";

const PENDING_PROMISE = new Promise<void>(() => {});
function SuspenseTrigger() {
  throw PENDING_PROMISE;
  return null;
}

import Aurora from "./components/Aurora.tsx";
import BpmnNodeBadge from "./components/BpmnNodeBadge";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

import caseStudiesBones from "./bones/case-studies.bones.json";
import skillsBones from "./bones/skills.bones.json";
import processesBones from "./bones/processes.bones.json";
import journalBones from "./bones/journal.bones.json";
import { configureBoneyard } from "boneyard-js/react";

configureBoneyard({
  color: "rgba(255, 255, 255, 0.015)",
  darkColor: "rgba(255, 255, 255, 0.015)",
  animate: "shimmer",
  shimmerColor: "rgba(255, 255, 255, 0.08)",
  darkShimmerColor: "rgba(255, 255, 255, 0.08)",
  speed: "2s",
  shimmerAngle: 110,
  stagger: 80,
  transition: 300,
});

const getSkeletonHeight = (bonesData: {
  breakpoints?: Record<string, { height: number }>;
}) => {
  if (typeof window === "undefined" || !bonesData || !bonesData.breakpoints)
    return 0;
  const width = window.innerWidth;
  const breakpoints = Object.keys(bonesData.breakpoints)
    .map(Number)
    .sort((a, b) => b - a);
  const matchedBp =
    breakpoints.find((bp) => width >= bp) ??
    breakpoints[breakpoints.length - 1];
  return bonesData.breakpoints[matchedBp]?.height ?? 0;
};

// Cache dynamic import promises and track their resolution status

function makePreloadable<T>(importFn: () => Promise<T>) {
  let promise: Promise<T> | null = null;
  let isResolved = false;

  const load = () => {
    if (!promise) {
      promise = importFn().then((val) => {
        isResolved = true;
        return val;
      });
    }
    return promise;
  };

  return {
    load,
    getReady: () => isResolved,
  };
}

// Detect slow connections/data saver across mobile browsers (including Safari)
const isSlowConnection = () => {
  if (
    typeof window !== "undefined" &&
    (window as unknown as { __BONEYARD_BUILD?: boolean }).__BONEYARD_BUILD
  ) {
    return false;
  }
  if (typeof navigator === "undefined") return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  const conn = (
    navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (conn) {
    return (
      conn.saveData ||
      ["slow-2g", "2g", "3g"].includes(conn.effectiveType || "")
    );
  }
  return false;
};

const loadCaseStudies = makePreloadable(
  () => import("./components/CaseStudies"),
);
const loadSkills = makePreloadable(() => import("./components/Skills"));
const loadProcessLibrary = makePreloadable(
  () => import("./components/ProcessLibrary"),
);
const loadJournal = makePreloadable(() => import("./components/Journal"));
const loadPdfViewerModal = makePreloadable(
  () => import("./components/PdfViewerModal"),
);
const loadBpmnOverlay = makePreloadable(
  () => import("./components/BpmnOverlay"),
);

const CaseStudies = lazy(loadCaseStudies.load);
const Skills = lazy(loadSkills.load);
const ProcessLibrary = lazy(loadProcessLibrary.load);
const Journal = lazy(loadJournal.load);
const PdfViewerModal = lazy(loadPdfViewerModal.load);
const BpmnOverlay = lazy(loadBpmnOverlay.load);

const LABEL_MAP: Record<string, string> = {
  home: "Home",
  work: "Case Studies",
  skills: "Skills",
  processes: "Process Library",
  journal: "Journal",
  contact: "Contact",
};

const AURORA_COLOR_STOPS = ["#1E1B4B", "#312E81", "#6667AB", "#A78BFA"];

const SECTION_INITIAL = { opacity: 0, y: 30 };
const SECTION_ANIMATE = { opacity: 1, y: 0 };
const SECTION_VIEWPORT = { once: true, margin: "-100px" } as const;
const SECTION_TRANSITION = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };

interface AppState {
  isLoading: boolean;
  activeSection: string;
  isCvOpen: boolean;
}

type AppAction =
  | { type: "COMPLETE_LOADING" }
  | { type: "SET_ACTIVE_SECTION"; section: string }
  | { type: "SET_CV_OPEN"; isOpen: boolean };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "COMPLETE_LOADING":
      return { ...state, isLoading: false };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.section };
    case "SET_CV_OPEN":
      return { ...state, isCvOpen: action.isOpen };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, null, () => ({
    isLoading: (() => {
      if (
        typeof window !== "undefined" &&
        (window as unknown as { __BONEYARD_BUILD?: boolean }).__BONEYARD_BUILD
      ) {
        return false;
      }
      try {
        return !sessionStorage.getItem("portfolio_loaded");
      } catch {
        return true;
      }
    })(),
    activeSection: "Home",
    isCvOpen: false,
  }));

  const { isLoading, activeSection, isCvOpen } = state;

  const skeletonHeights = useMemo(
    () => ({
      caseStudies: getSkeletonHeight(caseStudiesBones),
      skills: getSkeletonHeight(skillsBones),
      processes: getSkeletonHeight(processesBones),
      journal: getSkeletonHeight(journalBones),
    }),
    [],
  );

  const isMobile = useIsMobile();

  const rootMargin = isMobile ? "500px" : "300px";
  const [caseStudiesRef, caseStudiesInView] = useLazyMount({ rootMargin });
  const [skillsRef, skillsInView] = useLazyMount({ rootMargin });
  const [processesRef, processesInView] = useLazyMount({ rootMargin });
  const [journalRef, journalInView] = useLazyMount({ rootMargin });

  const ignoreScrollUntil = useRef(0);
  const visibleSections = useRef<Record<string, boolean>>({});
  const navbarSentinelRef = useRef<HTMLDivElement>(null);

  // Close CV viewer modal on back swipe / browser back button
  useModalHistory(isCvOpen, () =>
    dispatch({ type: "SET_CV_OPEN", isOpen: false }),
  );

  // Preload lazy components concurrently with main-thread yielding to protect INP
  useEffect(() => {
    if (isSlowConnection()) return;

    let active = true;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const yieldToMain = async () => {
      const scheduler = (
        window as Window & { scheduler?: { yield: () => Promise<void> } }
      ).scheduler;
      if (typeof scheduler?.yield === "function") {
        await scheduler.yield();
      } else {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    };

    const preloadAll = async () => {
      const queue = [
        { loader: loadCaseStudies, key: "caseStudies" },
        { loader: loadSkills, key: "skills" },
        { loader: loadProcessLibrary, key: "processes" },
        { loader: loadJournal, key: "journal" },
        { loader: loadPdfViewerModal, key: "pdfViewerModal" },
        ...(isMobile ? [] : [{ loader: loadBpmnOverlay, key: "bpmnOverlay" }]),
      ];

      if (import.meta.env.DEV) {
        performance.mark("preload-queue-start");
      }

      for (const item of queue) {
        if (!active) break;
        item.loader.load().catch(() => {});
        await yieldToMain();
      }

      if (import.meta.env.DEV) {
        performance.mark("preload-queue-end");
        performance.measure(
          "preload-queue-duration",
          "preload-queue-start",
          "preload-queue-end",
        );
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          if (active) preloadAll();
        },
        { timeout: 2000 },
      );
    } else {
      timeoutId = window.setTimeout(() => {
        if (active) preloadAll();
      }, 0);
    }

    return () => {
      active = false;
      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isMobile]);

  // Dynamic Scroll Highlighting Observer
  useEffect(() => {
    if (isLoading) return;

    const sections = [
      "home",
      "work",
      "skills",
      "processes",
      "journal",
      "contact",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        // Update the visibility status of all changed entries
        entries.forEach((entry) => {
          visibleSections.current[entry.target.id] = entry.isIntersecting;
        });

        // Ignore updates during programmatic scrolling
        if (Date.now() < ignoreScrollUntil.current) return;

        // Find all currently visible sections based on our visibility map
        const visible = sections.filter((id) => visibleSections.current[id]);
        if (visible.length > 0) {
          const targetId = visible[visible.length - 1];
          dispatch({
            type: "SET_ACTIVE_SECTION",
            section: LABEL_MAP[targetId] || "Home",
          });

          // Synchronize URL hash
          const newHash = `#${targetId}`;
          if (window.location.hash !== newHash) {
            window.history.replaceState(null, "", newHash);
          }
        }
      },
      { rootMargin: "-25% 0px -55% 0px" },
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  const handleNavClick = useCallback((section: string) => {
    startTransition(() => {
      dispatch({ type: "SET_ACTIVE_SECTION", section });
    });
    ignoreScrollUntil.current = Date.now() + 1000; // Lock scrollspy updates for 1s during smooth scroll

    // Synchronize URL hash
    const sectionId = Object.keys(LABEL_MAP).find(
      (key) => LABEL_MAP[key] === section,
    );
    if (sectionId) {
      const newHash = `#${sectionId}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, "", newHash);
      }
    }
  }, []);

  const handleViewWork = useCallback(() => {
    handleNavClick("Case Studies");
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  }, [handleNavClick]);

  const handleViewCv = useCallback(() => {
    dispatch({ type: "SET_CV_OPEN", isOpen: true });
  }, []);

  const handleLoadingComplete = useCallback(() => {
    dispatch({ type: "COMPLETE_LOADING" });
    try {
      sessionStorage.setItem("portfolio_loaded", "true");
    } catch {
      // Ignore errors (e.g. private browsing restrictions)
    }
  }, []);

  // Handle initial deep-linking based on URL hash
  useEffect(() => {
    if (isLoading) return;
    const hash = window.location.hash;
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (hash) {
      const targetId = hash.substring(1);
      const label = LABEL_MAP[targetId];
      if (label) {
        const element = document.getElementById(targetId);
        timer = setTimeout(() => {
          dispatch({ type: "SET_ACTIVE_SECTION", section: label });
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen onComplete={handleLoadingComplete} />
        ) : null}
      </AnimatePresence>

      {!isLoading ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0"
        >
          <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <ErrorBoundary
              fallback={
                <div className="absolute inset-0 bg-gradient-to-b from-[#1E1B4B] to-[#0a0a0a]" />
              }
            >
              <Aurora
                colorStops={AURORA_COLOR_STOPS}
                speed={1.0}
                amplitude={1.0}
                blend={0.65}
              />
            </ErrorBoundary>
          </div>
        </div>
      ) : null}

      <main
        id="main-content"
        className="relative z-10 text-text-primary font-body"
      >
        <div
          ref={navbarSentinelRef}
          className="absolute top-[100px] left-0 w-px h-px pointer-events-none opacity-0"
        />
        <Navbar
          activeSection={activeSection}
          onNavClick={handleNavClick}
          sentinelRef={navbarSentinelRef}
        />

        <div id="home">
          <Hero onViewCv={handleViewCv} onViewWork={handleViewWork} />
        </div>

        <section
          ref={caseStudiesRef}
          id="work"
          className="bg-transparent pt-16 md:pt-24 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
              className="mb-12 md:mb-16 relative z-30 px-6 md:px-10 lg:px-16"
            >
              <div className="mb-4">
                <span className="text-xs text-muted uppercase font-semibold flex items-center gap-1.5">
                  <BpmnNodeBadge type="task" />
                  Case Studies
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance">
                Process transformation projects
              </h2>
              <p className="text-sm text-muted max-w-sm text-pretty">
                Real-world analysis and digital solutions across supply chain,
                logistics, and HR domains.
              </p>
            </motion.div>
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
            >
              <div style={{ minHeight: skeletonHeights.caseStudies }}>
                <BoneSuspense
                  name="case-studies"
                  className="min-h-[inherit]"
                  fallback={
                    <div className="px-6 md:px-10 lg:px-16">
                      <div style={{ height: skeletonHeights.caseStudies }} />
                    </div>
                  }
                >
                  {caseStudiesInView ? <CaseStudies /> : <SuspenseTrigger />}
                </BoneSuspense>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          ref={skillsRef}
          id="skills"
          className="bg-transparent pt-16 md:pt-24 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
              className="mb-8 md:mb-10 relative z-30 px-6 md:px-10 lg:px-16"
            >
              <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance flex items-center gap-3">
                <BpmnNodeBadge
                  type="gateway-or"
                  className="translate-y-[2px]"
                />
                Skills & competencies
              </h2>
              <p className="text-sm text-muted max-w-sm text-pretty">
                Comprehensive toolkit for process analysis, business
                transformation, and digital solutions.
              </p>
            </motion.div>
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
            >
              <div style={{ minHeight: skeletonHeights.skills }}>
                <BoneSuspense
                  name="skills"
                  className="min-h-[inherit]"
                  fallback={
                    <div className="px-6 md:px-10 lg:px-16">
                      <div style={{ height: skeletonHeights.skills }} />
                    </div>
                  }
                >
                  {skillsInView ? <Skills /> : <SuspenseTrigger />}
                </BoneSuspense>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          ref={processesRef}
          id="processes"
          className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
              className="mb-10 md:mb-14 relative z-30 px-6 md:px-10 lg:px-16"
            >
              <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance flex items-center gap-3">
                <BpmnNodeBadge
                  type="subprocess-collapsed"
                  className="translate-y-[2px]"
                />
                BPMN & Process models
              </h2>
              <p className="text-sm text-muted max-w-sm text-pretty">
                Real-world enterprise process diagrams, workflows, and
                transformation models.
              </p>
            </motion.div>
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
            >
              <div style={{ minHeight: skeletonHeights.processes }}>
                <BoneSuspense
                  name="processes"
                  className="min-h-[inherit]"
                  fallback={
                    <div className="px-6 md:px-10 lg:px-16">
                      <div style={{ height: skeletonHeights.processes }} />
                    </div>
                  }
                >
                  {processesInView ? <ProcessLibrary /> : <SuspenseTrigger />}
                </BoneSuspense>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          ref={journalRef}
          id="journal"
          className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
              className="flex items-end justify-between mb-10 md:mb-14 px-6 md:px-10 lg:px-16"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-display text-text-primary mb-3 text-balance flex items-center gap-3">
                  <BpmnNodeBadge
                    type="intermediate-event-catch-message"
                    className="translate-y-[2px]"
                  />
                  Recent thought pieces
                </h2>
                <p className="text-sm text-muted max-w-sm text-pretty">
                  Analyzing process optimization, systems integrations, and
                  enterprise digital transformation frameworks.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
            >
              <div style={{ minHeight: skeletonHeights.journal }}>
                <BoneSuspense
                  name="journal"
                  className="min-h-[inherit]"
                  fallback={
                    <div className="px-6 md:px-10 lg:px-16">
                      <div style={{ height: skeletonHeights.journal }} />
                    </div>
                  }
                >
                  {journalInView ? <Journal /> : <SuspenseTrigger />}
                </BoneSuspense>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="contact"
          className="relative w-full min-h-[100dvh] flex items-center justify-center"
        >
          <div className="relative z-10">
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
              className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center pb-2"
            >
              <p className="text-xs text-muted uppercase font-semibold mb-5 text-pretty flex items-center justify-center gap-1.5">
                <BpmnNodeBadge type="end-event-none" />
                Get in touch
              </p>
              <h2 className="text-[clamp(3.5rem,8vw,6rem)] font-display text-text-primary mb-6 leading-[1.1] pb-2 text-balance">
                Let's work together
              </h2>
              <p className="text-sm md:text-base text-muted max-w-md mx-auto mb-10 text-pretty">
                Looking to analyze, map, and optimize your business processes,
                design digital transformation solutions, or fill an analyst
                role? Let's connect.
              </p>
            </motion.div>
            <motion.div
              initial={SECTION_INITIAL}
              whileInView={SECTION_ANIMATE}
              viewport={SECTION_VIEWPORT}
              transition={SECTION_TRANSITION}
            >
              <Contact />
            </motion.div>
          </div>
          <div className="absolute bottom-0 w-full">
            <Footer />
          </div>
        </section>

        <Suspense fallback={null}>
          <PdfViewerModal
            isOpen={isCvOpen}
            onClose={() => dispatch({ type: "SET_CV_OPEN", isOpen: false })}
          />
        </Suspense>

        <Suspense fallback={null}>
          {!isLoading && !isMobile ? <BpmnOverlay /> : null}
        </Suspense>
      </main>
    </>
  );
}
