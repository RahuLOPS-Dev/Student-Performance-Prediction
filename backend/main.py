"""
Student Performance Prediction — Model Serving API (FastAPI)
Loads the trained Gradient Boosting model + EDA artifacts and exposes
endpoints for prediction, model info, dataset stats, and EDA data.
Runs on port 8001.
"""
import os
import pickle
import warnings
from typing import List, Optional

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Resolve paths relative to the new folder structure:
#   backend/main.py  →  BASE_PROJECT = ai-ml/  (model artifacts, dataset, docs)
BASE_PROJECT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-ml"))
MODEL_DIR = os.path.join(BASE_PROJECT, "Model")
DATA_PATH = os.path.join(BASE_PROJECT, "Dataset", "student_performance.csv")
MODEL_COMPARISON_PATH = os.path.join(BASE_PROJECT, "Documentation", "model_comparison.csv")

# ---------- Load artifacts ----------
with open(os.path.join(MODEL_DIR, "best_model.pkl"), "rb") as f:
    MODEL = pickle.load(f)
with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
    SCALER = pickle.load(f)
with open(os.path.join(MODEL_DIR, "encoders.pkl"), "rb") as f:
    ENCODERS = pickle.load(f)
with open(os.path.join(MODEL_DIR, "feature_cols.pkl"), "rb") as f:
    META = pickle.load(f)

FEATURE_COLS = META["feature_cols"]
BEST_MODEL_NAME = META["best_model_name"]
DF_RAW = pd.read_csv(DATA_PATH)

# ---------- Preprocess a copy for EDA (mirror pipeline.py) ----------
def preprocess(df: pd.DataFrame) -> pd.DataFrame:
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
    return df

DF_CLEAN = preprocess(DF_RAW)

# ---------- Precompute EDA payloads ----------
def _round_float(x, n=4):
    if isinstance(x, (np.floating, np.integer)):
        return round(float(x), n)
    return x

def build_distribution(series: pd.Series, bins=20):
    counts, edges = np.histogram(series, bins=bins)
    return [
        {"bin_start": round(float(edges[i]), 2), "bin_end": round(float(edges[i + 1]), 2), "count": int(counts[i])}
        for i in range(len(counts))
    ]

NUMERIC_COLS = ["attendance", "study_hours_per_week", "sleep_hours", "extracurricular_hours",
                "assignment_score", "internal_assessment_1", "internal_assessment_2",
                "previous_semester_gpa", "avg_internal_score", "engagement_index",
                "final_exam_score"]

CORR_MATRIX = DF_CLEAN[NUMERIC_COLS].corr().round(3)

DISTRIBUTION = build_distribution(DF_CLEAN["final_exam_score"], bins=20)

# Binned scatter: avg score per study-hour bucket
def build_scatter_binned(x_col, y_col, n_bins=12):
    s = DF_CLEAN[[x_col, y_col]].dropna()
    s["bucket"] = pd.cut(s[x_col], bins=n_bins)
    g = s.groupby("bucket", observed=True)[y_col].agg(["mean", "count"]).reset_index()
    out = []
    for _, r in g.iterrows():
        interval = r["bucket"]
        out.append({
            "x_start": round(float(interval.left), 2),
            "x_end": round(float(interval.right), 2),
            "mean_y": round(float(r["mean"]), 2),
            "count": int(r["count"]),
        })
    return out

SCATTER_STUDYHOURS = build_scatter_binned("study_hours_per_week", "final_exam_score", 12)
SCATTER_ATTENDANCE = build_scatter_binned("attendance", "final_exam_score", 12)
SCATTER_ASSIGNMENT = build_scatter_binned("assignment_score", "final_exam_score", 12)

def build_box(cat_col, y_col="final_exam_score"):
    out = []
    for level in ["Low", "Medium", "High"]:
        sub = DF_CLEAN[DF_CLEAN[cat_col] == y_col.replace("final_exam_score", "final_exam_score")][y_col] if False else DF_CLEAN[DF_CLEAN[cat_col] == level][y_col]
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

