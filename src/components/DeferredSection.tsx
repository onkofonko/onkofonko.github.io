import { Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface DeferredSectionProps {
  children: ReactNode;
  minHeight: string | number;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
}

export default function DeferredSection({
  children,
  minHeight,
  rootMargin = '1200px 0px',
  className,
  style,
}: DeferredSectionProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (shouldRender) return;

    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      { rootMargin },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={hostRef} className={className} style={style}>
      {shouldRender ? (
        <Suspense fallback={<div aria-hidden style={{ minHeight }} />}>
          {children}
        </Suspense>
      ) : (
        <div aria-hidden style={{ minHeight, contentVisibility: 'auto', containIntrinsicSize: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }} />
      )}
    </div>
  );
}