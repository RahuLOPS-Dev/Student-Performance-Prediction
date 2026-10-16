"""
Export the trained Gradient Boosting model + all EDA/model data to JSON
so the Next.js app can run predictions entirely client-side (no separate
Python service required — more robust for demos).
"""
import os
import json
import pickle
import warnings

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd

# Resolve paths relative to the new folder structure:
#   ai-ml/scripts/export_model.py  →  BASE = ai-ml/  (model artifacts, dataset, docs)
#   PUBLIC_DIR = frontend/public   (consumed by the Next.js app)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))          # ai-ml/
MODEL_DIR = os.path.join(BASE, "Model")
DATA_PATH = os.path.join(BASE, "Dataset", "student_performance.csv")
MODEL_COMPARISON_PATH = os.path.join(BASE, "Documentation", "model_comparison.csv")
PUBLIC_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "frontend", "public"))

os.makedirs(PUBLIC_DIR, exist_ok=True)

# ---------- Load ----------
with open(os.path.join(MODEL_DIR, "best_model.pkl"), "rb") as f:
    model = pickle.load(f)
with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)
with open(os.path.join(MODEL_DIR, "encoders.pkl"), "rb") as f:
    encoders = pickle.load(f)
with open(os.path.join(MODEL_DIR, "feature_cols.pkl"), "rb") as f:
    meta = pickle.load(f)

feature_cols = meta["feature_cols"]
best_model_name = meta["best_model_name"]
df_raw = pd.read_csv(DATA_PATH)


