"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Play, Map, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlight?: string; // optional callout
}

const TOUR_STEPS: TourStep[] = [
  { id: "hero", title: "Welcome 👋", description: "This ML project predicts a student's final exam score from academic & behavioral indicators. Let me walk you through the key sections.", highlight: "R² 70.8% · MAE 5.01 · 1,200 students" },
  { id: "overview", title: "The Problem", description: "Early identification of at-risk students enables timely intervention. The objective: predict final_exam_score (0–100) from 13 inputs.", highlight: "Target: final_exam_score ∈ [0, 100]" },
  { id: "methodology", title: "ML Lifecycle", description: "A complete 7-phase pipeline — from synthetic data generation through client-side deployment. Hover the flow diagram for details.", highlight: "Data → Preprocess → EDA → Features → Model → Evaluate → Deploy" },
  { id: "dataset", title: "The Data", description: "1,200 students (after dedup), 15 features. The distribution chart shows scores cluster around 72 (mean). Tables are scrollable on mobile.", highlight: "1,200 records · 15 features · 2 engineered" },
  { id: "predictor", title: "Try It Live ⚡", description: "Adjust the 8 sliders + 5 dropdowns, or click a scenario preset (Top Performer, At-Risk…). Predictions run in your browser — no server needed.", highlight: "Press 'P' any time to jump here" },
  { id: "compare", title: "Side-by-Side", description: "Compare two student profiles to see what separates a top performer from an at-risk student. The delta table shows every indicator.", highlight: "Score gap badge + 11-feature delta table" },
  { id: "models", title: "Model Selection", description: "Three models trained & compared. Gradient Boosting won with R² = 70.84%. Error metrics chart shows MAE & RMSE per model.", highlight: "Best: Gradient Boosting · R² 70.84%" },
  { id: "diagnostics", title: "Model Rigor", description: "Actual-vs-predicted scatter (points near the dashed line = accurate), residual distribution, and a 7×7 score-band accuracy heatmap.", highlight: "90.4% of predictions within ±10 points" },
  { id: "insights", title: "EDA Insights", description: "Correlation heatmap, top-10 feature importances, study-hours trend, and box plots by parental support.", highlight: "engagement_index is the #1 predictor (37%)" },
  { id: "explainability", title: "Partial Dependence", description: "PDP shows the average effect of each feature on the score, with 90% bootstrap CI bands. Toggle to ICE for individual student curves.", highlight: "Toggle PDP ↔ ICE in the top-right" },
  { id: "shap", title: "SHAP Summary", description: "A beeswarm plot — each dot is a student. Position shows how much a feature pushes the score up (right) or down (left). Color = feature value.", highlight: "6 features × 150 students = holistic view" },
  { id: "results", title: "Key Findings", description: "Gradient Boosting won; engagement_index dominates; ensemble methods beat linear regression. Limitations & future work noted honestly.", highlight: "Honest about synthetic-data limitations" },
  { id: "model-card", title: "Responsible AI", description: "A Google-style model card: intended use, inputs/outputs, performance, subgroup fairness, and ethical considerations.", highlight: "Fairness: MAE disparities are small; bias within ±0.3 pts" },
  { id: "glossary", title: "ML Glossary", description: "Every ML term defined in one searchable place. Filter by category or search. Inline terms throughout the page show definitions on hover.", highlight: "16 terms · 4 categories · searchable" },
];

export function GuidedTour() {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const start = useCallback(() => {
    setStepIdx(0);
    setActive(true);
    // scroll to first step
    setTimeout(() => {
      document.getElementById(TOUR_STEPS[0].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
  }, []);

  // Listen for external "start-tour" events (e.g. from the WelcomeModal)
  useEffect(() => {
    const onStart = () => start();
    window.addEventListener("spp:start-tour", onStart);
    return () => window.removeEventListener("spp:start-tour", onStart);
  }, [start]);

  const next = useCallback(() => {
    setStepIdx((i) => {
      const ni = Math.min(i + 1, TOUR_STEPS.length - 1);
      document.getElementById(TOUR_STEPS[ni].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return ni;
    });
  }, []);

  const prev = useCallback(() => {
    setStepIdx((i) => {
      const pi = Math.max(i - 1, 0);
      document.getElementById(TOUR_STEPS[pi].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return pi;
    });
  }, []);

  // keyboard nav during tour
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, stop]);

  const step = TOUR_STEPS[stepIdx];
  const isLast = stepIdx === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Trigger button — rendered by parent via children-free API */}
      <button
        onClick={start}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10"
        aria-label="Start guided tour"
      >
        <Play className="h-4 w-4" /> Take the Tour
      </button>

      {/* Tour overlay + card */}
      {active && (
        <>
          {/* spotlight indicator near the active section */}
          <div
            className="pointer-events-none fixed inset-0 z-[60]"
            aria-hidden="true"
          />
          {/* tour card */}
          <div className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border bg-card p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Map className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Tour · Step {stepIdx + 1} of {TOUR_STEPS.length}
                  </div>
                  <div className="text-sm font-bold leading-tight">{step.title}</div>
                </div>
              </div>
              <button onClick={stop} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close tour">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            {step.highlight && (
              <div className="mt-2 rounded-lg bg-primary/5 px-3 py-1.5 text-xs">
                <span className="font-semibold text-primary">★ </span>{step.highlight}
              </div>
            )}
            {/* progress bar */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((stepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
            {/* controls */}
            <div className="mt-3 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prev} disabled={stepIdx === 0} className="text-xs">
                ← Prev
              </Button>
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setStepIdx(i); document.getElementById(TOUR_STEPS[i].id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    className={`h-1.5 rounded-full transition-all ${i === stepIdx ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"}`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
              {isLast ? (
                <Button size="sm" onClick={() => { stop(); toast.success("Tour complete!", { description: "You've seen all 14 key sections." }); }} className="text-xs">
                  Finish ✓
                </Button>
              ) : (
                <Button size="sm" onClick={next} className="text-xs">
                  Next <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