BOX_PARENTAL = build_box("parental_support")
BOX_INCOME = build_box("family_income_level")

def build_bar(cat_col):
    vc = DF_CLEAN[cat_col].value_counts()
    return [{"label": str(k), "count": int(v)} for k, v in vc.items()]

BAR_PARENTAL = build_bar("parental_support")
BAR_INCOME = build_bar("family_income_level")
BAR_INTERNET = build_bar("internet_access")
BAR_JOB = build_bar("part_time_job")
BAR_GENDER = build_bar("gender")

# Feature importances (if available)
try:
    IMPORTANCES = [
        {"feature": c, "importance": round(float(imp), 4)}
        for c, imp in sorted(zip(FEATURE_COLS, MODEL.feature_importances_), key=lambda x: -x[1])
    ]
except AttributeError:
    # LinearRegression has coef_
    coefs = np.abs(MODEL.coef_)
    IMPORTANCES = [
        {"feature": c, "importance": round(float(imp), 4)}
        for c, imp in sorted(zip(FEATURE_COLS, coefs), key=lambda x: -x[1])
    ]

# Model comparison
MODEL_COMPARISON = pd.read_csv(MODEL_COMPARISON_PATH).to_dict(orient="records")

# Dataset stats
DESCRIBE = DF_CLEAN[NUMERIC_COLS].describe().round(3)
DATASET_STATS = {
    "raw_rows": int(DF_RAW.shape[0]),
    "clean_rows": int(DF_CLEAN.shape[0]),
    "columns": int(DF_RAW.shape[1]),
    "duplicates_removed": int(DF_RAW.shape[0] - DF_CLEAN.shape[0]),
    "missing_before": int(DF_RAW.isna().sum().sum()),
    "missing_after": int(DF_CLEAN.isna().sum().sum()),
    "numeric_features": int(len(NUMERIC_COLS) - 1),
    "categorical_features": 5,
    "engineered_features": 2,
    "describe": {
        col: {
            stat: _round_float(DESCRIBE.loc[stat, col])
            for stat in DESCRIBE.index
        }
        for col in DESCRIBE.columns
    },
    "target_stats": {
        "mean": round(float(DF_CLEAN["final_exam_score"].mean()), 2),
        "std": round(float(DF_CLEAN["final_exam_score"].std()), 2),
        "min": round(float(DF_CLEAN["final_exam_score"].min()), 2),
        "max": round(float(DF_CLEAN["final_exam_score"].max()), 2),
        "median": round(float(DF_CLEAN["final_exam_score"].median()), 2),
    },
}

MODEL_INFO = {
    "best_model_name": BEST_MODEL_NAME,
    "model_type": type(MODEL).__name__,
    "feature_cols": FEATURE_COLS,
    "encoder_classes": {k: list(v.classes_) for k, v in ENCODERS.items()},
    "feature_importances": IMPORTANCES,
    "n_features": len(FEATURE_COLS),
    "scaler": type(SCALER).__name__,
}

