"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Scatter, ComposedChart, Cell } from "recharts";
import type { EdaData } from "@/lib/eda";
import { FEATURE_LABELS } from "@/lib/eda";
import BandHeatmapSection from "@/components/sections/band-heatmap-section";
import { Term } from "@/components/term";
import { Activity, Target, Gauge, TrendingDown, CheckCircle2 } from "lucide-react";

export default function DiagnosticsSection({ eda }: { eda: EdaData }) {
  const diag = eda.diagnostics;
  const stats = diag.residual_stats;

  const scatterData = diag.scatter.map((d) => ({
    actual: d.actual,
    predicted: d.predicted,
    residual: d.residual,
  }));

  const resDistData = diag.residual_dist.map((b) => ({
    bin: b.bin_start,
    count: b.count,
  }));

  // Identity line range (30→100)
  const identityLine = [
    { x: 30, y: 30 },
    { x: 100, y: 100 },
  ];

  const accuracyCards = [
    { label: "Mean Residual", value: `${stats.mean_residual >= 0 ? "+" : ""}${stats.mean_residual}`, sub: "bias (≈0 = unbiased)", icon: Gauge, tone: Math.abs(stats.mean_residual) < 0.5 ? "ok" : "warn" },
    { label: "Std of Residuals", value: `${stats.std_residual}`, sub: "prediction spread", icon: Activity, tone: "neutral" },
    { label: "Within ±5 pts", value: `${stats.within_5}%`, sub: "of test predictions", icon: CheckCircle2, tone: "ok" },
    { label: "Within ±10 pts", value: `${stats.within_10}%`, sub: "of test predictions", icon: Target, tone: "ok" },
  ];

  return (
    <div className="space-y-6">
      {/* Accuracy stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {accuracyCards.map((c) => {
          const Icon = c.icon;
          const toneClass =
            c.tone === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : c.tone === "warn"
              ? "text-amber-600 dark:text-amber-400"
              : "text-primary";
          return (
            <Card key={c.label} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className={`h-4 w-4 ${toneClass}`} />
                </div>
                <div className={`mt-2 text-2xl font-bold tabular-nums ${toneClass}`}>{c.value}</div>
                <div className="text-xs font-medium">{c.label}</div>
                <div className="text-[10px] text-muted-foreground">{c.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actual vs Predicted scatter */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Actual vs Predicted (Test Set)
            </CardTitle>
            <CardDescription>
              {stats.n_test} held-out students · points near the dashed line = accurate predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={scatterData}
                  margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    type="number"
                    dataKey="actual"
                    domain={[30, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Actual Score", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted"
                    domain={[30, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Predicted", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number, name: string) => [value, name === "predicted" ? "Predicted" : name]}
                    labelFormatter={(label) => `Actual: ${label}`}
                  />
                  {/* Identity line (perfect prediction) */}
                  <ReferenceLine
                    segment={[{ x: 30, y: 30 }, { x: 100, y: 100 }]}
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />
                  <Scatter
                    dataKey="predicted"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.55}
                    shape="circle"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Dashed line = perfect prediction (predicted = actual) · {stats.within_5}% of predictions fall within ±5 points
            </p>
          </CardContent>
        </Card>

        {/* Residual distribution */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-primary" />
              <Term term="residual">Residual</Term> Distribution
            </CardTitle>
            <CardDescription>
              Errors (actual − predicted) · centered near 0 = unbiased model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resDistData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="bin"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Residual (pts)", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number) => [`${value} students`, "Count"]}
                    labelFormatter={(v) => `Residual ≥ ${v}`}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <ReferenceLine x={0} stroke="hsl(var(--chart-2))" strokeDasharray="4 4" label={{ value: "0", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "top" }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {resDistData.map((d, i) => {
                      const center = (d.bin + 2.5);
                      const tone = Math.abs(center) < 2.5 ? "hsl(var(--chart-1))" : Math.abs(center) < 7.5 ? "hsl(var(--chart-4))" : "hsl(var(--chart-5))";
                      return <Cell key={i} fill={tone} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ background: "hsl(var(--chart-1))" }} /> accurate (±2.5)</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ background: "hsl(var(--chart-4))" }} /> moderate (±2.5–7.5)</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm" style={{ background: "hsl(var(--chart-5))" }} /> large error (&gt;7.5)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Band-accuracy heatmap (full width below) */}
      <BandHeatmapSection eda={eda} />
    </div>
  );
}
