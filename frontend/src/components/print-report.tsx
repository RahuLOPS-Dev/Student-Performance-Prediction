import { GraduationCap, Trophy, Target, Database, FlaskConical, CheckCircle2, AlertTriangle } from "lucide-react";
import type { EdaData } from "@/lib/eda";
import { datasetStats } from "@/lib/eda-data";
import { loadModel, loadEncoders, predict } from "@/lib/model";
import { baseline, categoricalModes } from "@/lib/baseline-data";

const DEFAULT_INPUT = {
  attendance: 80, study_hours_per_week: 12, sleep_hours: 6.5, extracurricular_hours: 4,
  assignment_score: 70, internal_assessment_1: 65, internal_assessment_2: 65,
  previous_semester_gpa: 7, gender: "Male", parental_support: "Medium",
  family_income_level: "Medium", internet_access: "Yes", part_time_job: "No",
};

export function PrintReport({ eda }: { eda: EdaData }) {
  const best = [...eda.model_comparison].sort((a, b) => b.R2_Score - a.R2_Score)[0];
  const stats = datasetStats;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Compute the default (average student) prediction server-side for the report
  let samplePrediction: number | null = null;
  try {
    const model = loadModel();
    const encoders = loadEncoders();
    samplePrediction = predict(model, encoders, DEFAULT_INPUT).prediction;
  } catch { /* ignore */ }

  const top3 = eda.feature_importances.slice(0, 3);

  return (
    <div className="print-report hidden">
      <div className="mx-auto max-w-[800px] p-8 text-black">
        {/* Header */}
        <div className="border-b-2 border-black pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-600">Capstone Project 1 · CSE Summer Training Project 2026</div>
              <h1 className="mt-1 text-3xl font-bold">Student Performance Prediction System</h1>
              <div className="mt-1 text-sm text-gray-700">IIHMF, MNNIT Allahabad, Prayagraj</div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div>Report Date</div>
              <div className="font-semibold text-black">{today}</div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">1. Executive Summary</h2>
          <p className="mt-2 text-sm leading-relaxed">
            This project develops a supervised machine-learning system that predicts a student&apos;s
            final exam score (0–100) from academic, behavioral, and demographic indicators. The
            pipeline covers the full ML lifecycle — from synthetic data generation through preprocessing,
            EDA, feature engineering, multi-model training, evaluation, and client-side deployment.
          </p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Dataset size</td><td className="py-1">{stats.clean_rows.toLocaleString()} students (after dedup) · {stats.columns} features</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Best model</td><td className="py-1">{best.Model} (R² = {(best.R2_Score * 100).toFixed(2)}%, MAE = {best.MAE})</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Top predictor</td><td className="py-1">engagement_index (attendance × study hours) — {eda.feature_importances[0].importance * 100}% importance</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Deployment</td><td className="py-1">Client-side inference (300 trees reimplemented in TypeScript)</td></tr>
              <tr><td className="py-1 font-semibold">Sample prediction (average student)</td><td className="py-1">{samplePrediction !== null ? `${samplePrediction}/100` : "—"}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Methodology */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">2. Methodology</h2>
          <ol className="mt-2 space-y-1 text-sm">
            <li><strong>1. Data Generation:</strong> 1,200+ synthetic student records with realistic distributions, missing values, and duplicates.</li>
            <li><strong>2. Preprocessing:</strong> Dedup, median imputation, IQR-based outlier capping (1.5×IQR).</li>
            <li><strong>3. EDA:</strong> Univariate, bivariate, and correlation analysis.</li>
            <li><strong>4. Feature Engineering:</strong> avg_internal_score &amp; engagement_index (top predictor).</li>
            <li><strong>5. Model Building:</strong> Linear Regression, Random Forest, Gradient Boosting.</li>
            <li><strong>6. Evaluation:</strong> MAE, MSE, RMSE, R² on 20% held-out test set.</li>
            <li><strong>7. Deployment:</strong> Model exported to JSON; inference reimplemented in TypeScript.</li>
          </ol>
        </section>

        {/* Model Performance */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">3. Model Performance</h2>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-1 text-left">Model</th>
                <th className="py-1 text-right">MAE</th>
                <th className="py-1 text-right">MSE</th>
                <th className="py-1 text-right">RMSE</th>
                <th className="py-1 text-right">R² Score</th>
              </tr>
            </thead>
            <tbody>
              {[...eda.model_comparison].sort((a, b) => b.R2_Score - a.R2_Score).map((m, i) => (
                <tr key={m.Model} className="border-b border-gray-300">
                  <td className="py-1">{m.Model}{i === 0 ? " ★" : ""}</td>
                  <td className="py-1 text-right">{m.MAE.toFixed(3)}</td>
                  <td className="py-1 text-right">{m.MSE.toFixed(3)}</td>
                  <td className="py-1 text-right">{m.RMSE.toFixed(3)}</td>
                  <td className="py-1 text-right font-semibold">{(m.R2_Score * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Diagnostics */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">4. Prediction Diagnostics (Test Set)</h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Test set size</td><td className="py-1">{eda.diagnostics.residual_stats.n_test} students (20%)</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Mean residual (bias)</td><td className="py-1">{eda.diagnostics.residual_stats.mean_residual} (≈0 = unbiased)</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Std of residuals</td><td className="py-1">{eda.diagnostics.residual_stats.std_residual}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 font-semibold">Predictions within ±5 pts</td><td className="py-1">{eda.diagnostics.residual_stats.within_5}%</td></tr>
              <tr><td className="py-1 font-semibold">Predictions within ±10 pts</td><td className="py-1">{eda.diagnostics.residual_stats.within_10}%</td></tr>
            </tbody>
          </table>
        </section>

        {/* Key Findings */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">5. Key Findings</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>{best.Model}</strong> achieved the best R² of {(best.R2_Score * 100).toFixed(2)}% with MAE = {best.MAE} points.</li>
            <li>• The engineered <strong>engagement_index</strong> (attendance × study hours) was the single strongest predictor ({eda.feature_importances[0].importance * 100}%).</li>
            <li>• Top 3 features: {top3.map((f, i) => `${f.feature} (${(f.importance * 100).toFixed(1)}%)`).join(", ")}.</li>
            <li>• Ensemble methods (GBM, RF) outperformed linear regression, indicating non-linear feature interactions.</li>
            <li>• Students without internet access and with part-time jobs showed lower predicted scores — flagging equity considerations.</li>
          </ul>
        </section>

        {/* Limitations */}
        <section className="mt-5">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">6. Limitations &amp; Future Work</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Dataset is synthetic; validating on real-world data would strengthen findings.</li>
            <li>• Hyperparameter tuning via GridSearchCV could further improve R².</li>
            <li>• k-fold cross-validation would give more robust error estimates.</li>
            <li>• SHAP-based local explainability could augment the PDP global analysis.</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-300 pt-2 text-center text-[10px] text-gray-500">
          Generated by the Student Performance Prediction System · Capstone Project 1 · CSE Summer Training Project 2026
        </div>
      </div>
    </div>
  );
}
