"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  loadModel, loadEncoders, predict, explainPrediction,
  type StudentInput, type PredictionResult, type BreakdownResult,
} from "@/lib/model";
import { datasetStats } from "@/lib/eda-data";
import { baseline, categoricalModes } from "@/lib/baseline-data";
import {
  GraduationCap, Sparkles, TrendingUp, TrendingDown, Minus, RotateCcw, Zap,
  Activity, BookOpen, Clock, Moon, Trophy, Brain, UserX, Target, Heart,
} from "lucide-react";

interface NumericField {
  key: keyof StudentInput;
  label: string;
  icon: typeof Activity;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
}

interface CategoricalField {
  key: keyof StudentInput;
  label: string;
  icon: typeof Activity;
  options: string[];
  default: string;
}

const NUMERIC_FIELDS: NumericField[] = [
  { key: "attendance", label: "Attendance", icon: Activity, min: 40, max: 100, step: 0.5, default: 80, unit: "%" },
  { key: "study_hours_per_week", label: "Study Hours / Week", icon: BookOpen, min: 0, max: 35, step: 0.5, default: 12, unit: "h" },
  { key: "sleep_hours", label: "Sleep Hours / Day", icon: Moon, min: 3, max: 10, step: 0.5, default: 6.5, unit: "h" },
  { key: "extracurricular_hours", label: "Extracurricular / Week", icon: Trophy, min: 0, max: 15, step: 0.5, default: 4, unit: "h" },
  { key: "assignment_score", label: "Assignment Score", icon: Brain, min: 0, max: 100, step: 1, default: 70, unit: "" },
  { key: "internal_assessment_1", label: "Internal Assessment 1", icon: Brain, min: 0, max: 100, step: 1, default: 65, unit: "" },
  { key: "internal_assessment_2", label: "Internal Assessment 2", icon: Brain, min: 0, max: 100, step: 1, default: 65, unit: "" },
  { key: "previous_semester_gpa", label: "Previous Semester GPA", icon: TrendingUp, min: 0, max: 10, step: 0.1, default: 7, unit: "" },
];

const CATEGORICAL_FIELDS: CategoricalField[] = [
  { key: "gender", label: "Gender", icon: GraduationCap, options: ["Male", "Female"], default: "Male" },
  { key: "parental_support", label: "Parental Support", icon: Sparkles, options: ["Low", "Medium", "High"], default: "Medium" },
  { key: "family_income_level", label: "Family Income Level", icon: TrendingUp, options: ["Low", "Medium", "High"], default: "Medium" },
  { key: "internet_access", label: "Internet Access", icon: Zap, options: ["Yes", "No"], default: "Yes" },
  { key: "part_time_job", label: "Part-time Job", icon: Clock, options: ["Yes", "No"], default: "No" },
];

const DEFAULT_INPUT: StudentInput = {
  attendance: 80,
  study_hours_per_week: 12,
  sleep_hours: 6.5,
  extracurricular_hours: 4,
  assignment_score: 70,
  internal_assessment_1: 65,
  internal_assessment_2: 65,
  previous_semester_gpa: 7,
  gender: "Male",
  parental_support: "Medium",
  family_income_level: "Medium",
  internet_access: "Yes",
  part_time_job: "No",
};

// Scenario presets — quick-fill buttons for faculty demos
interface Preset {
  id: string;
  label: string;
  icon: typeof Activity;
  description: string;
  accent: string;
  input: StudentInput;
}

const PRESETS: Preset[] = [
  {
    id: "top-performer",
    label: "Top Performer",
    icon: Trophy,
    description: "High attendance, diligent study, strong assessments",
    accent: "emerald",
    input: {
      attendance: 96, study_hours_per_week: 24, sleep_hours: 8, extracurricular_hours: 6,
      assignment_score: 92, internal_assessment_1: 88, internal_assessment_2: 90,
      previous_semester_gpa: 9.2, gender: "Female", parental_support: "High",
      family_income_level: "High", internet_access: "Yes", part_time_job: "No",
    },
  },
  {
    id: "average",
    label: "Average Student",
    icon: Target,
    description: "Dataset-typical profile · medium across all indicators",
    accent: "sky",
    input: {
      attendance: 78, study_hours_per_week: 12, sleep_hours: 6.5, extracurricular_hours: 4,
      assignment_score: 72, internal_assessment_1: 67, internal_assessment_2: 69,
      previous_semester_gpa: 6.8, gender: "Male", parental_support: "Medium",
      family_income_level: "Medium", internet_access: "Yes", part_time_job: "No",
    },
  },
  {
    id: "at-risk",
    label: "At-Risk",
    icon: UserX,
    description: "Low attendance, minimal study, weak assessments",
    accent: "rose",
    input: {
      attendance: 55, study_hours_per_week: 3, sleep_hours: 4.5, extracurricular_hours: 1,
      assignment_score: 40, internal_assessment_1: 35, internal_assessment_2: 38,
      previous_semester_gpa: 4.5, gender: "Male", parental_support: "Low",
      family_income_level: "Low", internet_access: "No", part_time_job: "Yes",
    },
  },
  {
    id: "first-gen",
    label: "First-Gen Struggler",
    icon: Heart,
    description: "Works part-time, no internet, but studies hard",
    accent: "amber",
    input: {
      attendance: 85, study_hours_per_week: 18, sleep_hours: 5.5, extracurricular_hours: 2,
      assignment_score: 68, internal_assessment_1: 60, internal_assessment_2: 62,
      previous_semester_gpa: 6.0, gender: "Female", parental_support: "Low",
      family_income_level: "Low", internet_access: "No", part_time_job: "Yes",
    },
  },
];

