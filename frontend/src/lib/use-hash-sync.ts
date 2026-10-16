"use client";

import { useEffect } from "react";

const SECTION_IDS = [
  "hero", "overview", "methodology", "dataset", "predictor", "compare",
  "models", "diagnostics", "insights", "explainability", "shap",
  "feature-eng", "results", "model-card", "glossary",
];

const STORAGE_KEY = "spp:last-section";

/**
 * Keeps the URL hash in sync with the section currently in view,
 * so users can share/bookmark a specific section.
 * Also persists the last-visited section to localStorage and restores it on return
 * (only if no explicit #hash is in the URL).
 */
export function useHashSync() {
  // Track + sync hash + persist last section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!best || e.intersectionRatio > best.ratio) {
              best = { id: e.target.id, ratio: e.intersectionRatio };
            }
          }
        });
        if (best) {
          const current = window.location.hash.replace("#", "");
          if (current !== best.id) {
            history.replaceState(null, "", `#${best.id}`);
            // persist (skip 'hero' to avoid restoring to the very top)
            if (best.id !== "hero") {
              try { localStorage.setItem(STORAGE_KEY, best.id); } catch { /* ignore */ }
            }
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // On load: if URL has an explicit #hash, scroll to it.
  // Otherwise, restore the last-visited section from localStorage (returning visitors).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTION_IDS.includes(hash)) {
      // explicit hash wins
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    } else {
      // try restoring last-visited
      try {
        const last = localStorage.getItem(STORAGE_KEY);
        if (last && SECTION_IDS.includes(last) && last !== "hero") {
          // only restore if the user has scrolled before (i.e. not a brand-new visitor)
          // Heuristic: only restore after a short delay so first-paint shows the hero
          setTimeout(() => {
            document.getElementById(last)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 600);
        }
      } catch { /* ignore */ }
    }
  }, []);
}

