"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

// Glossary of ML terms used across the project
const GLOSSARY: Record<string, { term: string; def: string }> = {
  "R²": {
    term: "R² Score (Coefficient of Determination)",
    def: "The proportion of variance in the target explained by the model. 0 = no better than predicting the mean; 1 = perfect. Our model explains ~71% of score variance.",
  },
  MAE: {
    term: "MAE (Mean Absolute Error)",
    def: "Average absolute difference between predicted and actual scores, in points. Lower is better. MAE=5 means predictions are off by ~5 points on average.",
  },
  RMSE: {
    term: "RMSE (Root Mean Squared Error)",
    def: "Square root of the average squared error. Penalizes large errors more than MAE. RMSE ≥ MAE always.",
  },
  MSE: {
    term: "MSE (Mean Squared Error)",
    def: "Average of squared errors. Sensitive to outliers due to the squaring.",
  },
  PDP: {
    term: "Partial Dependence Plot",
    def: "Shows the average effect of one feature on the prediction, sweeping it across its range while holding all other features at their mean. Reveals the global trend.",
  },
  ICE: {
    term: "ICE (Individual Conditional Expectation)",
    def: "Like a PDP but for individual instances — one line per real student. Diverging lines reveal feature interactions the PDP average hides.",
  },
  "Bootstrap CI": {
    term: "Bootstrap Confidence Interval",
    def: "An uncertainty band built by refitting the model on many resampled (with replacement) training sets. The 5th–95th percentile range = 90% CI.",
  },
  IQR: {
    term: "IQR (Interquartile Range)",
    def: "Q3 − Q1, the spread of the middle 50% of data. Outliers are capped at Q1 − 1.5×IQR and Q3 + 1.5×IQR to limit extreme values.",
  },
  SHAP: {
    term: "SHAP (SHapley Additive exPlanations)",
    def: "A game-theoretic method attributing each prediction to feature contributions. The global summary (beeswarm) shows how each feature pushes predictions up/down across all students.",
  },
  "Gradient Boosting": {
    term: "Gradient Boosting Regressor",
    def: "An ensemble of 300 sequential decision trees, each correcting the residual errors of the previous. Learning rate 0.05, max depth 3.",
  },
  "Engagement Index": {
    term: "engagement_index (engineered)",
    def: "attendance × study_hours_per_week (attendance as a fraction). The model's #1 feature (37% importance) — captures that consistent AND diligent students outperform.",
  },
  residual: {
    term: "Residual",
    def: "actual − predicted. Positive = the model under-predicted; negative = over-predicted. A well-calibrated model has residuals centered at 0.",
  },
  overfitting: {
    term: "Overfitting",
    def: "When a model memorizes training data instead of learning generalizable patterns. Detected when train performance ≫ test performance.",
  },
};

interface TermProps {
  children: React.ReactNode;
  term: keyof typeof GLOSSARY | string;
  className?: string;
}

/**
 * Renders a term as a dotted-underlined clickable/hoverable span that opens
 * a tooltip with the ML definition. Falls back gracefully if the term isn't
 * in the glossary (renders plain text).
 */
export function Term({ children, term, className }: TermProps) {
  const entry = GLOSSARY[term as string];
  if (!entry) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`cursor-help border-b border-dotted border-primary/60 text-primary/90 underline-offset-2 hover:text-primary ${className ?? ""}`}
        >
          {children}
          <HelpCircle className="ml-0.5 inline h-3 w-3 align-text-bottom opacity-60" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-left">
        <div className="font-semibold">{entry.term}</div>
        <div className="mt-1 font-normal leading-snug opacity-95">{entry.def}</div>
      </TooltipContent>
    </Tooltip>
  );
}