# ---------- FastAPI app ----------
app = FastAPI(title="Student Performance Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    attendance: float
    study_hours_per_week: float
    sleep_hours: float
    extracurricular_hours: float
    assignment_score: float
    internal_assessment_1: float
    internal_assessment_2: float
    previous_semester_gpa: float
    gender: str
    parental_support: str
    family_income_level: str
    internet_access: str
    part_time_job: str


@app.get("/api/health")
def health():
    return {"status": "ok", "model": BEST_MODEL_NAME}


@app.get("/api/model-info")
def model_info():
    return MODEL_INFO


@app.get("/api/dataset-stats")
def dataset_stats():
    return DATASET_STATS


@app.get("/api/model-comparison")
def model_comparison():
    return {"models": MODEL_COMPARISON}


@app.get("/api/eda")
def eda():
    return {
        "distribution": DISTRIBUTION,
        "correlation": {
            "columns": NUMERIC_COLS,
            "matrix": CORR_MATRIX.values.tolist(),
        },
        "scatter_studyhours": SCATTER_STUDYHOURS,
        "scatter_attendance": SCATTER_ATTENDANCE,
        "scatter_assignment": SCATTER_ASSIGNMENT,
        "box_parental": BOX_PARENTAL,
        "box_income": BOX_INCOME,
        "bar_parental": BAR_PARENTAL,
        "bar_income": BAR_INCOME,
        "bar_internet": BAR_INTERNET,
        "bar_job": BAR_JOB,
        "bar_gender": BAR_GENDER,
        "feature_importances": IMPORTANCES,
    }


@app.post("/api/predict")
def predict(req: PredictRequest):
    avg_internal_score = (req.internal_assessment_1 + req.internal_assessment_2) / 2
    engagement_index = (req.attendance / 100) * req.study_hours_per_week

    row = {
        "attendance": req.attendance,
        "study_hours_per_week": req.study_hours_per_week,
        "sleep_hours": req.sleep_hours,
        "extracurricular_hours": req.extracurricular_hours,
        "assignment_score": req.assignment_score,
        "internal_assessment_1": req.internal_assessment_1,
        "internal_assessment_2": req.internal_assessment_2,
        "previous_semester_gpa": req.previous_semester_gpa,
        "avg_internal_score": avg_internal_score,
        "engagement_index": engagement_index,
        "gender_enc": int(ENCODERS["gender"].transform([req.gender])[0]),
        "parental_support_enc": int(ENCODERS["parental_support"].transform([req.parental_support])[0]),
        "family_income_level_enc": int(ENCODERS["family_income_level"].transform([req.family_income_level])[0]),
        "internet_access_enc": int(ENCODERS["internet_access"].transform([req.internet_access])[0]),
        "part_time_job_enc": int(ENCODERS["part_time_job"].transform([req.part_time_job])[0]),
    }
    X_input = pd.DataFrame([row])[FEATURE_COLS]

    if BEST_MODEL_NAME == "Linear Regression":
        X_input_final = SCALER.transform(X_input)
    else:
        X_input_final = X_input

    pred = float(np.clip(MODEL.predict(X_input_final)[0], 0, 100))

    if pred >= 75:
        band = "strong"
        message = "Strong predicted performance. Keep up the consistency."
    elif pred >= 50:
        band = "moderate"
        message = "Moderate predicted performance. Room for improvement in study hours or attendance."
    else:
        band = "at-risk"
        message = "At-risk prediction. Consider additional academic support."

    # Top contributing factors (based on engineered features relative to dataset means)
    means = DF_CLEAN[["attendance", "study_hours_per_week", "assignment_score",
                      "previous_semester_gpa", "avg_internal_score", "engagement_index"]].mean()
    factors = []
    checks = [
        ("Attendance", req.attendance, means["attendance"], "higher is better"),
        ("Study Hours / Week", req.study_hours_per_week, means["study_hours_per_week"], "higher is better"),
        ("Assignment Score", req.assignment_score, means["assignment_score"], "higher is better"),
        ("Previous GPA", req.previous_semester_gpa, means["previous_semester_gpa"], "higher is better"),
        ("Engagement Index", round(engagement_index, 2), means["engagement_index"], "higher is better"),
    ]
    for label, val, mean_val, note in checks:
        diff = round(float(val) - float(mean_val), 2)
        factors.append({"label": label, "value": round(float(val), 2), "dataset_mean": round(float(mean_val), 2), "diff": diff, "note": note})

    return {
        "prediction": round(pred, 1),
        "band": band,
        "message": message,
        "engineered_features": {
            "avg_internal_score": round(avg_internal_score, 2),
            "engagement_index": round(engagement_index, 2),
        },
        "factors": factors,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
