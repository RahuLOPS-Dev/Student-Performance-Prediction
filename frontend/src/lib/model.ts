/**
 * Gradient Boosting Regressor — pure TypeScript inference.
 * Loads the exported model.json (300 decision trees + init + learning rate)
 * and reproduces sklearn's predict() exactly.
 *
 * Formula: prediction = init_constant + learning_rate * Σ(tree.predict(X))
 * Each tree: traverse from node 0; if X[feature[node]] <= threshold[node]
 *   go children_left[node], else children_right[node]; at leaf return value[node].
 */

export interface ModelTree {
  children_left: number[];
  children_right: number[];
  feature: number[];
  threshold: number[];
  value: number[];
}

export interface ModelJson {
  best_model_name: string;
  model_type: string;
  init_constant: number;
  learning_rate: number;
  n_estimators: number;
  max_depth: number;
  feature_cols: string[];
  trees: ModelTree[];
}

export interface Encoders {
  gender: string[];
  parental_support: string[];
  family_income_level: string[];
  internet_access: string[];
  part_time_job: string[];
}

// Import the exported model + encoders directly (bundled, instant, no fetch).
import modelData from "@/data/model.json";
import encodersData from "@/data/encoders.json";

export function loadModel(): ModelJson {
  return modelData as unknown as ModelJson;
}

export function loadEncoders(): Encoders {
  return encodersData as unknown as Encoders;
}

function predictTree(tree: ModelTree, x: number[]): number {
  let node = 0;
  // traverse until leaf (children_left === -1)
  while (tree.children_left[node] !== -1) {
    const feat = tree.feature[node];
    const thresh = tree.threshold[node];
    if (x[feat] <= thresh) {
      node = tree.children_left[node];
    } else {
      node = tree.children_right[node];
    }
  }
  return tree.value[node];
}

export interface StudentInput {
  attendance: number;
  study_hours_per_week: number;
  sleep_hours: number;
  extracurricular_hours: number;
  assignment_score: number;
  internal_assessment_1: number;
  internal_assessment_2: number;
  previous_semester_gpa: number;
  gender: string;
  parental_support: string;
  family_income_level: string;
  internet_access: string;
  part_time_job: string;
}

export interface PredictionResult {
  prediction: number;
  band: "strong" | "moderate" | "at-risk";
  message: string;
  engineered_features: {
    avg_internal_score: number;
    engagement_index: number;
  };
}

export function encode(encoders: Encoders, key: keyof Encoders, value: string): number {
  const classes = encoders[key];
  const idx = classes.indexOf(value);
  if (idx === -1) {
    throw new Error(`Value "${value}" not found in encoder "${String(key)}". Classes: ${classes.join(", ")}`);
  }
  return idx;
}

export function predict(model: ModelJson, encoders: Encoders, input: StudentInput): PredictionResult {
  const avg_internal_score = (input.internal_assessment_1 + input.internal_assessment_2) / 2;
  const engagement_index = (input.attendance / 100) * input.study_hours_per_week;

  const row: Record<string, number> = {
    attendance: input.attendance,
    study_hours_per_week: input.study_hours_per_week,
    sleep_hours: input.sleep_hours,
    extracurricular_hours: input.extracurricular_hours,
    assignment_score: input.assignment_score,
    internal_assessment_1: input.internal_assessment_1,
    internal_assessment_2: input.internal_assessment_2,
    previous_semester_gpa: input.previous_semester_gpa,
    avg_internal_score,
    engagement_index,
    gender_enc: encode(encoders, "gender", input.gender),
    parental_support_enc: encode(encoders, "parental_support", input.parental_support),
    family_income_level_enc: encode(encoders, "family_income_level", input.family_income_level),
    internet_access_enc: encode(encoders, "internet_access", input.internet_access),
    part_time_job_enc: encode(encoders, "part_time_job", input.part_time_job),
  };

  const x = model.feature_cols.map((c) => row[c]);

  let pred = model.init_constant;
  for (const tree of model.trees) {
    pred += model.learning_rate * predictTree(tree, x);
  }

  pred = Math.max(0, Math.min(100, pred));
  const prediction = Math.round(pred * 10) / 10;

  let band: PredictionResult["band"];
  let message: string;
  if (prediction >= 75) {
    band = "strong";
    message = "Strong predicted performance. Keep up the consistency.";
  } else if (prediction >= 50) {
    band = "moderate";
    message = "Moderate predicted performance. Room for improvement in study hours or attendance.";
  } else {
    band = "at-risk";
    message = "At-risk prediction. Consider additional academic support.";
  }

  return {
    prediction,
    band,
    message,
    engineered_features: {
      avg_internal_score: Math.round(avg_internal_score * 100) / 100,
      engagement_index: Math.round(engagement_index * 100) / 100,
    },
  };
}

