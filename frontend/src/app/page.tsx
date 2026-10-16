import fs from "fs";
import path from "path";
import SiteNav from "@/components/site-nav";
import Predictor from "@/components/sections/predictor";
import DatasetSection from "@/components/sections/dataset-section";
import ModelComparisonSection from "@/components/sections/model-comparison";
import EdaInsightsSection from "@/components/sections/eda-insights";
import DiagnosticsSection from "@/components/sections/diagnostics-section";
import PdpSection from "@/components/sections/pdp-section";
import ComparisonSection from "@/components/sections/comparison-section";
import ModelCardSection from "@/components/sections/model-card-section";
import ShapSection from "@/components/sections/shap-section";
import GlossarySection from "@/components/sections/glossary-section";
import { MethodologyFlow } from "@/components/methodology-flow";
import { BackToTop } from "@/components/back-to-top";
import { Reveal } from "@/components/reveal";
import { ReadingProgress } from "@/components/reading-progress";
import { PrintReport } from "@/components/print-report";
import { PrintButton } from "@/components/print-button";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { AnimatedNumber } from "@/components/animated-number";
import { CommandPalette } from "@/components/command-palette";
import { GuidedTour } from "@/components/guided-tour";
import { CopyLinkButton } from "@/components/copy-link-button";
import { HashSync } from "@/components/hash-sync";
import { WelcomeModal } from "@/components/welcome-modal";
import { ShareButton } from "@/components/share-button";
import { ResetOnboardingButton } from "@/components/reset-onboarding-button";
import { StatsAtAGlance } from "@/components/stats-at-a-glance";
import { Term } from "@/components/term";
import { InsightCallout } from "@/components/insight-callout";
import type { EdaData } from "@/lib/eda";
import { datasetStats } from "@/lib/eda-data";
import {
  GraduationCap, Target, Database, FlaskConical, BarChart3, Brain,
  TrendingUp, Layers, Sparkles, Cpu, GitBranch, CheckCircle2, AlertTriangle,
  BookOpen, Trophy, Activity, Users, LineChart, Zap, ArrowRight, FileText, Github,
  Printer, FileDown, Scale,
} from "lucide-react";

async function getEda(): Promise<EdaData> {
  const file = path.join(process.cwd(), "public", "eda-data.json");
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw) as EdaData;
}