# ---------- Preprocess (mirror pipeline.py) ----------
def preprocess(df):
    df = df.drop_duplicates(subset=[c for c in df.columns if c != "student_id"]).copy()
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in num_cols:
        if df[col].isna().sum() > 0:
            df[col] = df[col].fillna(df[col].median())
    outlier_cols = ["attendance", "study_hours_per_week", "assignment_score",
                    "internal_assessment_1", "internal_assessment_2", "final_exam_score"]
    for col in outlier_cols:
        q1, q3 = df[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        df[col] = df[col].clip(lower, upper)
    df["avg_internal_score"] = (df["internal_assessment_1"] + df["internal_assessment_2"]) / 2
    df["engagement_index"] = (df["attendance"] / 100) * df["study_hours_per_week"]
    # Label-encode categoricals (using the same encoders saved by pipeline.py)
    cat_cols = ["gender", "parental_support", "family_income_level", "internet_access", "part_time_job"]
    for col in cat_cols:
        df[col + "_enc"] = encoders[col].transform(df[col])
    return df

df = preprocess(df_raw)


def fnum(x):
    if isinstance(x, (np.floating, np.integer)):
        return float(x)
    return x


# ---------- Export MODEL ----------
trees = []
for est_row in model.estimators_:
    est = est_row[0]
    t = est.tree_
    trees.append({
        "children_left": t.children_left.astype(int).tolist(),
        "children_right": t.children_right.astype(int).tolist(),
        "feature": t.feature.astype(int).tolist(),
        "threshold": [float(x) for x in t.threshold],
        "value": [float(v) for v in t.value.ravel()],
    })

model_json = {
    "best_model_name": best_model_name,
    "model_type": type(model).__name__,
    "init_constant": float(model.init_.constant_[0][0]),
    "learning_rate": float(model.learning_rate),
    "n_estimators": int(model.n_estimators),
    "max_depth": int(model.max_depth),
    "feature_cols": feature_cols,
    "trees": trees,
}

with open(os.path.join(PUBLIC_DIR, "model.json"), "w") as f:
    json.dump(model_json, f)
print(f"model.json: {len(trees)} trees, {os.path.getsize(os.path.join(PUBLIC_DIR, 'model.json'))//1024} KB")


# ---------- Export ENCODERS ----------
encoders_json = {
    k: list(v.classes_) for k, v in encoders.items()
}
with open(os.path.join(PUBLIC_DIR, "encoders.json"), "w") as f:
    json.dump(encoders_json, f)
print("encoders.json written")


# ---------- EDA data ----------
numeric_cols = ["attendance", "study_hours_per_week", "sleep_hours", "extracurricular_hours",
                "assignment_score", "internal_assessment_1", "internal_assessment_2",
                "previous_semester_gpa", "avg_internal_score", "engagement_index",
                "final_exam_score"]

# Distribution
counts, edges = np.histogram(df["final_exam_score"], bins=20)
distribution = [
    {"bin_start": round(float(edges[i]), 2), "bin_end": round(float(edges[i + 1]), 2), "count": int(counts[i])}
    for i in range(len(counts))
]

# Correlation
corr = df[numeric_cols].corr().round(3)
correlation = {
    "columns": numeric_cols,
    "matrix": corr.values.tolist(),
}

# Binned scatters
def binned_scatter(x_col, y_col, n_bins=12):
    s = df[[x_col, y_col]].dropna()
    s["bucket"] = pd.cut(s[x_col], bins=n_bins)
    g = s.groupby("bucket", observed=True)[y_col].agg(["mean", "count"]).reset_index()
    out = []
    for _, r in g.iterrows():
        interval = r["bucket"]
        out.append({
            "x_start": round(float(interval.left), 2),
            "x_end": round(float(interval.right), 2),
            "mid": round(float((interval.left + interval.right) / 2), 2),
            "mean_y": round(float(r["mean"]), 2),
            "count": int(r["count"]),
        })
    return out

# Box plots
def box_plot(cat_col, y_col="final_exam_score"):
    out = []
    for level in ["Low", "Medium", "High"]:
        sub = df[df[cat_col] == level][y_col]
        if len(sub) == 0:
            continue
        q1, med, q3 = sub.quantile([0.25, 0.5, 0.75])
        out.append({
            "category": level,
            "min": round(float(sub.min()), 2),
            "q1": round(float(q1), 2),
            "median": round(float(med), 2),
            "q3": round(float(q3), 2),
            "max": round(float(sub.max()), 2),
            "mean": round(float(sub.mean()), 2),
            "count": int(len(sub)),
        })
    return out

# Bars
def bar_counts(cat_col):
    vc = df[cat_col].value_counts()
    return [{"label": str(k), "count": int(v)} for k, v in vc.items()]

# Feature importances
try:
    importances = [
        {"feature": c, "importance": round(float(imp), 4)}
        for c, imp in sorted(zip(feature_cols, model.feature_importances_), key=lambda x: -x[1])
    ]
except AttributeError:
    coefs = np.abs(model.coef_)
    importances = [
        {"feature": c, "importance": round(float(imp), 4)}
        for c, imp in sorted(zip(feature_cols, coefs), key=lambda x: -x[1])
    ]

# Model comparison
model_comparison = pd.read_csv(MODEL_COMPARISON_PATH).to_dict(orient="records")

# Dataset describe
describe = df[numeric_cols].describe().round(3)
dataset_stats = {
    "raw_rows": int(df_raw.shape[0]),
    "clean_rows": int(df.shape[0]),
    "columns": int(df_raw.shape[1]),
    "duplicates_removed": int(df_raw.shape[0] - df.shape[0]),
    "missing_before": int(df_raw.isna().sum().sum()),
    "missing_after": int(df.isna().sum().sum()),
    "numeric_features": len(numeric_cols) - 1,
    "categorical_features": 5,
    "engineered_features": 2,
    "describe": {
        col: {stat: fnum(describe.loc[stat, col]) for stat in describe.index}
        for col in describe.columns
    },
    "target_stats": {
        "mean": round(float(df["final_exam_score"].mean()), 2),
        "std": round(float(df["final_exam_score"].std()), 2),
        "min": round(float(df["final_exam_score"].min()), 2),
        "max": round(float(df["final_exam_score"].max()), 2),
        "median": round(float(df["final_exam_score"].median()), 2),
    },
}

# Scatter samples (raw points for visual scatter, downsampled)
sample_df = df[["study_hours_per_week", "final_exam_score", "attendance", "assignment_score"]].sample(min(300, len(df)), random_state=42)
scatter_points = [
    {"x": float(r.study_hours_per_week), "y": float(r.final_exam_score),
     "attendance": float(r.attendance), "assignment_score": float(r.assignment_score)}
    for r in sample_df.itertuples()
]

eda = {
    "distribution": distribution,
    "correlation": correlation,
    "scatter_studyhours_binned": binned_scatter("study_hours_per_week", "final_exam_score", 12),
    "scatter_attendance_binned": binned_scatter("attendance", "final_exam_score", 12),
    "scatter_assignment_binned": binned_scatter("assignment_score", "final_exam_score", 12),
    "scatter_points": scatter_points,
    "box_parental": box_plot("parental_support"),
    "box_income": box_plot("family_income_level"),
    "bar_parental": bar_counts("parental_support"),
    "bar_income": bar_counts("family_income_level"),
    "bar_internet": bar_counts("internet_access"),
    "bar_job": bar_counts("part_time_job"),
    "bar_gender": bar_counts("gender"),
    "feature_importances": importances,
    "model_comparison": model_comparison,
    "dataset_stats": dataset_stats,
    # Baseline row = dataset means across ALL 15 model feature_cols (incl. encoded categoricals).
    # Used by the client-side explainability waterfall.
    "baseline": {col: round(float(df[col].mean()), 4) for col in feature_cols},
    # Mode (most frequent) categorical values for human-readable baseline labels
    "categorical_modes": {col: str(df[col].mode().iloc[0]) for col in
                          ["gender", "parental_support", "family_income_level", "internet_access", "part_time_job"]},
}

# ---------- MODEL DIAGNOSTICS: test-set actual vs predicted + residuals ----------
# Replicate the exact train/test split from pipeline.py (test_size=0.2, random_state=42)
from sklearn.model_selection import train_test_split as _tts
X_full = df[feature_cols]
y_full = df["final_exam_score"]
_xtr, X_test, _ytr, y_test = _tts(X_full, y_full, test_size=0.2, random_state=42)
y_pred_test = model.predict(X_test)
residuals = y_test.values - y_pred_test

# Downsample for the scatter plot (keep all 240 is fine, but cap for safety)
n_diag = min(240, len(y_test))
diag_idx = np.linspace(0, len(y_test) - 1, n_diag).astype(int)
diag_points = [
    {"actual": round(float(y_test.iloc[i]), 2), "predicted": round(float(y_pred_test[i]), 2),
     "residual": round(float(residuals[i]), 2)}
    for i in diag_idx
]
# Residual distribution (histogram bins)
res_counts, res_edges = np.histogram(residuals, bins=20)
residual_dist = [
    {"bin_start": round(float(res_edges[i]), 2), "bin_end": round(float(res_edges[i + 1]), 2), "count": int(res_counts[i])}
    for i in range(len(res_counts))
]
# Residual stats
residual_stats = {
    "mean_residual": round(float(np.mean(residuals)), 4),
    "std_residual": round(float(np.std(residuals)), 4),
    "min_residual": round(float(np.min(residuals)), 2),
    "max_residual": round(float(np.max(residuals)), 2),
    "mean_abs_residual": round(float(np.mean(np.abs(residuals))), 4),
    "within_5": round(float(np.mean(np.abs(residuals) <= 5) * 100), 1),  # % within ±5 pts
    "within_10": round(float(np.mean(np.abs(residuals) <= 10) * 100), 1),
    "n_test": int(len(y_test)),
}

eda["diagnostics"] = {
    "scatter": diag_points,
    "residual_dist": residual_dist,
    "residual_stats": residual_stats,
}

# ---------- PARTIAL DEPENDENCE (PDP) for top features ----------
# Sweep each feature across its observed range, holding all others at baseline (mean).
baseline_row = {c: float(df[c].mean()) for c in feature_cols}

def pdp_for(feature, n_points=40):
    lo = float(df[feature].min())
    hi = float(df[feature].max())
    grid = np.linspace(lo, hi, n_points)
    out = []
    for v in grid:
        row = baseline_row.copy()
        row[feature] = float(v)
        x_vec = np.array([[row[c] for c in feature_cols]], dtype=np.float32)
        pred = float(np.clip(model.predict(x_vec)[0], 0, 100))
        out.append({"x": round(v, 3), "y": round(pred, 2)})
    return out, lo, hi

pdp_features = ["engagement_index", "assignment_score", "avg_internal_score",
                "study_hours_per_week", "attendance", "previous_semester_gpa"]
pdp_data = {}
for feat in pdp_features:
    curve, lo, hi = pdp_for(feat)
    pdp_data[feat] = {"feature": feat, "curve": curve, "x_min": round(lo, 2), "x_max": round(hi, 2)}

# ---------- Bootstrap CIs on PDP (resample training rows, refit, re-predict) ----------
# We resample the training set B times, refit a GBM each time, and predict on the
# baseline+sweep grid. The 5th/95th percentiles give an 90% CI band.
B = 12  # bootstrap iterations (kept small for export speed)
print(f"  Bootstrapping {B} PDP CIs...")
# reuse the train split from diagnostics section
_xtr_full, _xte_full, _ytr_full, _yte_full = _tts(X_full, y_full, test_size=0.2, random_state=42)
from sklearn.ensemble import GradientBoostingRegressor as _GBR
# Use a smaller model for bootstrap to keep export fast (still captures variance shape)
gbm_params = dict(n_estimators=80, learning_rate=0.1, max_depth=3, random_state=42)
pdp_ci = {}
for feat in pdp_features:
    lo = float(df[feat].min())
    hi = float(df[feat].max())
    grid = np.linspace(lo, hi, 40)
    boot_preds = []  # shape (B, 40)
    for b in range(B):
        idx = np.random.choice(len(_xtr_full), size=len(_xtr_full), replace=True)
        xb = _xtr_full.iloc[idx]
        yb = _ytr_full.iloc[idx]
        m = _GBR(**gbm_params).fit(xb, yb)
        row_base = {c: float(df[c].mean()) for c in feature_cols}
        preds = []
        for v in grid:
            row = row_base.copy()
            row[feat] = float(v)
            xv = np.array([[row[c] for c in feature_cols]], dtype=np.float32)
            preds.append(float(np.clip(m.predict(xv)[0], 0, 100)))
        boot_preds.append(preds)
    boot_arr = np.array(boot_preds)  # (B, 40)
    ci_low = np.percentile(boot_arr, 5, axis=0)
    ci_high = np.percentile(boot_arr, 95, axis=0)
    pdp_ci[feat] = {
        "feature": feat,
        "ci_low": [round(float(v), 2) for v in ci_low],
        "ci_high": [round(float(v), 2) for v in ci_high],
    }
    pdp_data[feat]["ci_low"] = pdp_ci[feat]["ci_low"]
    pdp_data[feat]["ci_high"] = pdp_ci[feat]["ci_high"]

# ---------- ICE curves (Individual Conditional Expectation) ----------
# For each feature, pick a sample of real students and trace their individual
# prediction curve as the feature is swept. Shows heterogeneity that PDP averages out.
ICE_SAMPLE = 30  # number of students to trace
ice_features = ["engagement_index", "assignment_score", "study_hours_per_week", "attendance"]
sample_students = df[feature_cols].sample(ICE_SAMPLE, random_state=42).to_dict(orient="records")
ice_data = {}
for feat in ice_features:
    lo = float(df[feat].min())
    hi = float(df[feat].max())
    grid = np.linspace(lo, hi, 40)
    curves = []
    for student in sample_students:
        row = {c: float(student[c]) for c in feature_cols}
        curve = []
        for v in grid:
            row[feat] = float(v)
            xv = np.array([[row[c] for c in feature_cols]], dtype=np.float32)
            curve.append(round(float(np.clip(model.predict(xv)[0], 0, 100)), 2))
        curves.append(curve)
    ice_data[feat] = {
        "feature": feat,
        "x_min": round(lo, 2),
        "x_max": round(hi, 2),
        "curves": curves,  # array of arrays (30 curves x 40 points)
    }

eda["pdp"] = pdp_data
eda["ice"] = ice_data

# ---------- Score-band accuracy heatmap (predicted vs actual, binned) ----------
# Grid: predicted bins (rows) x actual bins (cols), cell = count.
# Diagonal = correct band; off-diagonal shows systematic over/under-prediction.
pred_all = model.predict(X_full)
act_all = y_full.values
band_edges = [30, 40, 50, 60, 70, 80, 90, 100.01]
band_labels = ["30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90-100"]
heat = np.zeros((len(band_labels), len(band_labels)), dtype=int)
for p, a in zip(pred_all, act_all):
    pi = min(len(band_labels) - 1, int((p - 30) // 10))
    ai = min(len(band_labels) - 1, int((a - 30) // 10))
    if 0 <= pi < len(band_labels) and 0 <= ai < len(band_labels):
        heat[pi][ai] += 1
eda["band_heatmap"] = {
    "labels": band_labels,
    "matrix": heat.tolist(),  # rows = predicted, cols = actual
    "total": int(heat.sum()),
}

# ---------- Subgroup fairness analysis ----------
# For each categorical subgroup (gender, parental_support, income, internet, job),
# compute MAE, mean residual (bias), and count on the FULL dataset predictions.
subgroup_cols = ["gender", "parental_support", "family_income_level",
                 "internet_access", "part_time_job"]
subgroups = {}
for col in subgroup_cols:
    levels = sorted(df[col].unique())
    rows = []
    for level in levels:
        mask = (df[col] == level).values
        if mask.sum() == 0:
            continue
        sub_pred = pred_all[mask]
        sub_act = act_all[mask]
        sub_res = sub_act - sub_pred
        rows.append({
            "group": str(level),
            "count": int(mask.sum()),
            "mae": round(float(np.mean(np.abs(sub_res))), 3),
            "mean_residual": round(float(np.mean(sub_res)), 3),  # bias (+ = under-predict)
            "mean_actual": round(float(np.mean(sub_act)), 2),
            "mean_predicted": round(float(np.mean(sub_pred)), 2),
        })
    subgroups[col] = rows
eda["subgroups"] = subgroups

# ---------- SHAP-like global feature contributions (beeswarm data) ----------
# For each student, compute the marginal contribution of each feature (vs baseline mean).
# Sample ~150 students, keep top 6 features, output (feature_value, contribution) pairs
# colored by whether the feature is high/low. This produces a beeswarm-style summary.
shap_sample = 150
shap_idx = np.random.RandomState(42).choice(len(df), size=min(shap_sample, len(df)), replace=False)
shap_features = ["engagement_index", "assignment_score", "avg_internal_score",
                 "study_hours_per_week", "previous_semester_gpa", "attendance"]
shap_data = {}
for feat in shap_features:
    feat_pos = feature_cols.index(feat)
    points = []
    for si in shap_idx:
        row_actual = {c: float(df.iloc[si][c]) for c in feature_cols}
        # baseline = dataset mean
        row_base = baseline_row.copy()
        # contribution = predict(with this one feature = actual) - predict(baseline)
        x_base = np.array([[row_base[c] for c in feature_cols]], dtype=np.float32)
        pred_base = float(np.clip(model.predict(x_base)[0], 0, 100))
        x_one = np.array([[row_base[c] if j != feat_pos else row_actual[feat] for j, c in enumerate(feature_cols)]], dtype=np.float32)
        pred_one = float(np.clip(model.predict(x_one)[0], 0, 100))
        contrib = round(pred_one - pred_base, 2)
        feat_val = round(float(df.iloc[si][feat]), 3)
        points.append({"value": feat_val, "shap": contrib})
    shap_data[feat] = {"feature": feat, "points": points}

eda["shap"] = shap_data

with open(os.path.join(PUBLIC_DIR, "eda-data.json"), "w") as f:
    json.dump(eda, f)
print(f"eda-data.json: {os.path.getsize(os.path.join(PUBLIC_DIR, 'eda-data.json'))//1024} KB")

# Copy EDA plot images to public/ for display
import shutil
eda_plots_src = os.path.join(BASE, "Documentation", "eda_plots")
eda_plots_dst = os.path.join(PUBLIC_DIR, "eda-plots")
os.makedirs(eda_plots_dst, exist_ok=True)
copied = 0
for fn in os.listdir(eda_plots_src):
    if fn.endswith(".png"):
        shutil.copy(os.path.join(eda_plots_src, fn), os.path.join(eda_plots_dst, fn))
        copied += 1
print(f"eda-plots: copied {copied} images")

print("\nAll exports complete.")
