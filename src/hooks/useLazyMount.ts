import { useState, useEffect, useRef } from "react";

interface UseLazyMountOptions {
  rootMargin?: string;
}

export function useLazyMount(options: UseLazyMountOptions = {}) {
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  // Destructure to avoid object reference changes re-triggering the effect
  const rootMargin = options.rootMargin ?? "300px";

  useEffect(() => {
    // Exit if already loaded or running on the server
    if (hasIntersected || typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    // Trigger immediate mount and clean up listeners
    const triggerMount = () => {
      setHasIntersected(true);
    };

    // Set up IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerMount();
        }
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(element);

    // Set up focusin listener for accessibility (a11y)
    // When a keyboard user tabs to focus an element inside this section,
    // trigger an immediate mount so focus is not lost.
    element.addEventListener("focusin", triggerMount);

    // Cleanup: disconnect and remove listeners
    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", triggerMount);
    };
  }, [hasIntersected, rootMargin]);

  return [ref, hasIntersected] as const;
}
