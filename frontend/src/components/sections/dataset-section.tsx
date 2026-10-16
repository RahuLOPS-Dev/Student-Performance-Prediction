"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EdaData, DatasetStats } from "@/lib/eda";
import { Database, Users, Layers, Sparkles, Trash2, CheckCircle2, TrendingUp } from "lucide-react";

const DESCRIBE_ROWS: { key: string; label: string }[] = [
  { key: "mean", label: "Mean" },
  { key: "std", label: "Std" },
  { key: "min", label: "Min" },
  { key: "25%", label: "25%" },
  { key: "50%", label: "Median" },
  { key: "75%", label: "75%" },
  { key: "max", label: "Max" },
];

const DESCRIBE_COLS: { key: string; label: string }[] = [
  { key: "attendance", label: "Attendance" },
  { key: "study_hours_per_week", label: "Study Hrs" },
  { key: "assignment_score", label: "Assign." },
  { key: "internal_assessment_1", label: "IA-1" },
  { key: "internal_assessment_2", label: "IA-2" },
  { key: "previous_semester_gpa", label: "Prev GPA" },
  { key: "avg_internal_score", label: "Avg IA" },
  { key: "engagement_index", label: "Engage" },
  { key: "final_exam_score", label: "Final" },
];

export default function DatasetSection({ eda }: { eda: EdaData }) {
  const stats: DatasetStats = eda.dataset_stats;
  const distribution = eda.distribution;

  const statCards = [
    { label: "Raw Records", value: stats.raw_rows.toLocaleString(), icon: Database, sub: "before cleaning" },
    { label: "Clean Records", value: stats.clean_rows.toLocaleString(), icon: Users, sub: "after dedup" },
    { label: "Features", value: `${stats.columns}`, icon: Layers, sub: `${stats.numeric_features} num + ${stats.categorical_features} cat` },
    { label: "Duplicates Removed", value: `${stats.duplicates_removed}`, icon: Trash2, sub: "exact & near" },
    { label: "Missing → 0", value: `${stats.missing_before}→0`, icon: CheckCircle2, sub: "median imputed" },
    { label: "Engineered", value: `${stats.engineered_features}`, icon: Sparkles, sub: "new features" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="card-lift border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs font-medium text-foreground/80">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribution chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Distribution of Final Exam Scores
            </CardTitle>
            <CardDescription>N = {stats.clean_rows.toLocaleString()} students · mean {stats.target_stats.mean} · std {stats.target_stats.std}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="bin_start"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}`}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => `Score ≥ ${v}`}
                    formatter={(value: number) => [`${value} students`, "Count"]}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Bins of width 5 · scores clipped to [0, 100] via IQR capping
            </p>
          </CardContent>
        </Card>

        {/* Describe table */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Descriptive Statistics</CardTitle>
            <CardDescription>Preprocessed numeric features (after IQR outlier capping)</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table className="data-table text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8">Stat</TableHead>
                    {DESCRIBE_COLS.map((c) => (
                      <TableHead key={c.key} className="h-8 text-right">{c.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DESCRIBE_ROWS.map((row) => (
                    <TableRow key={row.key} className="h-8">
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {DESCRIBE_COLS.map((c) => (
                        <TableCell key={c.key} className="text-right tabular-nums">
                          {fmt(stats.describe[c.key][row.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n === undefined || n === null) return "—";
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
