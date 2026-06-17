import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface DeferredSectionProps {
  children: ReactNode;
  minHeight: string | number;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
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

// Premium styled skeleton matching LiquidGlass cards layout and typography kickers
function SectionSkeleton({ minHeight }: { minHeight: string | number }) {
  const heightStr =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  return (
    <div
      style={{ minHeight: heightStr }}
      className="w-full flex flex-col justify-start py-12 px-6 md:px-8 space-y-8 animate-pulse pointer-events-none select-none"
    >
      {/* Header Kicker / Badge Skeleton */}
      <div className="flex items-center space-x-3 max-w-4xl mx-auto w-full">
        <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05]" />
        <div className="h-4 w-24 bg-white/[0.03] rounded" />
      </div>

      {/* Title Skeleton */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <div className="h-10 w-2/3 md:w-1/3 bg-white/[0.03] rounded-lg" />
      </div>

      {/* Card Skeleton */}
      <div className="max-w-4xl mx-auto w-full bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 md:p-8 flex flex-col gap-6 backdrop-blur-lg">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-16 bg-white/[0.03] rounded" />
          <div className="w-1 h-1 rounded-full bg-white/[0.03]" />
          <div className="h-3 w-24 bg-white/[0.03] rounded" />
        </div>
        <div className="h-6 w-3/4 bg-white/[0.03] rounded" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-white/[0.02] rounded" />
          <div className="h-3 w-5/6 bg-white/[0.02] rounded" />
          <div className="h-3 w-4/5 bg-white/[0.02] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function DeferredSection({
  children,
  minHeight,
  rootMargin,
  className,
  style,
}: DeferredSectionProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Client-side environment check to prevent SSR hydration mismatch warnings
    if (typeof IntersectionObserver === "undefined") {
      // Defer setting state to avoid synchronous cascading render warning
      Promise.resolve().then(() => setShouldRender(true));
      return;
    }

    if (shouldRender) return;

    const host = hostRef.current;
    if (!host) return;

    // Get adaptive rootMargin based on viewport size and connection speed if not provided
    const getAdaptiveRootMargin = () => {
      if (rootMargin) return rootMargin;
      const isMobileViewport = window.innerWidth < 768;
      const slow = isSlowConnection();

      if (isMobileViewport) {
        // Mobile momentum scrolling requires a larger runway.
        // On slow connections, use a wide buffer to give network requests time to complete.
        return slow ? "1200px 0px" : "600px 0px";
      }

      // Desktop scrolling is more linear and controlled; we don't need to over-render multiple screens down.
      return slow ? "900px 0px" : "500px 0px";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      { rootMargin: getAdaptiveRootMargin() },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  const heightStr =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        ...style,
        // Only apply containment before content loads — keeping it after breaks child rendering
        ...(shouldRender
          ? {}
          : {
              contentVisibility: "auto",
              containIntrinsicHeight: `auto ${heightStr}`,
            }),
      }}
    >
      {shouldRender ? (
        <Suspense fallback={<SectionSkeleton minHeight={minHeight} />}>
          {/* CSS hardware-accelerated fadeIn removes motion/react overhead on mount */}
          <div className="animate-fade-in w-full">{children}</div>
        </Suspense>
      ) : (
        <SectionSkeleton minHeight={minHeight} />
      )}
    </div>
  );
}
