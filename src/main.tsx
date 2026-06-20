import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./bones/registry";

if (import.meta.env.DEV) {
  import("web-vitals").then(({ onINP }) => {
    onINP(console.log, { reportAllChanges: true });
  });

  if (
    typeof PerformanceObserver !== "undefined" &&
    PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")
  ) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const loaf = entry as PerformanceEntry & {
          firstUIEventTimestamp: number;
        };
        if (loaf.firstUIEventTimestamp > 0 && entry.duration > 200) {
          console.warn("INP-risk LoAF >200ms:", entry.duration, entry);
        }
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
