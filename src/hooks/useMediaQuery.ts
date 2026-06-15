import { useState, useEffect } from "react";

const queryCache = new Map<string, MediaQueryList>();

function getMql(query: string): MediaQueryList {
  if (typeof window === "undefined") {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }
  if (!queryCache.has(query)) {
    queryCache.set(query, window.matchMedia(query));
  }
  return queryCache.get(query)!;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMql(query).matches);

  useEffect(() => {
    const mql = getMql(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
