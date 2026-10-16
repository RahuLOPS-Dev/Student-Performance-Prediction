"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { GraduationCap, X, ChevronUp, Trophy, Target, Activity, Users } from "lucide-react";
import { datasetStats } from "@/lib/eda-data";

interface StatsAtAGlanceProps {
  bestModelName: string;
  bestR2: number;
  bestMae: number;
}

/**
 * A collapsible mini-dashboard widget fixed to the bottom-left.
 * Shows the 4 key project stats at a glance; collapses to an icon when not needed.
 * Hidden on mobile (too cramped) — shows only on lg+.
 */
export function StatsAtAGlance({ bestModelName, bestR2, bestMae }: StatsAtAGlanceProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Don't render until scrolled past hero, and allow dismissal
  if (!scrolled || dismissed) return null;

  const stats = datasetStats;
  const items = [
    { icon: Trophy, label: "Model", value: bestModelName, sub: "Gradient Boosting" },
    { icon: Target, label: "R²", value: `${(bestR2 * 100).toFixed(1)}%`, sub: "variance" },
    { icon: Activity, label: "MAE", value: bestMae.toFixed(2), sub: "points" },
    { icon: Users, label: "Dataset", value: stats.clean_rows.toLocaleString(), sub: "students" },
  ];

  return (
    <div className="fixed bottom-5 left-5 z-40 hidden lg:block">
      {expanded ? (
        <Card className="w-64 border-border/60 shadow-xl">
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Stats at a glance
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(false)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Collapse"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {items.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-md border bg-card p-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="mt-0.5 truncate text-sm font-bold tabular-nums">{s.value}</div>
                  <div className="text-[9px] text-muted-foreground">{s.sub}</div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border bg-card shadow-lg transition hover:shadow-xl"
          aria-label="Show stats at a glance"
          title="Stats at a glance"
        >
          <Trophy className="h-5 w-5 text-primary" />
        </button>
      )}
    </div>
  );
}
