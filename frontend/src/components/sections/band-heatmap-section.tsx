"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { EdaData } from "@/lib/eda";
import { Grid3x3 } from "lucide-react";

export default function BandHeatmapSection({ eda }: { eda: EdaData }) {
  const bh = eda.band_heatmap;
  const { labels, matrix, total } = bh;

  // Color scale: white → emerald (higher count = darker green)
  const maxVal = Math.max(...matrix.flat(), 1);
  function cellColor(v: number) {
    if (v === 0) return "transparent";
    const t = v / maxVal;
    // emerald ramp
    return `oklch(${0.95 - 0.4 * t} ${0.04 + 0.14 * t} ${162})`;
  }

  // Diagonal = correct-band predictions
  const diagSum = matrix.reduce((s, row, i) => s + (row[i] ?? 0), 0);
  const diagPct = total > 0 ? Math.round((diagSum / total) * 100) : 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3x3 className="h-4 w-4 text-primary" />
          Score-Band Accuracy Heatmap
        </CardTitle>
        <CardDescription>
          Predicted (rows) vs Actual (cols) score bands · diagonal = correct band · off-diagonal = errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Top axis label */}
            <div className="mb-1 pl-28 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actual Score Band →
            </div>
            <div className="flex items-start gap-1">
              {/* Left axis label */}
              <div className="flex w-24 shrink-0 items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  Predicted ↓
                </span>
              </div>
              <div>
                {/* Column headers (actual) */}
                <div className="flex gap-0.5">
                  <div className="w-24 shrink-0" />
                  {labels.map((l) => (
                    <div key={l} className="w-12 shrink-0 text-center text-[9px] font-medium text-muted-foreground">
                      {l}
                    </div>
                  ))}
                  <div className="w-12 shrink-0 text-center text-[9px] font-semibold text-muted-foreground">Row Σ</div>
                </div>
                {/* Rows (predicted) */}
                {matrix.map((row, i) => {
                  const rowSum = row.reduce((s, v) => s + v, 0);
                  return (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className="w-24 shrink-0 text-right pr-1 text-[9px] font-medium text-muted-foreground">
                        {labels[i]}
                      </div>
                      {row.map((v, j) => {
                        const isDiag = i === j;
                        return (
                          <div
                            key={j}
                            className="group relative m-0.5 flex h-11 w-12 items-center justify-center rounded text-[10px] font-semibold tabular-nums"
                            style={{
                              background: cellColor(v),
                              color: v / maxVal > 0.5 ? "white" : "hsl(var(--foreground))",
                              outline: isDiag && v > 0 ? "2px solid hsl(var(--chart-4))" : "none",
                              outlineOffset: "-2px",
                            }}
                            title={`Predicted ${labels[i]} → Actual ${labels[j]}: ${v} students`}
                          >
                            {v > 0 ? v : ""}
                            {isDiag && v > 0 && (
                              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-chart-4" />
                            )}
                          </div>
                        );
                      })}
                      <div className="w-12 shrink-0 text-center text-[9px] font-semibold tabular-nums text-muted-foreground">
                        {rowSum}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">On-diagonal (correct band)</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{diagSum}</div>
            <div className="text-[10px] text-muted-foreground">{diagPct}% of {total} predictions</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Off-diagonal (errors)</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{total - diagSum}</div>
            <div className="text-[10px] text-muted-foreground">{100 - diagPct}% of predictions</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Adjacent-band accuracy</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-primary">
              {Math.round((matrix.reduce((s, row, i) => s + (row[i] ?? 0) + (row[i - 1] ?? 0) + (row[i + 1] ?? 0), 0) / total) * 100)}%
            </div>
            <div className="text-[10px] text-muted-foreground">within ±1 band</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span>low count</span>
          <div className="h-3 w-32 rounded-full" style={{ background: "linear-gradient(to right, transparent, oklch(0.55 0.18 162))" }} />
          <span>high count</span>
          <span className="ml-2 flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-chart-4" /> correct-band (diagonal)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
