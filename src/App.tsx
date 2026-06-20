import {
  Suspense,
  lazy,
  useState,
  useEffect,
  useRef,
  useCallback,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useModalHistory } from "./hooks/useModalHistory";
import { useIsMobile } from "./hooks/useMediaQuery";
import { Skeleton } from "boneyard-js/react";
import Aurora from "./components/Aurora.tsx";
import BpmnNodeBadge from "./components/BpmnNodeBadge";

import caseStudiesBones from "./bones/case-studies.bones.json";
import skillsBones from "./bones/skills.bones.json";
import processesBones from "./bones/processes.bones.json";
import journalBones from "./bones/journal.bones.json";
import contactBones from "./bones/contact.bones.json";
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
const loadContact = makePreloadable(() => import("./components/Contact"));
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
const Contact = lazy(loadContact.load);
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

const SKELETON_CHUNKS = new Set([
  "caseStudies",
  "skills",
  "processes",
  "journal",
  "contact",
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(() => {
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
  });
  const [chunksReady, setChunksReady] = useState(() => ({
    caseStudies: loadCaseStudies.getReady(),
    skills: loadSkills.getReady(),
    processes: loadProcessLibrary.getReady(),
    journal: loadJournal.getReady(),
    contact: loadContact.getReady(),
  }));
  const [skeletonHeights] = useState(() => ({
    caseStudies: getSkeletonHeight(caseStudiesBones),
    skills: getSkeletonHeight(skillsBones),
    processes: getSkeletonHeight(processesBones),
    journal: getSkeletonHeight(journalBones),
    contact: getSkeletonHeight(contactBones),
  }));
  const [activeSection, setActiveSection] = useState("Home");
  const [isCvOpen, setIsCvOpen] = useState(false);
  const isMobile = useIsMobile();
  const ignoreScrollUntil = useRef(0);
  const visibleSections = useRef<Record<string, boolean>>({});
  const navbarSentinelRef = useRef<HTMLDivElement>(null);

  // Close CV viewer modal on back swipe / browser back button
  useModalHistory(isCvOpen, () => setIsCvOpen(false));

  // Preload lazy components concurrently with main-thread yielding to protect INP
  useEffect(() => {
    if (isSlowConnection()) return;

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
        { loader: loadContact, key: "contact" },
        { loader: loadPdfViewerModal, key: "pdfViewerModal" },
        ...(isMobile ? [] : [{ loader: loadBpmnOverlay, key: "bpmnOverlay" }]),
      ];

      if (import.meta.env.DEV) {
        performance.mark("preload-queue-start");
      }

      for (const item of queue) {
        item.loader
          .load()
          .then(() => {
            if (SKELETON_CHUNKS.has(item.key)) {
              setChunksReady((prev) => ({ ...prev, [item.key]: true }));
            }
          })
          .catch(() => {});
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
      window.requestIdleCallback(() => preloadAll(), { timeout: 2000 });
    } else {
      setTimeout(() => preloadAll(), 0);
    }
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
          setActiveSection(LABEL_MAP[targetId] || "Home");
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
      setActiveSection(section);
    });
    ignoreScrollUntil.current = Date.now() + 1000; // Lock scrollspy updates for 1s during smooth scroll
  }, []);

  const handleViewWork = useCallback(() => {
    handleNavClick("Case Studies");
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  }, [handleNavClick]);

  const handleViewCv = useCallback(() => {
    setIsCvOpen(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    try {
      sessionStorage.setItem("portfolio_loaded", "true");
    } catch {
      // Ignore errors (e.g. private browsing restrictions)
    }
  }, []);

  // Synchronize activeSection with URL hash
  useEffect(() => {
    if (isLoading) return;
    const sectionId = Object.keys(LABEL_MAP).find(
      (key) => LABEL_MAP[key] === activeSection,
    );
    if (sectionId) {
      const newHash = `#${sectionId}`;
      if (window.location.hash !== newHash) {
        if (Date.now() < ignoreScrollUntil.current) {
          window.history.pushState(null, "", newHash);
        } else {
          window.history.replaceState(null, "", newHash);
        }
      }
    }
  }, [activeSection, isLoading]);

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
          setActiveSection(label);
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
          id="work"
          className="bg-transparent pt-16 md:pt-24 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-12 md:mb-16 relative z-30"
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
            <Skeleton name="case-studies" loading={!chunksReady.caseStudies}>
              <Suspense
                fallback={
                  <div style={{ height: skeletonHeights.caseStudies }} />
                }
              >
                <CaseStudies />
              </Suspense>
            </Skeleton>
          </div>
        </section>

        <section
          id="skills"
          className="bg-transparent pt-16 md:pt-24 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-8 md:mb-10 relative z-30"
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
            <Skeleton name="skills" loading={!chunksReady.skills}>
              <Suspense
                fallback={<div style={{ height: skeletonHeights.skills }} />}
              >
                <Skills />
              </Suspense>
            </Skeleton>
          </div>
        </section>

        <section
          id="processes"
          className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-10 md:mb-14 relative z-30"
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
            <Skeleton name="processes" loading={!chunksReady.processes}>
              <Suspense
                fallback={<div style={{ height: skeletonHeights.processes }} />}
              >
                <ProcessLibrary />
              </Suspense>
            </Skeleton>
          </div>
        </section>

        <section
          id="journal"
          className="bg-transparent pt-16 md:pt-24 pb-0 scroll-mt-20 md:scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-end justify-between mb-10 md:mb-14"
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
            <Skeleton name="journal" loading={!chunksReady.journal}>
              <Suspense
                fallback={<div style={{ height: skeletonHeights.journal }} />}
              >
                <Journal />
              </Suspense>
            </Skeleton>
          </div>
        </section>

        <footer
          id="contact"
          className="bg-transparent pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden relative scroll-mt-20 md:scroll-mt-24"
        >
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center pb-2"
            >
              <p className="text-xs text-muted uppercase font-semibold mb-5 text-pretty flex items-center justify-center gap-1.5">
                <BpmnNodeBadge type="end-event-none" />
                Get in touch
              </p>
              <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-display text-text-primary mb-10 leading-[1.1] pb-2 text-balance">
                Let's work together
              </h2>
            </motion.div>
            <Skeleton name="contact" loading={!chunksReady.contact}>
              <Suspense
                fallback={<div style={{ height: skeletonHeights.contact }} />}
              >
                <Contact onViewCv={handleViewCv} />
              </Suspense>
            </Skeleton>
          </div>
        </footer>

        <Suspense fallback={null}>
          <PdfViewerModal
            isOpen={isCvOpen}
            onClose={() => setIsCvOpen(false)}
          />
        </Suspense>

        <Suspense fallback={null}>
          {!isLoading && !isMobile ? <BpmnOverlay /> : null}
        </Suspense>
      </main>
    </>
  );
}