export default async function Home() {
  const eda = await getEda();
  const stats = datasetStats;
  const bestModel = eda.model_comparison.sort((a, b) => b.R2_Score - a.R2_Score)[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ReadingProgress />
      <KeyboardShortcuts />
      <CommandPalette />
      <HashSync />
      <WelcomeModal />
      <SiteNav />

      {/* ============ HERO ============ */}
      <section id="hero" className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 dot-grid" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
        <div className="hero-orb pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="hero-orb-2 pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-chart-4/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              CSE Summer Training Project 2026 · Capstone Project 1
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Student Performance
              <span className="gradient-anim block bg-gradient-to-r from-primary via-chart-1 to-chart-4 bg-clip-text text-transparent">
                Prediction System
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A machine-learning system that predicts a student&apos;s final exam score from
              attendance, assignment scores, internal assessments, study habits, and behavioral
              indicators — trained on <strong className="text-foreground">{stats.clean_rows.toLocaleString()} student records</strong>.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href="#predictor" className="inline-flex">
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg">
                  <Sparkles className="h-4 w-4" /> Try the Live Predictor
                </button>
              </a>
              <a href="#methodology" className="inline-flex">
                <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-muted">
                  <BookOpen className="h-4 w-4" /> View Methodology
                </button>
              </a>
              <PrintButton className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10" >
                <span className="inline-flex items-center gap-2">
                  <FileDown className="h-4 w-4" /> Print Faculty Report
                </span>
              </PrintButton>
              <GuidedTour />
            </div>
          </div>

          {/* Hero metric chips */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroMetric icon={Trophy} label="Best Model" value={bestModel.Model} sub="Gradient Boosting" />
            <HeroMetric icon={Target} label="R² Score" value="" sub="variance explained" animate={{ num: bestModel.R2_Score * 100, decimals: 1, suffix: "%" }} />
            <HeroMetric icon={Activity} label="MAE" value="" sub="mean abs error" animate={{ num: bestModel.MAE, decimals: 2 }} />
            <HeroMetric icon={Users} label="Dataset" value="" sub="student records" animate={{ num: stats.clean_rows, decimals: 0 }} />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">
        {/* ============ OVERVIEW ============ */}
        <Section id="overview" eyebrow="Problem Statement" title="Project Overview" icon={FileText}>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-base leading-relaxed text-muted-foreground">
                Predicting student academic performance early enables timely intervention — helping
                educators identify at-risk learners, allocate support resources, and personalize
                learning pathways. This project builds a complete supervised-regression pipeline that
                forecasts a student&apos;s <strong className="text-foreground">final exam score (0–100)</strong> from a
                rich set of academic, behavioral, and demographic indicators.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The pipeline spans the full ML lifecycle: data generation, preprocessing, exploratory
                data analysis, feature engineering, multi-model training, evaluation, and deployment
                through an interactive web predictor that runs the trained model entirely in your browser.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Layers, label: "15 Features", sub: "10 numeric + 5 categorical" },
                  { icon: GitBranch, label: "2 Engineered", sub: "avg_internal, engagement" },
                  { icon: Cpu, label: "3 Models", sub: "LR · RF · GBM" },
                  { icon: FlaskConical, label: "80/20 Split", sub: "train / test" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border bg-card p-3">
                    <c.icon className="h-4 w-4 text-primary" />
                    <div className="mt-1.5 text-sm font-semibold">{c.label}</div>
                    <div className="text-[11px] text-muted-foreground">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-chart-4/5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-primary" /> Objective
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Predict <span className="font-semibold text-foreground">final_exam_score</span> using
                  attendance, study hours, sleep, extracurriculars, assignment &amp; internal assessment
                  scores, previous GPA, parental support, family income, internet access &amp; part-time job.
                </p>
                <div className="mt-4 rounded-lg bg-card/80 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Target variable</span>
                    <span className="font-mono text-xs">final_exam_score ∈ [0, 100]</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mean / Std</span>
                    <span className="font-mono text-xs">{stats.target_stats.mean} / {stats.target_stats.std}</span>
                  </div>
                  <div className="my-2 h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-mono text-xs">{stats.target_stats.min} – {stats.target_stats.max}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ METHODOLOGY ============ */}
        <Section id="methodology" eyebrow="ML Lifecycle" title="Methodology" icon={FlaskConical}>
          <div className="mb-6">
            <MethodologyFlow />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                n: "01", icon: Database, title: "Data Generation & Loading",
                desc: "Synthetic dataset of 1,200+ students generated with realistic distributions, injected missing values (40 in sleep_hours, 25 in internal_assessment_2) and 15 duplicates to make preprocessing meaningful.",
              },
              {
                n: "02", icon: FlaskConical, title: "Preprocessing",
                desc: "Duplicate removal, median imputation for missing numeric values, and IQR-based outlier capping (1.5×IQR) on key columns: attendance, study hours, assignment & assessment scores, final exam score.",
              },
              {
                n: "03", icon: BarChart3, title: "Exploratory Data Analysis",
                desc: "Univariate (score distribution), bivariate (study hours vs score, parental support vs score), and multivariate (correlation heatmap) analysis to uncover the strongest predictors.",
              },
              {
                n: "04", icon: GitBranch, title: "Feature Engineering",
                desc: "Two domain-driven features: avg_internal_score (mean of two assessments) and engagement_index (attendance × study hours) — the latter became the model's top feature.",
              },
              {
                n: "05", icon: Cpu, title: "Model Building",
                desc: "Three regression models trained & compared: Linear Regression (with StandardScaler), Random Forest (300 trees, depth 8), and Gradient Boosting (300 trees, lr 0.05, depth 3).",
              },
              {
                n: "06", icon: Target, title: "Evaluation",
                desc: "Metrics: MAE, MSE, RMSE, and R² Score on a held-out 20% test set. Gradient Boosting achieved the best R² of 0.7084 — selected as the deployment model.",
              },
              {
                n: "07", icon: Zap, title: "Deployment",
                desc: "The trained model is exported (300 trees + init + learning rate) and the inference is reimplemented in TypeScript, so predictions run entirely client-side — no server round-trips.",
              },
            ].map((p) => (
              <div key={p.n} className="card-lift group relative overflow-hidden rounded-xl border bg-card p-5 transition hover:shadow-md">
                <div className="absolute right-3 top-3 text-3xl font-bold text-muted/50 transition group-hover:text-primary/20">
                  {p.n}
                </div>
                <p.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ============ DATASET ============ */}
        <Section id="dataset" eyebrow="Data Exploration" title="Dataset Statistics" icon={Database}>
          <div className="mb-5">
            <InsightCallout tone="info" title="About the data">
              The dataset is <strong className="text-foreground">synthetic</strong> — generated with realistic
              distributions and injected noise (missing values, duplicates) to make preprocessing meaningful.
              {stats.duplicates_removed} duplicates were removed and {stats.missing_before} missing values
              were median-imputed. For real deployment, swap in a public dataset (e.g. from Kaggle).
            </InsightCallout>
          </div>
          <DatasetSection eda={eda} />
        </Section>

        {/* ============ PREDICTOR ============ */}
        <Section id="predictor" eyebrow="Live Demo" title="Interactive Score Predictor" icon={Sparkles}>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Enter a student&apos;s academic and behavioral profile below. The trained Gradient Boosting
            model (300 decision trees) runs in your browser and predicts the final exam score instantly.
          </p>
          <Predictor />
        </Section>

        {/* ============ COMPARISON ============ */}
        <Section id="compare" eyebrow="What-If Analysis" title="Student Comparison" icon={Users}>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Pick two student profiles to compare side-by-side — see the predicted-score gap and the
            indicator-by-indicator differences that drive it. Useful for understanding what separates
            a top performer from an at-risk student.
          </p>
          <ComparisonSection />
        </Section>

        {/* ============ MODELS ============ */}
        <Section id="models" eyebrow="Evaluation" title="Model Comparison" icon={Trophy}>
          <ModelComparisonSection eda={eda} />
        </Section>

        {/* ============ DIAGNOSTICS ============ */}
        <Section id="diagnostics" eyebrow="Model Rigor" title="Prediction Diagnostics" icon={Activity}>
          <DiagnosticsSection eda={eda} />
        </Section>

        {/* ============ EDA INSIGHTS ============ */}
        <Section id="insights" eyebrow="Visual Analytics" title="EDA Insights" icon={BarChart3}>
          <EdaInsightsSection eda={eda} />
        </Section>

        {/* ============ PDP ============ */}
        <Section id="explainability" eyebrow="Model Explainability" title="Partial Dependence Plots" icon={GitBranch}>
          <PdpSection eda={eda} />
        </Section>

        {/* ============ SHAP SUMMARY ============ */}
        <Section id="shap" eyebrow="Global Explainability" title="SHAP-style Feature Summary" icon={Brain}>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            A beeswarm-style global summary: each dot is one student, positioned by how much that
            feature pushes their score up (right) or down (left). Color shows the feature&apos;s value
            (blue = low, red = high). This is the most holistic view of model behavior.
          </p>
          <ShapSection eda={eda} />
        </Section>

        {/* ============ FEATURE ENGINEERING ============ */}
        <Section id="feature-eng" eyebrow="Domain Knowledge" title="Feature Engineering" icon={GitBranch}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <code className="rounded bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">avg_internal_score</code>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                The mean of <span className="font-mono text-xs">internal_assessment_1</span> and{" "}
                <span className="font-mono text-xs">internal_assessment_2</span>. Condenses two correlated
                mid-semester signals into a single, more stable academic-progress indicator.
              </p>
              <div className="mt-3 rounded-lg bg-muted/50 p-3 font-mono text-xs">
                avg_internal_score = (IA1 + IA2) / 2
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-medium">3rd most important feature (15.7% importance)</span>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <code className="rounded bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">engagement_index</code>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                The product of attendance (as a fraction) and weekly study hours. Captures the
                intuition that consistent <em>and</em> diligent students outperform those who only
                attend or only study.
              </p>
              <div className="mt-3 rounded-lg bg-muted/50 p-3 font-mono text-xs">
                engagement_index = (attendance / 100) × study_hours_per_week
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-medium">#1 most important feature (36.9% importance)</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ RESULTS ============ */}
        <Section id="results" eyebrow="Outcomes" title="Results & Conclusion" icon={CheckCircle2}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Key Findings
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span><strong className="text-foreground">Gradient Boosting</strong> was the best model with <Term term="R²">R²</Term> = <strong className="text-foreground">{(bestModel.R2_Score * 100).toFixed(2)}%</strong> and <Term term="MAE">MAE</Term> = <strong className="text-foreground">{bestModel.MAE}</strong> points.</span>
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>The engineered <strong className="text-foreground">engagement_index</strong> (attendance × study hours) was the single most predictive feature (36.9% importance) — confirming that consistent, diligent study habits matter most.</span>
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span><strong className="text-foreground">Assignment scores</strong> and <strong className="text-foreground">average internal assessment</strong> scores were the next strongest predictors.</span>
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Students <strong className="text-foreground">without internet access</strong> and those with a <strong className="text-foreground">part-time job</strong> showed lower predicted scores, flagging equity-of-access considerations.</span>
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Ensemble methods (GBM, RF) outperformed linear regression, indicating non-linear feature interactions.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
                <h3 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5" /> Limitations & Future Work
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>Dataset is synthetic; swapping in a real-world dataset (e.g. from Kaggle) would validate generalization and check for <Term term="overfitting">overfitting</Term>.</span></li>
                  <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>Hyperparameter tuning via GridSearchCV could further improve <Term term="R²">R²</Term>.</span></li>
                  <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>Cross-validation (k-fold) would give more robust error estimates.</span></li>
                  <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>The <Term term="SHAP">SHAP</Term> summary is a marginal-contribution approximation; a true TreeSHAP would give exact Shapley values.</span></li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-chart-4/10 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-primary" /> Model at a Glance
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <Row label="Algorithm" value="Gradient Boosting" />
                  <Row label="Estimators" value="300 trees" />
                  <Row label="Learning rate" value="0.05" />
                  <Row label="Max depth" value="3" />
                  <Row label="Features" value="15 (incl. 2 engineered)" />
                  <Row label="Training size" value="960 students (80%)" />
                  <Row label="Test size" value="240 students (20%)" />
                  <Row label="R² Score" value={`${(bestModel.R2_Score * 100).toFixed(2)}%`} highlight />
                  <Row label="MAE" value={`${bestModel.MAE} pts`} highlight />
                </dl>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <LineChart className="h-4 w-4 text-primary" /> Tech Stack
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Python", "pandas", "NumPy", "scikit-learn", "matplotlib", "seaborn", "Next.js", "TypeScript", "Tailwind", "Recharts"].map((t) => (
                    <span key={t} className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ MODEL CARD ============ */}
        <Section id="model-card" eyebrow="Transparency" title="Model Card" icon={Scale}>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            A structured model card (after Google&apos;s template) documenting intended use,
            inputs/outputs, performance, subgroup fairness, and ethical considerations —
            promoting responsible deployment.
          </p>
          <ModelCardSection eda={eda} />
        </Section>

        {/* ============ GLOSSARY ============ */}
        <Section id="glossary" eyebrow="Reference" title="ML Glossary" icon={BookOpen}>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Every ML term used in this project, defined in one place. Search or filter by category.
            Inline terms throughout the page show the same definitions on hover.
          </p>
          <GlossarySection />
        </Section>
      </main>

      {/* ============ FOOTER (sticky) ============ */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">Student Performance Prediction System</div>
                <div className="text-xs text-muted-foreground">Capstone Project 1 · AIML Summer Internship 2026</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {bestModel.Model} · R² {(bestModel.R2_Score * 100).toFixed(1)}%</span>
              <span className="hidden sm:flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {stats.clean_rows.toLocaleString()} records</span>
              <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Client-side inference</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4 text-xs">
            <span className="font-semibold text-muted-foreground">Jump to:</span>
            {[
              ["#overview", "Overview"], ["#methodology", "Methodology"], ["#dataset", "Dataset"],
              ["#predictor", "Predictor"], ["#compare", "Compare"], ["#models", "Models"],
              ["#diagnostics", "Diagnostics"], ["#insights", "EDA"], ["#explainability", "PDP"], ["#shap", "SHAP"], ["#results", "Results"], ["#model-card", "Model Card"], ["#glossary", "Glossary"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-muted-foreground transition-colors hover:text-primary hover:underline">
                {label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 border-t pt-4 text-center text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>IIHMF, MNNIT Allahabad, Prayagraj · Built with Next.js, scikit-learn &amp; the shadcn/ui component library</span>
              <ShareButton label="Share" className="px-2 py-1" />
              <ResetOnboardingButton />
            </div>
            <div className="text-[10px] opacity-75">
              Keyboard shortcuts: <kbd className="rounded border bg-muted px-1">1-9</kbd> sections · <kbd className="rounded border bg-muted px-1">⌘K</kbd> search · <kbd className="rounded border bg-muted px-1">P</kbd> predictor · <kbd className="rounded border bg-muted px-1">T</kbd> theme · <kbd className="rounded border bg-muted px-1">B</kbd> back to top
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
      <StatsAtAGlance bestModelName={bestModel.Model} bestR2={bestModel.R2_Score} bestMae={bestModel.MAE} />
      {/* Hidden on screen; shown only when printing (clean faculty report) */}
      <PrintReport eda={eda} />
    </div>
  );
}

// ---------- Helpers ----------
function Section({
  id, eyebrow, title, icon: Icon, children,
}: {
  id: string; eyebrow: string; title: string; icon: typeof Database; children: React.ReactNode;
}) {
  return (
    <section id={id} className="group scroll-mt-20 py-10">
      <Reveal>
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          </div>
          <CopyLinkButton sectionId={id} />
        </div>
      </Reveal>
      <Reveal delay={0.05}>{children}</Reveal>
    </section>
  );
}

function HeroMetric({ icon: Icon, label, value, sub, animate }: { icon: typeof Database; label: string; value: string | number; sub: string; animate?: { num: number; decimals?: number; suffix?: string } }) {
  return (
    <div className="card-lift rounded-xl border bg-card/80 p-4 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1.5 truncate text-xl font-bold tabular-nums">
        {animate ? (
          <AnimatedNumber value={animate.num} decimals={animate.decimals ?? 0} suffix={animate.suffix ?? ""} />
        ) : (
          value
        )}
      </div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-semibold tabular-nums ${highlight ? "text-primary" : ""}`}>{value}</dd>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-border ${className ?? ""}`} />;
}
