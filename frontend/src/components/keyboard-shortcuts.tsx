"use client";

import { useEffect } from "react";

const SHORTCUTS: Record<string, string> = {
  "1": "overview",
  "2": "methodology",
  "3": "dataset",
  "4": "predictor",
  "5": "compare",
  "6": "models",
  "7": "diagnostics",
  "8": "insights",
  "9": "explainability",
  "0": "results",
  // also letters
  p: "predictor",
  c: "compare",
  m: "models",
  d: "diagnostics",
  e: "explainability",
  s: "shap",
  r: "results",
  h: "hero",
  g: "glossary",
};

export function KeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore if typing in an input/select/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      const key = e.key.toLowerCase();
      const target = SHORTCUTS[key];
      if (target) {
        e.preventDefault();
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // 't' = toggle theme
      if (key === "t") {
        const toggle = document.querySelector<HTMLButtonElement>('[aria-label="Toggle theme"]');
        toggle?.click();
      }
      // 'b' = back to top
      if (key === "b") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null; // no visual element; just wires up the listener
}
