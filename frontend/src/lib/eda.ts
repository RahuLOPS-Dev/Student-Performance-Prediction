/**
 * Shared types for EDA + model data (loaded from /eda-data.json).
 */

export interface DistributionBin {
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface CorrelationData {
  columns: string[];
  matrix: number[][];
}

export interface BinnedScatterPoint {
  x_start: number;
  x_end: number;
  mid: number;
  mean_y: number;
  count: number;
}

export interface BoxPlotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count: number;
}

export interface BarCount {
  label: string;
  count: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelComparisonRow {
  Model: string;
  MAE: number;
  MSE: number;
  RMSE: number;
  R2_Score: number;
}

export interface DatasetStats {
  raw_rows: number;
  clean_rows: number;
  columns: number;
  duplicates_removed: number;
  missing_before: number;
  missing_after: number;
  numeric_features: number;
  categorical_features: number;
  engineered_features: number;
  describe: Record<string, Record<string, number>>;
  target_stats: {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
  };
}

export interface ScatterPoint {
  x: number;
  y: number;
  attendance: number;
  assignment_score: number;
}

export interface DiagnosticPoint {
  actual: number;
  predicted: number;
  residual: number;
}

export interface ResidualStats {
  mean_residual: number;
  std_residual: number;
  min_residual: number;
  max_residual: number;
  mean_abs_residual: number;
  within_5: number;
  within_10: number;
  n_test: number;
}

export interface Diagnostics {
  scatter: DiagnosticPoint[];
  residual_dist: DistributionBin[];
  residual_stats: ResidualStats;
}

export interface PDPCurvePoint {
  x: number;
  y: number;
}

export interface PDPCurve {
  feature: string;
  curve: PDPCurvePoint[];
  x_min: number;
  x_max: number;
  ci_low?: number[];
  ci_high?: number[];
}

export interface ICECurve {
  feature: string;
  x_min: number;
  x_max: number;
  curves: number[][]; // array of curves, each an array of y-values
}

export interface BandHeatmap {
  labels: string[];
  matrix: number[][]; // rows = predicted, cols = actual
  total: number;
}

export interface SubgroupRow {
  group: string;
  count: number;
  mae: number;
  mean_residual: number; // bias (+ = under-predict)
  mean_actual: number;
  mean_predicted: number;
}

export interface SHAPPoint {
  value: number;
  shap: number;
}

export interface SHAPFeature {
  feature: string;
  points: SHAPPoint[];
}

export interface EdaData {
  distribution: DistributionBin[];
  correlation: CorrelationData;
  scatter_studyhours_binned: BinnedScatterPoint[];
  scatter_attendance_binned: BinnedScatterPoint[];
  scatter_assignment_binned: BinnedScatterPoint[];
  scatter_points: ScatterPoint[];
  box_parental: BoxPlotData[];
  box_income: BoxPlotData[];
  bar_parental: BarCount[];
  bar_income: BarCount[];
  bar_internet: BarCount[];
  bar_job: BarCount[];
  bar_gender: BarCount[];
  feature_importances: FeatureImportance[];
  model_comparison: ModelComparisonRow[];
  dataset_stats: DatasetStats;
  baseline: Record<string, number>;
  categorical_modes: Record<string, string>;
  diagnostics: Diagnostics;
  pdp: Record<string, PDPCurve>;
  ice: Record<string, ICECurve>;
  band_heatmap: BandHeatmap;
  subgroups: Record<string, SubgroupRow[]>;
  shap: Record<string, SHAPFeature>;
}

// Human-readable feature labels
export const FEATURE_LABELS: Record<string, string> = {
  attendance: "Attendance (%)",
  study_hours_per_week: "Study Hours / Week",
  sleep_hours: "Sleep Hours / Day",
  extracurricular_hours: "Extracurricular Hours / Week",
  assignment_score: "Assignment Score",
  internal_assessment_1: "Internal Assessment 1",
  internal_assessment_2: "Internal Assessment 2",
  previous_semester_gpa: "Previous Semester GPA",
  avg_internal_score: "Avg Internal Score",
  engagement_index: "Engagement Index",
  gender_enc: "Gender",
  parental_support_enc: "Parental Support",
  family_income_level_enc: "Family Income",
  internet_access_enc: "Internet Access",
  part_time_job_enc: "Part-time Job",
};
