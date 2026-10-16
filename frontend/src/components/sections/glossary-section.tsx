"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface GlossaryEntry {
  term: string;
  short: string;
  def: string;
  category: "metric" | "method" | "feature" | "concept";
}

const GLOSSARY: GlossaryEntry[] = [
  { term: "R² Score", short: "Coefficient of Determination", category: "metric",
    def: "The proportion of variance in the target explained by the model. 0 = no better than predicting the mean; 1 = perfect. Our model explains ~71% of score variance." },
  { term: "MAE", short: "Mean Absolute Error", category: "metric",
    def: "Average absolute difference between predicted and actual scores, in points. Lower is better. MAE=5 means predictions are off by ~5 points on average." },
  { term: "RMSE", short: "Root Mean Squared Error", category: "metric",
    def: "Square root of the average squared error. Penalizes large errors more than MAE. RMSE ≥ MAE always." },
  { term: "MSE", short: "Mean Squared Error", category: "metric",
    def: "Average of squared errors. Sensitive to outliers due to the squaring." },
  { term: "Gradient Boosting", short: "Sequential tree ensemble", category: "method",
    def: "An ensemble of 300 sequential decision trees, each correcting the residual errors of the previous. Learning rate 0.05, max depth 3." },
  { term: "PDP", short: "Partial Dependence Plot", category: "method",
    def: "Shows the average effect of one feature on the prediction, sweeping it across its range while holding all other features at their mean. Reveals the global trend." },
  { term: "ICE", short: "Individual Conditional Expectation", category: "method",
    def: "Like a PDP but for individual instances — one line per real student. Diverging lines reveal feature interactions the PDP average hides." },
  { term: "SHAP", short: "SHapley Additive exPlanations", category: "method",
    def: "A game-theoretic method attributing each prediction to feature contributions. The global summary (beeswarm) shows how each feature pushes predictions up/down across all students." },
  { term: "Bootstrap CI", short: "Bootstrap Confidence Interval", category: "method",
    def: "An uncertainty band built by refitting the model on many resampled (with replacement) training sets. The 5th–95th percentile range = 90% CI." },
  { term: "IQR", short: "Interquartile Range", category: "method",
    def: "Q3 − Q1, the spread of the middle 50% of data. Outliers are capped at Q1 − 1.5×IQR and Q3 + 1.5×IQR to limit extreme values." },
  { term: "Engagement Index", short: "Engineered feature", category: "feature",
    def: "attendance × study_hours_per_week (attendance as a fraction). The model's #1 feature (37% importance) — captures that consistent AND diligent students outperform." },
  { term: "avg_internal_score", short: "Engineered feature", category: "feature",
    def: "Mean of internal_assessment_1 and internal_assessment_2. Condenses two correlated mid-semester signals into a single, more stable indicator." },
  { term: "Residual", short: "actual − predicted", category: "concept",
    def: "Positive = the model under-predicted; negative = over-predicted. A well-calibrated model has residuals centered at 0." },
  { term: "Overfitting", short: "Memorizing vs generalizing", category: "concept",
    def: "When a model memorizes training data instead of learning generalizable patterns. Detected when train performance ≫ test performance." },
  { term: "Feature Importance", short: "Relative contribution", category: "concept",
    def: "How much each feature contributes to the model's predictions, averaged across all trees. Sums to 1 (or 100%)." },
  { term: "Label Encoding", short: "Categorical → numeric", category: "method",
    def: "Converts text categories (e.g. 'Low'/'Medium'/'High') to integers (0/1/2) so the model can use them. Order is alphabetical, not semantic." },
];

const CATEGORY_STYLES: Record<GlossaryEntry["category"], { label: string; badge: string }> = {
  metric: { label: "Metric", badge: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  method: { label: "Method", badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  feature: { label: "Feature", badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  concept: { label: "Concept", badge: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300" },
};

export default function GlossarySection() {
  const [filter, setFilter] = React.useState<GlossaryEntry["category"] | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = GLOSSARY.filter((g) => {
    const matchCat = filter === "all" || g.category === filter;
    const q = query.toLowerCase();
    const matchQ = !q || g.term.toLowerCase().includes(q) || g.short.toLowerCase().includes(q) || g.def.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          ML Glossary
        </CardTitle>
        <CardDescription>
          Reference for every ML term used in this project. Search or filter by category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search terms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:w-56"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              All ({GLOSSARY.length})
            </button>
            {(["metric", "method", "feature", "concept"] as const).map((cat) => {
              const count = GLOSSARY.filter((g) => g.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition ${filter === cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  {cat}s ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms grid */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No terms match &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((g) => {
              const cs = CATEGORY_STYLES[g.category];
              return (
                <div key={g.term} className="rounded-lg border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{g.term}</div>
                      <div className="text-[11px] text-muted-foreground">{g.short}</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-normal ${cs.badge}`}>{cs.label}</Badge>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{g.def}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 text-center text-[11px] text-muted-foreground">
          {filtered.length} of {GLOSSARY.length} terms · inline terms throughout the page show the same definitions on hover
        </div>
      </CardContent>
    </Card>
  );
}
