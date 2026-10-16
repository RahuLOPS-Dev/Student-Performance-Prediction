"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Line, ComposedChart, Scatter } from "recharts";
import type { EdaData, FEATURE_LABELS } from "@/lib/eda";
import { FEATURE_LABELS as FL } from "@/lib/eda";
import { Activity, GitBranch, Box, BarChart3 } from "lucide-react";

// Correlation heatmap color: -1 (rose) → 0 (muted) → +1 (emerald)
function corrColor(v: number): string {
  if (v >= 0) {
    // 0 -> light, 1 -> deep emerald
    const t = Math.min(1, v);
    return `oklch(${0.93 - 0.33 * t} ${0.05 + 0.12 * t} ${162})`;
  } else {
    const t = Math.min(1, -v);
    return `oklch(${0.93 - 0.33 * t} ${0.05 + 0.16 * t} ${25})`;
  }
}

export default function EdaInsightsSection({ eda }: { eda: EdaData }) {
  const corr = eda.correlation;
  const importances = eda.feature_importances.slice(0, 10);
  const scatter = eda.scatter_studyhours_binned;
  const boxParental = eda.box_parental;

  // Feature importance chart data with labels
  const impData = importances.map((f) => ({
    name: (FL as Record<string, string>)[f.feature] ?? f.feature.replace(/_enc$/, ""),
    raw: f.feature,
    importance: Number((f.importance * 100).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Correlation heatmap */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Correlation Heatmap
            </CardTitle>
            <CardDescription>Pearson correlation of numeric features vs. final exam score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <Heatmap cols={corr.columns} matrix={corr.matrix} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <span>-1.0</span>
              <div className="h-3 w-40 rounded-full" style={{ background: "linear-gradient(to right, oklch(0.6 0.21 25), oklch(0.93 0.005 162), oklch(0.55 0.17 162))" }} />
              <span>+1.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Feature importances */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Feature Importances (Top 10)
            </CardTitle>
            <CardDescription>Gradient Boosting — relative contribution to predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, "Importance"]}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {impData.map((_, i) => (
                      <Cell key={i} fill={`oklch(${0.6 - i * 0.035} 0.13 162)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study hours vs score (binned line) */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4 text-primary" />
              Study Hours vs Final Exam Score
            </CardTitle>
            <CardDescription>Mean score per study-hour bucket — clear positive trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={scatter} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="mid" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Study hrs/wk", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number) => [`${value}`, "Mean score"]}
                    labelFormatter={(v) => `~${v} hrs/wk`}
                  />
                  <Line type="monotone" dataKey="mean_y" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--chart-1))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Box plot: parental support vs score */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Box className="h-4 w-4 text-primary" />
              Final Exam Score by Parental Support
            </CardTitle>
            <CardDescription>Box plot — median, IQR &amp; range per support level</CardDescription>
          </CardHeader>
          <CardContent>
            <BoxPlot data={boxParental} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Heatmap({ cols, matrix }: { cols: string[]; matrix: number[][] }) {
  const shortCols = cols.map((c) => (FL as Record<string, string>)[c] ?? c.replace(/_enc$/, "").replace(/_/g, " "));
  return (
    <div className="inline-block">
      <div className="flex">
        <div className="w-28" />
        {shortCols.map((c) => (
          <div key={c} className="flex-1 px-1 py-2 text-center text-[9px] font-medium leading-tight text-muted-foreground" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: "70px" }}>
            {c}
          </div>
        ))}
      </div>
      {matrix.map((row, i) => (
        <div key={i} className="flex items-center">
          <div className="w-28 truncate pr-2 text-right text-[10px] font-medium text-muted-foreground">{shortCols[i]}</div>
          {row.map((v, j) => (
            <div key={j} className="group relative flex-1">
              <div
                className="m-0.5 flex aspect-square items-center justify-center rounded-sm text-[9px] font-semibold transition-transform hover:scale-110 hover:z-10"
                style={{ background: corrColor(v), color: Math.abs(v) > 0.5 ? "white" : "hsl(var(--foreground))" }}
                title={`${shortCols[i]} ↔ ${shortCols[j]}: ${v.toFixed(2)}`}
              >
                {v.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BoxPlot({ data }: { data: { category: string; min: number; q1: number; median: number; q3: number; max: number; mean: number; count: number }[] }) {
  const colors = ["hsl(var(--chart-2))", "hsl(var(--chart-1))", "hsl(var(--chart-4))"];
  const allVals = data.flatMap((d) => [d.min, d.max]);
  const min = Math.min(...allVals) - 2;
  const max = Math.max(...allVals) + 2;
  const range = max - min;
  const pos = (v: number) => `${((v - min) / range) * 100}%`;
  return (
    <div className="space-y-4 pt-2">
      {data.map((d, i) => {
        const color = colors[i % colors.length];
        return (
          <div key={d.category} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{d.category}</span>
              <span className="text-muted-foreground">n={d.count} · median {d.median}</span>
            </div>
            <div className="relative h-10 rounded-md bg-muted/40">
              {/* whisker line */}
              <div className="absolute top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40" style={{ left: pos(d.min), right: `calc(100% - ${pos(d.max)})` }} />
              {/* min cap */}
              <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/60" style={{ left: pos(d.min) }} />
              {/* max cap */}
              <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/60" style={{ left: pos(d.max) }} />
              {/* IQR box */}
              <div
                className="absolute top-1/2 h-7 -translate-y-1/2 rounded-sm border opacity-90"
                style={{ left: pos(d.q1), width: `calc(${pos(d.q3)} - ${pos(d.q1)})`, background: color, borderColor: color }}
              />
              {/* median line */}
              <div className="absolute top-1/2 h-7 w-0.5 -translate-y-1/2 bg-white" style={{ left: pos(d.median) }} />
              {/* mean dot */}
              <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground/80 shadow" style={{ left: pos(d.mean) }} title={`Mean: ${d.mean}`} />
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: "hsl(var(--chart-1))" }} /> IQR (Q1–Q3)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-white" /> Median</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-foreground/80" /> Mean</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-muted-foreground/40" /> Whisker range</span>
      </div>
    </div>
  );
}
