import {
  Suspense,
  lazy,
  useState,
  useEffect,
  useRef,
  useCallback,
  startTransition,
} from "react";
import { AnimatePresence } from "motion/react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DeferredSection from "./components/DeferredSection.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useModalHistory } from "./hooks/useModalHistory";
import { useIsMobile } from "./hooks/useMediaQuery";

// Cache dynamic import promises so React 19 lazy() can unpack them synchronously without a microtask tick
function makePreloadable<T>(importFn: () => Promise<T>) {
  let promise: Promise<T> | null = null;
  return () => {
    if (!promise) {
      promise = importFn();
    }
    return promise;
  };
}

// Detect slow connections/data saver across mobile browsers (including Safari)
const isSlowConnection = () => {
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
const loadAurora = makePreloadable(() => import("./components/Aurora.tsx"));
const loadPdfViewerModal = makePreloadable(
  () => import("./components/PdfViewerModal"),
);
const loadBpmnOverlay = makePreloadable(
  () => import("./components/BpmnOverlay"),
);

const CaseStudies = lazy(loadCaseStudies);
const Skills = lazy(loadSkills);
const ProcessLibrary = lazy(loadProcessLibrary);
const Journal = lazy(loadJournal);
const Contact = lazy(loadContact);
const Aurora = lazy(loadAurora);
const PdfViewerModal = lazy(loadPdfViewerModal);
const BpmnOverlay = lazy(loadBpmnOverlay);

const LABEL_MAP: Record<string, string> = {
  home: "Home",
  work: "Case Studies",
  skills: "Skills",
  processes: "Process Library",
  journal: "Journal",
  contact: "Contact",
};

const AURORA_COLOR_STOPS = ["#1E1B4B", "#312E81", "#6667AB", "#A78BFA"];

export default function App() {
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("portfolio_loaded");
    } catch {
      return true;
    }
  });
  const [activeSection, setActiveSection] = useState("Home");
  const [isCvOpen, setIsCvOpen] = useState(false);
  const isMobile = useIsMobile();
  const ignoreScrollUntil = useRef(0);
  const visibleSections = useRef<Record<string, boolean>>({});
  const navbarSentinelRef = useRef<HTMLDivElement>(null);

  // Close CV viewer modal on back swipe / browser back button
  useModalHistory(isCvOpen, () => setIsCvOpen(false));

  // Preload lazy components in a staggered queue to avoid CPU/network congestion on user interaction
  useEffect(() => {
    if (isLoading) return;

    let hasInteracted = false;
    let preloadTimeout: ReturnType<typeof setTimeout> | null = null;
    let staggerTimeout: ReturnType<typeof setTimeout> | null = null;
    let idleHandle: number | null = null;

    const startPreloading = () => {
      if (isSlowConnection()) return;

      const primaryPreloads = [
        loadCaseStudies,
        loadSkills,
        loadProcessLibrary,
        loadJournal,
        loadContact,
      ];

      const secondaryPreloads = isMobile
        ? [loadAurora, loadPdfViewerModal]
        : [loadAurora, loadPdfViewerModal, loadBpmnOverlay];

      const queue = [...primaryPreloads, ...secondaryPreloads];

      const processNext = (currentIndex: number) => {
        if (currentIndex < queue.length) {
          const fn = queue[currentIndex];
          fn()
            .catch(() => {})
            .finally(() => {
              staggerTimeout = setTimeout(
                () => processNext(currentIndex + 1),
                250,
              );
            });
        }
      };

      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => processNext(0), {
          timeout: 3000,
        });
      } else {
        requestAnimationFrame(() => {
          staggerTimeout = setTimeout(() => processNext(0), 50);
        });
      }
    };

    const triggerPreload = () => {
      if (hasInteracted) return;
      hasInteracted = true;
      cleanup();
      if (preloadTimeout) clearTimeout(preloadTimeout);
      startPreloading();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", triggerPreload);
      window.removeEventListener("touchstart", triggerPreload);
      window.removeEventListener("pointerdown", triggerPreload);
    };

    window.addEventListener("scroll", triggerPreload, { passive: true });
    window.addEventListener("touchstart", triggerPreload, { passive: true });
    window.addEventListener("pointerdown", triggerPreload, { passive: true });

    // Speculative backup preloader (after 3s of idleness)
    preloadTimeout = setTimeout(() => {
      triggerPreload();
    }, 3000);

    return () => {
      cleanup();
      if (preloadTimeout) clearTimeout(preloadTimeout);
      if (staggerTimeout) clearTimeout(staggerTimeout);
      if (
        idleHandle !== null &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [isLoading, isMobile]);

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
        <Suspense fallback={null}>
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-0"
          >
            <div
              style={{ height: "100%", width: "100%", position: "relative" }}
            >
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
        </Suspense>
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

        <div id="work">
          <DeferredSection minHeight="1200px">
            <CaseStudies />
          </DeferredSection>
        </div>

        <div id="skills">
          <DeferredSection minHeight="1100px">
            <Skills />
          </DeferredSection>
        </div>

        <div id="processes">
          <DeferredSection minHeight="800px">
            <ProcessLibrary />
          </DeferredSection>
        </div>

        <div id="journal">
          <DeferredSection minHeight="600px">
            <Journal />
          </DeferredSection>
        </div>

        <div id="contact">
          <DeferredSection minHeight="700px">
            <Contact onViewCv={handleViewCv} />
          </DeferredSection>
        </div>

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
