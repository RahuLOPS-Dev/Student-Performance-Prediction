"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EdaData } from "@/lib/eda";
import { Trophy, Target, Gauge } from "lucide-react";

const MODEL_COLORS: Record<string, string> = {
  "Gradient Boosting": "hsl(var(--chart-1))",
  "Linear Regression": "hsl(var(--chart-2))",
  "Random Forest": "hsl(var(--chart-3))",
};

export default function ModelComparisonSection({ eda }: { eda: EdaData }) {
  const models = eda.model_comparison;
  const sorted = [...models].sort((a, b) => b.R2_Score - a.R2_Score);
  const best = sorted[0];

  const chartData = models.map((m) => ({
    name: m.Model,
    R2: Number((m.R2_Score * 100).toFixed(2)),
    MAE: m.MAE,
    RMSE: m.RMSE,
  }));

  return (
    <div className="space-y-6">
      {/* Best model highlight */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Best Model</span>
            </div>
            <div className="mt-1 text-xl font-bold">{best.Model}</div>
            <div className="text-xs text-muted-foreground">Highest R² score</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">R² Score</span>
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums">{(best.R2_Score * 100).toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">variance explained</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary">
              <Gauge className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">MAE</span>
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums">{best.MAE.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">mean abs error (points)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* R² comparison chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Model Comparison — R² Score</CardTitle>
            <CardDescription>Higher is better · % of variance explained</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, "R²"]}
                  />
                  <Bar dataKey="R2" radius={[0, 4, 4, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={MODEL_COLORS[d.name] ?? "hsl(var(--chart-4))"} />
                    ))}
                    <LabelList dataKey="R2" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error metrics chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Error Metrics Comparison</CardTitle>
            <CardDescription>MAE &amp; RMSE (points) — lower is better</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="MAE" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]}>
                    <LabelList dataKey="MAE" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  </Bar>
                  <Bar dataKey="RMSE" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]}>
                    <LabelList dataKey="RMSE" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full metrics table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Full Evaluation Metrics</CardTitle>
          <CardDescription>80/20 train-test split · random_state = 42</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">MSE</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">R² Score</TableHead>
                <TableHead className="text-right">Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((m, i) => (
                <TableRow key={m.Model}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: MODEL_COLORS[m.Model] }} />
                      {m.Model}
                      {i === 0 && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{m.MAE.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.MSE.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.RMSE.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{(m.R2_Score * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">#{i + 1}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
