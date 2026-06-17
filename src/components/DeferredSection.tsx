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
  variant?: "card" | "grid" | "list" | "split" | "footer";
  count?: number;
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

function CardSkeleton({ count = 1 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto w-full">
      {items.map((i) => (
        <div
          key={i}
          className="w-full bg-white/[0.015] border border-white/[0.04] rounded-2xl backdrop-blur-lg"
        >
          {/* Content grid */}
          <div className="relative z-10 grid md:grid-cols-12 gap-6 md:gap-8 p-6 md:p-8 w-full h-full">
            {/* Left column: Category, title, challenge, solution, tools */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {/* Category badge */}
              <div>
                <span className="inline-block h-6 w-24 bg-white/[0.03] border border-white/[0.05] rounded-full" />
              </div>

              {/* Title & subtitle */}
              <div>
                <div className="h-8 w-3/4 bg-white/[0.03] rounded-lg mb-2" />
                <div className="h-4 w-1/2 bg-white/[0.02] rounded" />
              </div>

              {/* Challenge */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="size-4 rounded bg-white/[0.03] border border-white/[0.05] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-white/[0.03] rounded mb-1" />
                    <div className="h-3.5 w-full bg-white/[0.02] rounded" />
                    <div className="h-3.5 w-11/12 bg-white/[0.02] rounded" />
                    <div className="h-3.5 w-4/5 bg-white/[0.02] rounded" />
                  </div>
                </div>
              </div>

              {/* Solution */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="size-4 rounded bg-white/[0.03] border border-white/[0.05] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-white/[0.03] rounded mb-1" />
                    <div className="h-3.5 w-full bg-white/[0.02] rounded" />
                    <div className="h-3.5 w-11/12 bg-white/[0.02] rounded" />
                    <div className="h-3.5 w-3/4 bg-white/[0.02] rounded" />
                  </div>
                </div>
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((t) => (
                  <span
                    key={t}
                    className="h-6 w-20 bg-white/[0.02] border border-white/[0.04] rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Right column: Results, timeline, divider, CTA */}
            <div className="md:col-span-5 flex flex-col justify-between gap-6">
              <div>
                <div className="h-3 w-20 bg-white/[0.03] rounded mb-3" />
                <div className="space-y-4">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="flex items-baseline gap-3">
                      <div className="h-6 w-14 bg-white/[0.03] rounded flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-5/6 bg-white/[0.02] rounded" />
                        <div className="h-3 w-1/2 bg-white/[0.02] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="h-3 w-16 bg-white/[0.03] rounded mb-2" />
                <div className="h-4 w-44 bg-white/[0.02] rounded" />
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/[0.05]" />

              {/* CTA */}
              <div className="flex justify-start">
                <div className="h-4 w-44 bg-white/[0.03] rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  const categories = [
    { span: "md:col-span-2", count: 5, isWide: true },
    { span: "md:col-span-1", count: 4, isWide: false },
    { span: "md:col-span-1", count: 5, isWide: false },
    { span: "md:col-span-2", count: 5, isWide: true },
    { span: "md:col-span-2", count: 5, isWide: true },
    { span: "md:col-span-1", count: 5, isWide: false },
  ];
  return (
    <div className="flex flex-col gap-10 md:gap-14 max-w-[1200px] mx-auto w-full">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`${cat.span} bg-white/[0.015] border border-white/[0.04] rounded-2xl p-6 md:p-8 flex flex-col gap-6 backdrop-blur-lg h-full`}
          >
            <div
              className={`flex flex-col ${cat.isWide ? "md:flex-row md:justify-between md:gap-8" : ""} h-full w-full`}
            >
              {/* Left content block */}
              <div
                className={
                  cat.isWide
                    ? "md:max-w-[40%] flex-shrink-0 mb-5 md:mb-0"
                    : "mb-5"
                }
              >
                <div className="flex items-center gap-3">
                  <div className="size-5 rounded bg-white/[0.03] border border-white/[0.05]" />
                  <div className="h-4 w-28 bg-white/[0.03] rounded" />
                </div>
              </div>
              {/* Skills stack */}
              <div
                className={`space-y-2.5 ${cat.isWide ? "md:flex-1 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-2.5 md:space-y-0 md:self-center" : ""}`}
              >
                {Array.from({ length: cat.count }).map((_, s) => (
                  <div key={s} className="flex items-start gap-2">
                    <span className="w-4 h-5 flex items-center justify-start flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/[0.02]" />
                    </span>
                    <div className="h-3.5 w-3/4 bg-white/[0.02] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="pt-10 md:pt-14">
        <div className="mb-6">
          <div className="flex items-center gap-1.5">
            <div className="size-4 rounded bg-white/[0.03] border border-white/[0.05]" />
            <div className="h-4 w-20 bg-white/[0.03] rounded" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="px-5 py-2.5 bg-white/[0.015] border border-white/[0.04] rounded-xl flex items-center gap-3 backdrop-blur-lg"
            >
              <div className="h-4 w-12 bg-white/[0.03] rounded" />
              <div className="h-3 w-16 bg-white/[0.02] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton({ count = 3 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="flex flex-col gap-3 max-w-[1200px] mx-auto w-full">
      {items.map((i) => (
        <div
          key={i}
          className="w-full p-3 sm:p-4 bg-white/[0.015] border border-white/[0.04] rounded-[40px] sm:rounded-full flex items-center gap-4 sm:gap-6 backdrop-blur-lg"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 size-12 rounded-full bg-white/[0.03] border border-white/[0.05]" />

          {/* Title */}
          <div className="flex-grow">
            <div className="h-4 sm:h-5 w-3/4 bg-white/[0.03] rounded" />
          </div>

          {/* Meta */}
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
            <div className="h-3.5 w-12 bg-white/[0.02] rounded" />
            <div className="h-3.5 w-16 bg-white/[0.02] rounded" />
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 size-4 bg-white/[0.03] rounded pr-2" />
        </div>
      ))}
    </div>
  );
}

function SplitSkeleton({ count = 4 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 max-w-[1200px] mx-auto w-full items-stretch">
      {/* Left side matching ProcessLibrary Tabs */}
      <div className="lg:col-span-5 flex flex-col gap-2 justify-center">
        {items.map((i) => (
          <div
            key={i}
            className="w-full bg-white/[0.015] border border-white/[0.04] rounded-xl px-5 py-4 flex items-center gap-4 backdrop-blur-lg"
          >
            <div className="h-4 w-5 bg-white/[0.03] rounded font-semibold text-xs text-accent/80" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-3/4 bg-white/[0.03] rounded" />
              <div className="h-2.5 w-24 bg-white/[0.02] rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Right side matching ProcessLibrary Viewer */}
      <div className="lg:col-span-7 bg-white/[0.015] border border-white/[0.04] rounded-2xl p-6 md:p-8 flex flex-col justify-start items-stretch h-full backdrop-blur-lg">
        {/* Header details */}
        <div className="mb-6">
          <div className="h-4 w-24 bg-white/[0.03] rounded mb-3" />
          <div className="h-7 w-2/3 bg-white/[0.03] rounded-lg" />
        </div>
        {/* Dotted Canvas Board */}
        <div
          className="w-full aspect-[16/10] rounded-xl border border-stroke/50 flex items-center justify-center p-6 mb-6 select-none relative"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--stroke)) 1px, transparent 1px) 0 0 / 16px 16px, hsl(var(--surface))",
            boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Mock BPMN SVG diagram in low-opacity to prevent visual pop-in */}
          <svg
            className="w-full h-full text-white/5 opacity-50"
            viewBox="0 0 400 250"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {/* Start event */}
            <circle cx="50" cy="125" r="12" />
            <path d="M62 125h28" />
            {/* Task 1 */}
            <rect x="90" y="100" width="80" height="50" rx="6" />
            <line x1="100" y1="115" x2="160" y2="115" strokeWidth="1" />
            <line x1="100" y1="125" x2="150" y2="125" strokeWidth="1" />
            <line x1="100" y1="135" x2="135" y2="135" strokeWidth="1" />
            <path d="M170 125h28" />
            {/* Gateway */}
            <path d="M198 125l15-15 15 15-15 15z" />
            <path d="M228 125h28" />
            {/* Task 2 */}
            <rect x="256" y="100" width="80" height="50" rx="6" />
            <line x1="266" y1="115" x2="326" y2="115" strokeWidth="1" />
            <line x1="266" y1="125" x2="310" y2="125" strokeWidth="1" />
            <path d="M336 125h28" />
            {/* End event */}
            <circle cx="376" cy="125" r="12" strokeWidth="3" />
          </svg>
        </div>
        {/* Footer details */}
        <div className="mt-auto min-h-[70px] h-auto">
          <div className="h-3 w-28 bg-white/[0.03] rounded mb-2" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-white/[0.02] rounded" />
            <div className="h-3.5 w-5/6 bg-white/[0.02] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="w-full flex flex-col items-center max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
      {/* Centered Kicker with Badge shape */}
      <div className="flex items-center justify-center gap-1.5 mb-5">
        <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/[0.05]" />
        <div className="h-4 w-20 bg-white/[0.03] rounded" />
      </div>
      {/* Title skeleton with border for visibility */}
      <div className="h-14 sm:h-20 w-3/4 sm:w-1/2 bg-white/[0.03] border border-white/[0.04] rounded-xl mb-10" />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16 md:mb-20">
        <div className="h-14 w-64 bg-white/[0.02] border border-white/[0.04] rounded-full" />
        <div className="h-14 w-32 bg-white/[0.02] border border-white/[0.04] rounded-full" />
      </div>
      <div className="w-full h-px bg-white/[0.05] mb-6" />
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-3">
          <div className="h-8 w-28 bg-white/[0.02] border border-white/[0.04] rounded-full" />
          <div className="h-8 w-24 bg-white/[0.02] border border-white/[0.04] rounded-full" />
        </div>
        <div className="h-4 w-44 bg-white/[0.02] rounded" />
      </div>
    </div>
  );
}

function SectionSkeleton({
  minHeight,
  variant = "card",
  count,
}: {
  minHeight: string | number;
  variant?: "card" | "grid" | "list" | "split" | "footer";
  count?: number;
}) {
  const heightStr =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  return (
    <div
      style={{ minHeight: heightStr }}
      className={`w-full flex flex-col justify-start px-6 md:px-10 lg:px-16 animate-pulse pointer-events-none select-none ${
        variant === "footer"
          ? "pt-16 md:pt-24 pb-8 md:pb-12"
          : "pt-16 md:pt-24 pb-0"
      }`}
    >
      {variant === "card" && (
        <div className="max-w-[1200px] mx-auto w-full mb-12 md:mb-16">
          {/* Header Kicker / Badge Skeleton */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 rounded bg-white/[0.03]" />
            <div className="h-3.5 w-20 bg-white/[0.03] rounded" />
          </div>
          {/* Title Skeleton */}
          <div className="h-9 w-2/3 md:w-[450px] bg-white/[0.03] rounded-lg mb-3" />
          {/* Subtitle */}
          <div className="h-4 w-1/2 md:w-[320px] bg-white/[0.02] rounded" />
        </div>
      )}

      {variant === "grid" && (
        <div className="max-w-[1200px] mx-auto w-full mb-8 md:mb-10">
          {/* Title Skeleton with Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/[0.05]" />
            <div className="h-9 w-2/3 md:w-[400px] bg-white/[0.03] rounded-lg" />
          </div>
          {/* Subtitle Skeleton */}
          <div className="h-4 w-1/2 md:w-[350px] bg-white/[0.02] rounded" />
        </div>
      )}

      {(variant === "list" || variant === "split") && (
        <div className="max-w-[1200px] mx-auto w-full mb-10 md:mb-14">
          {/* Title Skeleton with Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/[0.05]" />
            <div className="h-9 w-2/3 md:w-[400px] bg-white/[0.03] rounded-lg" />
          </div>
          {/* Subtitle Skeleton */}
          <div className="h-4 w-1/2 md:w-[350px] bg-white/[0.02] rounded" />
        </div>
      )}

      {/* Render correct variant structure */}
      {variant === "card" && <CardSkeleton count={count} />}
      {variant === "grid" && <GridSkeleton />}
      {variant === "list" && <ListSkeleton count={count} />}
      {variant === "split" && <SplitSkeleton count={count} />}
      {variant === "footer" && <FooterSkeleton />}
    </div>
  );
}

export default function DeferredSection({
  children,
  minHeight,
  rootMargin,
  className,
  style,
  variant: propVariant,
  count: propCount,
}: DeferredSectionProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Automatically extract variant and item count from lazy component static fields to avoid manual props declaration in App.tsx
  const childType = (
    children as {
      type?: {
        variant?: "card" | "grid" | "list" | "split" | "footer";
        count?: number;
      };
    }
  )?.type;
  const variant = propVariant || childType?.variant || "card";
  const count = propCount !== undefined ? propCount : childType?.count;

  // Key to cache the actual rendered section height in localStorage
  const cacheKey = `deferred_height_${className || variant}`;

  const [cachedHeight, setCachedHeight] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(cacheKey);
    } catch {
      return null;
    }
  });

  // Track the actual rendered height once the component is mounted
  useEffect(() => {
    if (!shouldRender || typeof ResizeObserver === "undefined") return;

    const host = hostRef.current;
    if (!host) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Measure borderBox height (or contentRect if borderBox is not supported)
        const height =
          entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        const heightVal = Math.ceil(height);
        if (heightVal > 0) {
          const heightStr = `${heightVal}px`;
          setCachedHeight(heightStr);
          try {
            localStorage.setItem(cacheKey, heightStr);
          } catch {
            // Ignore quota errors (e.g. private browsing restrictions)
          }
        }
      }
    });

    resizeObserver.observe(host);
    return () => resizeObserver.disconnect();
  }, [shouldRender, cacheKey]);

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
    cachedHeight ||
    (typeof minHeight === "number" ? `${minHeight}px` : minHeight);

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
        <Suspense
          fallback={
            <SectionSkeleton
              minHeight={heightStr}
              variant={variant}
              count={count}
            />
          }
        >
          {children}
        </Suspense>
      ) : (
        <SectionSkeleton
          minHeight={heightStr}
          variant={variant}
          count={count}
        />
      )}
    </div>
  );
}
