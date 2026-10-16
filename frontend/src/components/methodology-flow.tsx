"use client";

import { Database, FlaskConical, BarChart3, GitBranch, Cpu, Target, Zap, ChevronRight } from "lucide-react";

const PHASES = [
  { n: "01", icon: Database, label: "Data", sub: "Generation & Loading", color: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  { n: "02", icon: FlaskConical, label: "Preprocess", sub: "Dedup · impute · IQR cap", color: "from-cyan-500/15 to-cyan-500/5 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  { n: "03", icon: BarChart3, label: "EDA", sub: "Univariate · bivariate · corr", color: "from-teal-500/15 to-teal-500/5 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
  { n: "04", icon: GitBranch, label: "Features", sub: "avg_internal · engagement", color: "from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { n: "05", icon: Cpu, label: "Model", sub: "LR · RF · GBM train", color: "from-green-500/15 to-green-500/5 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
  { n: "06", icon: Target, label: "Evaluate", sub: "MAE · RMSE · R² · CIs", color: "from-lime-500/15 to-lime-500/5 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800" },
  { n: "07", icon: Zap, label: "Deploy", sub: "Client-side inference", color: "from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
];

export function MethodologyFlow() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-muted/30 to-background p-4">
      <div className="flex flex-col gap-2 overflow-x-auto pb-2 lg:flex-row lg:items-stretch">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={p.n} className="flex items-center gap-2 lg:flex-1">
              <div className={`card-lift group relative flex w-full min-w-[150px] flex-col rounded-lg border bg-gradient-to-br p-3 ${p.color}`}>
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold opacity-60">{p.n}</span>
                </div>
                <div className="mt-2 text-sm font-bold leading-tight">{p.label}</div>
                <div className="text-[10px] leading-tight opacity-75">{p.sub}</div>
              </div>
              {i < PHASES.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        The full supervised-ML lifecycle — from synthetic data generation through client-side deployment. Hover any phase.
      </p>
    </div>
  );
}
