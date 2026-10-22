import fs from "fs";
import path from "path";
import SiteNav from "@/components/site-nav";
import Predictor from "@/components/sections/predictor";
import { BackToTop } from "@/components/back-to-top";
import { PrintReport } from "@/components/print-report";
import { PrintButton } from "@/components/print-button";
import type { EdaData } from "@/lib/eda";
import { datasetStats } from "@/lib/eda-data";
import {
  GraduationCap, Target, Sparkles, Trophy, Activity, Users,
  ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, BookOpen,
  TrendingUp, Award, Eye, Heart, Zap, Brain,
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
  const topFeatures = eda.feature_importances.slice(0, 5);
  const accuracyPct = Math.round(bestModel.R2_Score * 100);
  const within10 = Math.round(eda.diagnostics.residual_stats.within_10);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50/40 via-white to-violet-50/30">
      <SiteNav />

      {/* ============ HERO ============ */}
      <section id="hero" className="relative overflow-hidden border-b border-indigo-100">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-violet-500/5 to-amber-400/5" />
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-violet-400/12 blur-3xl" />
        <div className="pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-300/8 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              CSE Summer Training Project 2026
            </div>
            <h1 className="heading-gradient bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Student Performance Prediction System
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              What if you could know a student&apos;s exam score <strong className="text-slate-900">before they take it?</strong>{" "}
              This system predicts final exam scores from attendance, study habits, and academic records —
              helping teachers spot at-risk students early.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#predictor"
                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Sparkles className="h-4 w-4" /> Try the Predictor
              </a>
              <PrintButton className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Download Report
                </span>
              </PrintButton>
            </div>
          </div>

          {/* Hero metrics — plain English, no model names */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroMetric icon={Target} label="Accuracy" value={`${accuracyPct}%`} sub="of score variation explained" color="indigo" />
            <HeroMetric icon={Activity} label="Avg Error" value="±5 pts" sub="out of 100" color="violet" />
            <HeroMetric icon={CheckCircle2} label="Reliability" value={`${within10}%`} sub="within 10 points of actual" color="amber" />
            <HeroMetric icon={Users} label="Students" value={stats.clean_rows.toLocaleString()} sub="records analyzed" color="teal" />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">

        {/* ============ WHAT DRIVES SUCCESS ============ */}
        <Section id="insights" eyebrow="Key Insights" title="What Drives Student Success?" icon={Lightbulb}>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            After analyzing {stats.clean_rows.toLocaleString()} student records, the system identified
            which factors matter most for exam performance. Here&apos;s what it found:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <Trophy className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900">Top 5 Success Factors</h3>
              </div>
              <div className="mt-4 space-y-3">
                {topFeatures.map((f, i) => (
                  <div key={f.feature}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {i + 1}. {f.feature.replace(/_enc$/, "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className="font-bold tabular-nums text-indigo-600">{(f.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${f.importance * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <Heart className="h-5 w-5 text-violet-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">The #1 Factor: Engagement</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Students who <strong>attend class regularly AND study hard</strong> perform significantly
                  better than those who do only one. This combination is the single strongest predictor of
                  exam success, accounting for 37% of what determines a student&apos;s score.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Instant & Private</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Predictions appear instantly in your browser. No waiting, no server — and no student
                  data ever leaves your device.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ PREDICTOR ============ */}
        <Section id="predictor" eyebrow="Try It Now" title="Predict a Student's Score" icon={Sparkles}>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            Adjust the inputs below to match a real student&apos;s profile, or click a preset to
            instantly load a scenario. The system will predict their final exam score in real-time.
          </p>
          <Predictor />
        </Section>

        {/* ============ HOW RELIABLE ============ */}
        <Section id="reliability" eyebrow="Can You Trust It?" title="How Reliable Are the Predictions?" icon={CheckCircle2}>
          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard
              icon={Target}
              value={`${accuracyPct}%`}
              label="Accuracy"
              desc="The system correctly explains this much of why different students get different scores."
              color="indigo"
            />
            <StatCard
              icon={Activity}
              value="±5"
              label="Average Error"
              desc="On average, predictions are off by only 5 points out of 100. If it predicts 75, the real score is likely 70-80."
              color="violet"
            />
            <StatCard
              icon={CheckCircle2}
              value={`${within10}%`}
              label="Within 10 Points"
              desc="9 out of 10 predictions fall within 10 points of the student's actual exam score."
              color="amber"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <Award className="h-5 w-5 text-indigo-600" /> Tested on Unseen Data
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              These results are from 240 students the system had never seen before during training.
              It wasn&apos;t tested on data it already knew — meaning these numbers reflect real-world performance.
            </p>
          </div>
        </Section>

        {/* ============ IMPACT ============ */}
        <Section id="impact" eyebrow="Real-World Value" title="What This Means for Educators" icon={TrendingUp}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Early Warning System</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Instead of waiting for final exam results, teachers can identify at-risk students
                <strong> weeks before the exam</strong> — when there&apos;s still time to help.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-600" />
                <h3 className="font-bold text-slate-900">Targeted Intervention</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                The system shows <strong>which specific factor</strong> is hurting a student&apos;s predicted
                score — low attendance, insufficient study hours, or weak assignments — so help can be targeted.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">Scales to Any Class Size</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                A teacher with 200 students can&apos;t track each one manually. This system
                gives instant predictions for all of them — in seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Privacy First</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                All predictions happen in the browser. No student data is sent to any server —
                making it safe to use even with sensitive information.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
            <h3 className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="h-5 w-5" /> Honest Limitations
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>The system was trained on sample data. For real-world use, it should be retrained on actual student records from your institution.</span></li>
              <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>It predicts scores, not potential. A low prediction means the student needs support, not that they can&apos;t succeed.</span></li>
              <li className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>Always pair predictions with human judgment — the system is a tool, not a decision-maker.</span></li>
            </ul>
          </div>
        </Section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="mt-auto border-t border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">Student Performance Prediction System</div>
                <div className="text-xs text-slate-500">CSE Summer Training Project 2026</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5 text-indigo-500" /> {accuracyPct}% accuracy</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-violet-500" /> {stats.clean_rows.toLocaleString()} students</span>
            </div>
          </div>
          <div className="mt-4 border-t border-indigo-100 pt-4 text-center text-xs text-slate-400">
            United College of Engineering &amp; Research, Prayagraj · Dr. A.P.J. Abdul Kalam Technical University, Lucknow
          </div>
        </div>
      </footer>
      <BackToTop />
      <PrintReport eda={eda} />
    </div>
  );
}

// ---------- Helpers ----------
function Section({
  id, eyebrow, title, icon: Icon, children,
}: {
  id: string; eyebrow: string; title: string; icon: typeof Target; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{eyebrow}</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-100" },
  violet: { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-100" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-100" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-100" },
};

function HeroMetric({ icon: Icon, label, value, sub, color = "indigo" }: {
  icon: typeof Target; label: string; value: string | number; sub: string; color?: keyof typeof COLOR_MAP;
}) {
  const c = COLOR_MAP[color];
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div className="mt-2 truncate text-xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, desc, color = "indigo" }: {
  icon: typeof Target; value: string; label: string; desc: string; color?: keyof typeof COLOR_MAP;
}) {
  const c = COLOR_MAP[color];
  return (
    <div className={`rounded-2xl border ${c.border} bg-white p-5 shadow-sm`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
        <Icon className={`h-6 w-6 ${c.text}`} />
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );
}
