"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { loadModel, loadEncoders, predict, type StudentInput, type PredictionResult } from "@/lib/model";
import { GraduationCap, Users, ArrowRight, ArrowLeftRight, Trophy, UserX, Target, Heart, Activity } from "lucide-react";

interface Preset {
  id: string;
  label: string;
  icon: typeof Activity;
  input: StudentInput;
  accent: string;
}

const PRESETS: Preset[] = [
  {
    id: "top", label: "Top Performer", icon: Trophy, accent: "emerald",
    input: { attendance: 96, study_hours_per_week: 24, sleep_hours: 8, extracurricular_hours: 6, assignment_score: 92, internal_assessment_1: 88, internal_assessment_2: 90, previous_semester_gpa: 9.2, gender: "Female", parental_support: "High", family_income_level: "High", internet_access: "Yes", part_time_job: "No" },
  },
  {
    id: "average", label: "Average Student", icon: Target, accent: "sky",
    input: { attendance: 78, study_hours_per_week: 12, sleep_hours: 6.5, extracurricular_hours: 4, assignment_score: 72, internal_assessment_1: 67, internal_assessment_2: 69, previous_semester_gpa: 6.8, gender: "Male", parental_support: "Medium", family_income_level: "Medium", internet_access: "Yes", part_time_job: "No" },
  },
  {
    id: "at-risk", label: "At-Risk", icon: UserX, accent: "rose",
    input: { attendance: 55, study_hours_per_week: 3, sleep_hours: 4.5, extracurricular_hours: 1, assignment_score: 40, internal_assessment_1: 35, internal_assessment_2: 38, previous_semester_gpa: 4.5, gender: "Male", parental_support: "Low", family_income_level: "Low", internet_access: "No", part_time_job: "Yes" },
  },
  {
    id: "first-gen", label: "First-Gen Struggler", icon: Heart, accent: "amber",
    input: { attendance: 85, study_hours_per_week: 18, sleep_hours: 5.5, extracurricular_hours: 2, assignment_score: 68, internal_assessment_1: 60, internal_assessment_2: 62, previous_semester_gpa: 6.0, gender: "Female", parental_support: "Low", family_income_level: "Low", internet_access: "No", part_time_job: "Yes" },
  },
];