const PRESET_STYLES: Record<string, { active: string; idle: string }> = {
  emerald: {
    active: "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    idle: "border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-800",
  },
  sky: {
    active: "border-sky-400 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    idle: "border-border hover:border-sky-300 hover:bg-sky-50/50 dark:hover:border-sky-800",
  },
  rose: {
    active: "border-rose-400 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    idle: "border-border hover:border-rose-300 hover:bg-rose-50/50 dark:hover:border-rose-800",
  },
  amber: {
    active: "border-amber-400 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    idle: "border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-800",
  },
};

const BAND_STYLES = {
  strong: {
    label: "Strong",
    color: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    progress: "bg-emerald-500",
    glow: "from-emerald-500/20 to-transparent",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    progress: "bg-amber-500",
    glow: "from-amber-500/20 to-transparent",
  },
  "at-risk": {
    label: "At-Risk",
    color: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    progress: "bg-rose-500",
    glow: "from-rose-500/20 to-transparent",
  },
};

// Compute the default prediction + breakdown once (model is bundled synchronously).
function computeDefault(): { result: PredictionResult; breakdown: BreakdownResult } | null {
  try {
    const model = loadModel();
    const encoders = loadEncoders();
    return {
      result: predict(model, encoders, DEFAULT_INPUT),
      breakdown: explainPrediction(model, encoders, DEFAULT_INPUT, baseline),
    };
  } catch {
    return null;
  }
}