/**
 * Marginal contribution breakdown (SHAP-like waterfall).
 * For each feature, computes how much moving it from the dataset "baseline"
 * value to the user's value changes the prediction, holding others at baseline.
 *
 * `baseline` should be the dataset-mean row for all feature_cols.
 * Returns contributions in points (positive = pushes score up).
 */
export interface FeatureContribution {
  feature: string;
  label: string;
  userValue: number;
  baselineValue: number;
  contribution: number; // points (clipped to keep sum near prediction - baseline)
}

export interface BreakdownResult {
  baselinePrediction: number;
  userPrediction: number;
  totalDelta: number;
  contributions: FeatureContribution[]; // sorted by abs contribution, desc
}

// Human-readable labels for waterfall display
export const FEATURE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  study_hours_per_week: "Study Hours",
  sleep_hours: "Sleep Hours",
  extracurricular_hours: "Extracurricular",
  assignment_score: "Assignment",
  internal_assessment_1: "IA-1",
  internal_assessment_2: "IA-2",
  previous_semester_gpa: "Prev GPA",
  avg_internal_score: "Avg Internal",
  engagement_index: "Engagement",
  gender_enc: "Gender",
  parental_support_enc: "Parental Support",
  family_income_level_enc: "Family Income",
  internet_access_enc: "Internet",
  part_time_job_enc: "Part-time Job",
};

export function explainPrediction(
  model: ModelJson,
  encoders: Encoders,
  input: StudentInput,
  baseline: Record<string, number>
): BreakdownResult {
  const avg_internal_score = (input.internal_assessment_1 + input.internal_assessment_2) / 2;
  const engagement_index = (input.attendance / 100) * input.study_hours_per_week;

  const userRow: Record<string, number> = {
    attendance: input.attendance,
    study_hours_per_week: input.study_hours_per_week,
    sleep_hours: input.sleep_hours,
    extracurricular_hours: input.extracurricular_hours,
    assignment_score: input.assignment_score,
    internal_assessment_1: input.internal_assessment_1,
    internal_assessment_2: input.internal_assessment_2,
    previous_semester_gpa: input.previous_semester_gpa,
    avg_internal_score,
    engagement_index,
    gender_enc: encode(encoders, "gender", input.gender),
    parental_support_enc: encode(encoders, "parental_support", input.parental_support),
    family_income_level_enc: encode(encoders, "family_income_level", input.family_income_level),
    internet_access_enc: encode(encoders, "internet_access", input.internet_access),
    part_time_job_enc: encode(encoders, "part_time_job", input.part_time_job),
  };

  const baseX = model.feature_cols.map((c) => baseline[c]);
  const userX = model.feature_cols.map((c) => userRow[c]);

  const rawPredict = (x: number[]): number => {
    let p = model.init_constant;
    for (const tree of model.trees) p += model.learning_rate * predictTree(tree, x);
    return p;
  };

  const baselinePrediction = Math.max(0, Math.min(100, rawPredict(baseX)));
  const userPrediction = Math.max(0, Math.min(100, rawPredict(userX)));

  // Marginal contribution per feature: replace baseline[i] with user[i], measure delta
  const contributions: FeatureContribution[] = model.feature_cols.map((feat, i) => {
    const xWithI = baseX.slice();
    xWithI[i] = userX[i];
    const predWithI = Math.max(0, Math.min(100, rawPredict(xWithI)));
    return {
      feature: feat,
      label: FEATURE_LABELS[feat] ?? feat.replace(/_enc$/, ""),
      userValue: userX[i],
      baselineValue: baseX[i],
      contribution: Math.round((predWithI - baselinePrediction) * 10) / 10,
    };
  });

  // Sort by absolute contribution, desc; keep top 8 for display
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    baselinePrediction: Math.round(baselinePrediction * 10) / 10,
    userPrediction: Math.round(userPrediction * 10) / 10,
    totalDelta: Math.round((userPrediction - baselinePrediction) * 10) / 10,
    contributions,
  };
}