const ACCENTS: Record<string, { ring: string; bg: string; text: string; bar: string; badge: string }> = {
  emerald: { ring: "ring-emerald-400/60", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  sky: { ring: "ring-sky-400/60", bg: "bg-sky-50/50 dark:bg-sky-950/20", text: "text-sky-700 dark:text-sky-300", bar: "bg-sky-500", badge: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800" },
  rose: { ring: "ring-rose-400/60", bg: "bg-rose-50/50 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-300", bar: "bg-rose-500", badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800" },
  amber: { ring: "ring-amber-400/60", bg: "bg-amber-50/50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-300", bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
};

function compute(input: StudentInput): PredictionResult {
  return predict(loadModel(), loadEncoders(), input);
}

export default function ComparisonSection() {
  const [leftId, setLeftId] = useState<string>("top");
  const [rightId, setRightId] = useState<string>("at-risk");

  const left = PRESETS.find((p) => p.id === leftId)!;
  const right = PRESETS.find((p) => p.id === rightId)!;
  const leftRes = compute(left.input);
  const rightRes = compute(right.input);
  const leftAccent = ACCENTS[left.accent];
  const rightAccent = ACCENTS[right.accent];

  const diff = rightRes.prediction - leftRes.prediction;

  const swap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Compare Two Student Profiles
          </CardTitle>
          <CardDescription>
            Pick two scenario presets to see how different profiles score — and the points gap between them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student A</label>
              <Select value={leftId} onValueChange={setLeftId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center pb-1">
              <Button variant="outline" size="icon" onClick={swap} aria-label="Swap profiles" title="Swap A and B">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student B</label>
              <Select value={rightId} onValueChange={setRightId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison cards */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <ComparisonCard preset={left} result={leftRes} accent={leftAccent} side="A" />
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="rounded-full border-2 border-dashed border-border bg-background px-4 py-2 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {diff >= 0 ? "B is higher by" : "A is higher by"}
            </div>
            <div className={`text-2xl font-bold tabular-nums ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {Math.abs(diff).toFixed(1)}
            </div>
            <div className="text-[10px] text-muted-foreground">points</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
        </div>
        <ComparisonCard preset={right} result={rightRes} accent={rightAccent} side="B" />
      </div>

      {/* Feature-by-feature delta table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Indicator-by-Indicator Comparison</CardTitle>
          <CardDescription>Side-by-side values for every input feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-[1fr_auto_auto_auto] sm:gap-3">
            <div className="font-semibold text-muted-foreground">Indicator</div>
            <div className="hidden text-right font-semibold text-muted-foreground sm:block">Student A</div>
            <div className="hidden text-right font-semibold text-muted-foreground sm:block">Student B</div>
            <div className="text-right font-semibold text-muted-foreground">Δ</div>
            {FEATURE_ROWS(left.input, right.input).map((r, i) => (
              <FeatureRow key={i} {...r} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComparisonCard({ preset, result, accent, side }: { preset: Preset; result: PredictionResult; accent: typeof ACCENTS[string]; side: "A" | "B" }) {
  const Icon = preset.icon;
  return (
    <Card className={`relative ring-1 ${accent.ring} ${accent.bg} overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-bold ${accent.text}`}>{side}</span>
            <Icon className={`h-5 w-5 ${accent.text}`} />
            <span className="font-semibold">{preset.label}</span>
          </div>
          <Badge variant="outline" className={accent.badge}>{result.prediction >= 75 ? "Strong" : result.prediction >= 50 ? "Moderate" : "At-Risk"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Predicted Score</div>
          <div className={`text-4xl font-bold tabular-nums ${accent.text}`}>{result.prediction}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${accent.bar} transition-all`} style={{ width: `${result.prediction}%` }} />
          </div>
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Engagement</div>
            <div className="font-semibold tabular-nums">{result.engineered_features.engagement_index}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Internal</div>
            <div className="font-semibold tabular-nums">{result.engineered_features.avg_internal_score}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatRow {
  label: string;
  a: string;
  b: string;
  delta: string;
  tone: string;
}

function FEATURE_ROWS(a: StudentInput, b: StudentInput): FeatRow[] {
  const rows: FeatRow[] = [];
  const push = (label: string, av: number | string, bv: number | string, unit = "") => {
    const an = typeof av === "number" ? av : parseFloat(av);
    const bn = typeof bv === "number" ? bv : parseFloat(bv);
    const d = bn - an;
    rows.push({
      label,
      a: typeof av === "number" ? `${av}${unit}` : av,
      b: typeof bv === "number" ? `${bv}${unit}` : bv,
      delta: `${d >= 0 ? "+" : ""}${d.toFixed(d % 1 === 0 ? 0 : 1)}${unit}`,
      tone: d > 0.05 ? "text-emerald-600" : d < -0.05 ? "text-rose-600" : "text-muted-foreground",
    });
  };
  push("Attendance", a.attendance, b.attendance, "%");
  push("Study Hrs/Wk", a.study_hours_per_week, b.study_hours_per_week);
  push("Sleep Hrs", a.sleep_hours, b.sleep_hours);
  push("Assignment", a.assignment_score, b.assignment_score);
  push("IA-1", a.internal_assessment_1, b.internal_assessment_1);
  push("IA-2", a.internal_assessment_2, b.internal_assessment_2);
  push("Prev GPA", a.previous_semester_gpa, b.previous_semester_gpa);
  push("Parental Support", a.parental_support, b.parental_support, "");
  push("Income", a.family_income_level, b.family_income_level, "");
  push("Internet", a.internet_access, b.internet_access, "");
  push("Part-time Job", a.part_time_job, b.part_time_job, "");
  return rows;
}

function FeatureRow({ label, a, b, delta, tone }: FeatRow) {
  return (
    <>
      <div className="font-medium">{label}</div>
      <div className="text-right tabular-nums text-muted-foreground">{a}</div>
      <div className="text-right tabular-nums text-muted-foreground">{b}</div>
      <div className={`text-right tabular-nums font-semibold ${tone}`}>{delta}</div>
    </>
  );
}