export default function Predictor() {
  const [input, setInput] = useState<StudentInput>(DEFAULT_INPUT);
  const [initial] = useState(computeDefault);
  const [result, setResult] = useState<PredictionResult | null>(initial?.result ?? null);
  const [breakdown, setBreakdown] = useState<BreakdownResult | null>(initial?.breakdown ?? null);
  const [loading, setLoading] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const modelReady = true;

  // animate the score number when result changes
  useEffect(() => {
    if (!result) return;
    const target = result.prediction;
    const duration = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimateScore(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  const handleNumeric = (key: keyof StudentInput, value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const handleCategorical = (key: keyof StudentInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const handlePredict = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const model = loadModel();
      const encoders = loadEncoders();
      const res = predict(model, encoders, input);
      const bd = explainPrediction(model, encoders, input, baseline);
      setAnimateScore(0);
      setResult(res);
      setBreakdown(bd);
      setLoading(false);
    }, 200);
  }, [input]);

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setActivePreset(null);
    if (initial) {
      setResult(initial.result);
      setBreakdown(initial.breakdown);
      setAnimateScore(0);
    }
  };

  const applyPreset = (preset: Preset) => {
    setInput(preset.input);
    setActivePreset(preset.id);
    setLoading(true);
    setTimeout(() => {
      const model = loadModel();
      const encoders = loadEncoders();
      const res = predict(model, encoders, preset.input);
      const bd = explainPrediction(model, encoders, preset.input, baseline);
      setAnimateScore(0);
      setResult(res);
      setBreakdown(bd);
      setLoading(false);
    }, 150);
  };

  const style = result ? BAND_STYLES[result.band] : null;
  const stats = datasetStats;

  return (
    <div className="space-y-6">
      {/* ---------- SCENARIO PRESETS ---------- */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick Scenarios</h3>
          <span className="text-xs text-muted-foreground">— click a preset to instantly load a student profile</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            const ps = PRESET_STYLES[preset.accent];
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`group rounded-xl border p-3 text-left transition-all hover:shadow-md ${isActive ? ps.active : ps.idle}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${isActive ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {isActive && <span className="text-[10px] font-bold uppercase tracking-wide">Active</span>}
                </div>
                <div className="mt-1.5 text-sm font-semibold leading-tight">{preset.label}</div>
                <div className="mt-0.5 text-[10px] leading-tight opacity-80">{preset.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* ---------- INPUT FORM ---------- */}
        <Card className="border-border/60 shadow-lg shadow-primary/5">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student Details
                </CardTitle>
                <CardDescription className="mt-1">
                  Adjust the academic &amp; behavioral indicators below
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Numeric sliders — matching the mockup: label row with icon + green pill badge, slider below */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic &amp; Behavioral Indicators
                </h4>
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {NUMERIC_FIELDS.map((field) => {
                    const Icon = field.icon;
                    const value = input[field.key] as number;
                    return (
                      <div key={field.key} className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {field.label}
                          </Label>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {value.toFixed(field.step < 1 ? 1 : 0)}
                            {field.unit && <span className="ml-0.5 text-xs opacity-70">{field.unit}</span>}
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          onValueChange={(v) => handleNumeric(field.key, v[0])}
                          className="cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Categorical selects — matching the mockup: rounded, icon+label, touch-friendly */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Demographic &amp; Contextual Factors
                </h4>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {CATEGORICAL_FIELDS.map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {field.label}
                        </Label>
                        <Select
                          value={input[field.key] as string}
                          onValueChange={(v) => handleCategorical(field.key, v)}
                        >
                          <SelectTrigger className="h-11 rounded-lg border-border bg-background text-sm font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handlePredict}
                disabled={!modelReady || loading}
                size="lg"
                className="h-12 w-full rounded-lg text-base font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Predicting…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Predict Final Exam Score
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- RESULT PANEL ---------- */}
        <Card className="relative overflow-hidden border-border/60 shadow-sm">
          {style && (
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow}`} />
          )}
          <CardHeader className="relative border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Prediction Result
            </CardTitle>
            <CardDescription>
              Powered by Gradient Boosting Regressor · 300 estimators
            </CardDescription>
          </CardHeader>
          <CardContent className="relative pt-6">
            {!result || !breakdown ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-muted p-5">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Click &ldquo;Predict&rdquo; to see the projected exam score
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inference runs entirely in your browser
                </p>
              </div>
            ) : (
            <div className="space-y-6">
              {/* Score display */}
              <div className="text-center">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Predicted Final Exam Score
                </div>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-6xl font-bold tabular-nums ${style.color}`}>
                    {animateScore.toFixed(1)}
                  </span>
                  <span className="mb-2 text-2xl font-semibold text-muted-foreground">/100</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant="outline" className={style.badge}>
                    {style.label} Performance
                  </Badge>
                </div>
                <Progress
                  value={result.prediction}
                  className="mt-4 h-2"
                  indicatorClassName={style.progress}
                />
                <p className="mt-3 text-sm text-muted-foreground">{result.message}</p>
              </div>

              <Separator />

              {/* Explainability waterfall */}
              <div>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" />
                  Prediction Breakdown
                </h4>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Marginal contribution of each factor vs. the dataset-average student
                  (baseline score <span className="font-semibold tabular-nums">{breakdown.baselinePrediction}</span> → predicted <span className={`font-semibold tabular-nums ${style.color}`}>{breakdown.userPrediction}</span>, Δ <span className="font-semibold tabular-nums">{breakdown.totalDelta >= 0 ? "+" : ""}{breakdown.totalDelta}</span>)
                </p>
                <Waterfall breakdown={breakdown} />
              </div>

              <Separator />

              {/* Engineered features */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Engineered Features (computed)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Avg Internal Score</div>
                    <div className="mt-0.5 text-xl font-semibold tabular-nums">
                      {result.engineered_features.avg_internal_score}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Engagement Index</div>
                    <div className="mt-0.5 text-xl font-semibold tabular-nums">
                      {result.engineered_features.engagement_index}
                    </div>
                    <div className="text-[10px] text-muted-foreground">attendance × study hrs</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="font-semibold">Baseline student:</span>{" "}
                {categoricalModes.gender}, {categoricalModes.parental_support} support, {categoricalModes.family_income_level} income · attendance 78% · 12 study hrs · GPA 6.8
              </div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Waterfall chart ----------
function Waterfall({ breakdown }: { breakdown: BreakdownResult }) {
  const maxAbs = Math.max(...breakdown.contributions.slice(0, 8).map((c) => Math.abs(c.contribution)), 0.1);
  const top = breakdown.contributions.slice(0, 8);
  return (
    <div className="space-y-1.5">
      {top.map((c) => {
        const pct = Math.min(100, (Math.abs(c.contribution) / maxAbs) * 100);
        const positive = c.contribution > 0.05;
        const negative = c.contribution < -0.05;
        const tone = positive
          ? "bg-emerald-500/80"
          : negative
          ? "bg-rose-500/80"
          : "bg-muted-foreground/40";
        const textTone = positive ? "text-emerald-600" : negative ? "text-rose-600" : "text-muted-foreground";
        const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
        return (
          <div key={c.feature} className="flex items-center gap-2 text-xs">
            <div className="flex w-24 shrink-0 items-center gap-1 truncate" title={c.label}>
              <Icon className={`h-3 w-3 shrink-0 ${textTone}`} />
              <span className="truncate font-medium">{c.label}</span>
            </div>
            <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted/40">
              {/* center line */}
              <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
              {/* bar */}
              <div
                className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-sm transition-all ${tone}`}
                style={
                  positive
                    ? { left: "50%", width: `${pct / 2}%` }
                    : { right: "50%", width: `${pct / 2}%` }
                }
              />
            </div>
            <div className={`w-14 shrink-0 text-right tabular-nums font-semibold ${textTone}`}>
              {c.contribution >= 0 ? "+" : ""}{c.contribution.toFixed(1)}
            </div>
          </div>
        );
      })}
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/80" /> pushes score up</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-rose-500/80" /> drags score down</span>
      </div>
    </div>
  );
}
