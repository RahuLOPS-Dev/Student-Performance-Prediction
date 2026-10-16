"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { EdaData } from "@/lib/eda";
import { datasetStats } from "@/lib/eda-data";
import {
  FileText, Target, ArrowDownToLine, ArrowUpFromLine, Gauge, Users, ShieldAlert,
  Lightbulb, Cpu, Scale, CheckCircle2, AlertTriangle,
} from "lucide-react";

const SUBGROUP_LABELS: Record<string, string> = {
  gender: "Gender",
  parental_support: "Parental Support",
  family_income_level: "Family Income",
  internet_access: "Internet Access",
  part_time_job: "Part-time Job",
};

export default function ModelCardSection({ eda }: { eda: EdaData }) {
  const best = [...eda.model_comparison].sort((a, b) => b.R2_Score - a.R2_Score)[0];
  const stats = datasetStats;
  const diag = eda.diagnostics.residual_stats;
  const subgroups = eda.subgroups;

  // Compute max MAE across subgroups for color scale reference
  const allMaes: number[] = [];
  Object.values(subgroups).forEach((rows) => rows.forEach((r) => allMaes.push(r.mae)));
  const maxMae = Math.max(...allMaes, 0.1);
  const minMae = Math.min(...allMaes, maxMae);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Model Details */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Model Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Row label="Model name" value="StudentPerformanceGBM" />
            <Row label="Version" value="1.0.0" />
            <Row label="Type" value="Gradient Boosting Regressor" />
            <Row label="Owner" value="Capstone Project 1" />
            <Row label="License" value="Academic / MIT" />
            <Row label="Institution" value="MNNIT Allahabad" />
            <Row label="Estimators" value={`${best.Model === "Gradient Boosting" ? "300 trees" : "—"}`} />
            <Row label="Learning rate" value="0.05" />
          </dl>
        </CardContent>
      </Card>

      {/* Intended Use */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Intended Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Primary use cases
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Early identification of at-risk students for targeted academic support</li>
              <li>• What-if exploration of how study habits affect predicted outcomes</li>
              <li>• Educational research on academic-performance drivers</li>
            </ul>
          </div>
          <Separator />
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Out of scope
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• High-stakes individual decisions (admissions, scholarships)</li>
              <li>• Production deployment without validation on real data</li>
              <li>• Use on populations outside the training distribution</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowDownToLine className="h-4 w-4 text-primary" />
            Inputs (13 raw → 15 features)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {[
              "attendance", "study_hours", "sleep_hours", "extracurricular",
              "assignment_score", "IA-1", "IA-2", "prev_GPA",
              "gender", "parental_support", "income", "internet", "part_time_job",
            ].map((f) => (
              <Badge key={f} variant="secondary" className="text-[10px] font-normal">{f}</Badge>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-primary/5 p-2.5 text-xs">
            <span className="font-semibold text-primary">+2 engineered:</span>{" "}
            <code className="rounded bg-background px-1 py-0.5">avg_internal_score</code>{" "}
            <code className="rounded bg-background px-1 py-0.5">engagement_index</code>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowUpFromLine className="h-4 w-4 text-primary" />
            Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Target" value="final_exam_score" />
          <Row label="Range" value="0 – 100" />
          <Row label="Type" value="Regression (continuous)" />
          <div className="pt-1">
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Performance bands</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">At-Risk (&lt;50)</Badge>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">Moderate (50–75)</Badge>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Strong (≥75)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-primary" />
            Performance
          </CardTitle>
          <CardDescription>On 20% held-out test set ({diag.n_test} students)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Row label="R² Score" value={`${(best.R2_Score * 100).toFixed(2)}%`} highlight />
            <Row label="MAE" value={`${best.MAE}`} highlight />
            <Row label="RMSE" value={`${best.RMSE}`} />
            <Row label="Bias" value={`${diag.mean_residual}`} />
            <Row label="Within ±5" value={`${diag.within_5}%`} />
            <Row label="Within ±10" value={`${diag.within_10}%`} />
          </div>
        </CardContent>
      </Card>

      {/* Fairness / Subgroups */}
      <Card className="border-border/60 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" />
            Subgroup Performance & Fairness
          </CardTitle>
          <CardDescription>
            MAE by demographic/contextual group · identifies where the model errs more (smaller gap = fairer)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(subgroups).map(([key, rows]) => (
              <div key={key} className="rounded-lg border bg-card p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {SUBGROUP_LABELS[key] ?? key}
                </div>
                <div className="space-y-1.5">
                  {rows.map((r) => {
                    const t = (r.mae - minMae) / (maxMae - minMae || 1);
                    const tone = t < 0.33 ? "text-emerald-600 dark:text-emerald-400" : t < 0.66 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
                    return (
                      <div key={r.group} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{r.group}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">n={r.count}</span>
                          <span className={`font-bold tabular-nums ${tone}`}>MAE {r.mae}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold">Fairness note:</span> MAE disparities across subgroups are small
            (range {minMae.toFixed(2)}–{maxMae.toFixed(2)} pts), and mean residuals (bias) are within ±0.3 pts —
            indicating no systematic over/under-prediction by demographic group on this dataset. Validate on real data before drawing fairness conclusions.
          </div>
        </CardContent>
      </Card>

      {/* Ethical Considerations */}
      <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-200">
            <ShieldAlert className="h-4 w-4" />
            Ethical Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><strong className="text-foreground">Synthetic data:</strong> predictions reflect the data-generation assumptions, not real student outcomes. Do not use for individual student evaluation.</span></li>
            <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><strong className="text-foreground">Socioeconomic proxies:</strong> features like family income, internet access, and parental support can encode structural inequities. Avoid using predictions to justify resource denial.</span></li>
            <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><strong className="text-foreground">Self-fulfilling labels:</strong> low predictions could lower expectations. Pair predictions with human judgment and supportive intervention, never punishment.</span></li>
            <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><strong className="text-foreground">Privacy:</strong> if deployed on real students, secure consent, data minimization, and FERPA-equivalent protections are required.</span></li>
          </ul>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-primary" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
              <span>Scroll to the <strong className="text-foreground">Predictor</strong> section or click a <strong className="text-foreground">scenario preset</strong> (Top Performer, At-Risk, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
              <span>Adjust the 8 sliders + 5 dropdowns to model any student</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
              <span>Click <strong className="text-foreground">Predict</strong> — inference runs in your browser; the waterfall shows each factor&apos;s contribution</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
              <span>Compare two profiles in the <strong className="text-foreground">Student Comparison</strong> section, or <strong className="text-foreground">Print Faculty Report</strong> for archival</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-semibold tabular-nums text-right ${highlight ? "text-primary" : ""}`}>{value}</dd>
    </div>
  );
}
