"""
Student Performance Prediction — Full ML Pipeline
Phases: Preprocessing -> EDA -> Feature Engineering -> Model Building -> Evaluation -> Save Model
"""
import warnings
warnings.filterwarnings("ignore")

import os
import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "Dataset", "student_performance.csv")
EDA_DIR = os.path.join(BASE, "Documentation", "eda_plots")
MODEL_DIR = os.path.join(BASE, "Model")
os.makedirs(EDA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

sns.set_style("whitegrid")

# ======================= PHASE 3: DATA PREPROCESSING =======================
df = pd.read_csv(DATA_PATH)
print("Raw shape:", df.shape)

# Remove duplicates
df = df.drop_duplicates(subset=[c for c in df.columns if c != "student_id"])
print("After dedup:", df.shape)

# Handle missing values (median for numeric)
num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
for col in num_cols:
    if df[col].isna().sum() > 0:
        df[col] = df[col].fillna(df[col].median())

# Outlier treatment (IQR capping) on key numeric columns
outlier_cols = ["attendance", "study_hours_per_week", "assignment_score",
                 "internal_assessment_1", "internal_assessment_2", "final_exam_score"]
for col in outlier_cols:
    q1, q3 = df[col].quantile([0.25, 0.75])
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    df[col] = df[col].clip(lower, upper)

print("Missing values after cleaning:\n", df.isna().sum().sum())

# ======================= PHASE 4: EDA =======================
# Univariate
plt.figure(figsize=(6, 4))
sns.histplot(df["final_exam_score"], kde=True, color="steelblue")
plt.title("Distribution of Final Exam Score")
plt.tight_layout()
plt.savefig(f"{EDA_DIR}/hist_final_exam_score.png")
plt.close()

# Bivariate
plt.figure(figsize=(6, 4))
sns.scatterplot(x="study_hours_per_week", y="final_exam_score", data=df, alpha=0.5)
plt.title("Study Hours vs Final Exam Score")
plt.tight_layout()
plt.savefig(f"{EDA_DIR}/scatter_studyhours_vs_score.png")
plt.close()

plt.figure(figsize=(6, 4))
sns.boxplot(x="parental_support", y="final_exam_score", data=df)
plt.title("Final Exam Score by Parental Support")
plt.tight_layout()
plt.savefig(f"{EDA_DIR}/box_parentalsupport_vs_score.png")
plt.close()

# Correlation heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(df[num_cols].corr(), annot=True, fmt=".2f", cmap="coolwarm")
plt.title("Correlation Heatmap")
plt.tight_layout()
plt.savefig(f"{EDA_DIR}/correlation_heatmap.png")
plt.close()

print(f"EDA plots saved to {EDA_DIR}")

# ======================= PHASE 5: FEATURE ENGINEERING =======================
df["avg_internal_score"] = (df["internal_assessment_1"] + df["internal_assessment_2"]) / 2
df["engagement_index"] = (df["attendance"] / 100) * df["study_hours_per_week"]

cat_cols = ["gender", "parental_support", "family_income_level", "internet_access", "part_time_job"]
encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    df[col + "_enc"] = le.fit_transform(df[col])
    encoders[col] = le

feature_cols = [
    "attendance", "study_hours_per_week", "sleep_hours", "extracurricular_hours",
    "assignment_score", "internal_assessment_1", "internal_assessment_2",
    "previous_semester_gpa", "avg_internal_score", "engagement_index",
    "gender_enc", "parental_support_enc", "family_income_level_enc",
    "internet_access_enc", "part_time_job_enc",
]
target_col = "final_exam_score"

X = df[feature_cols]
y = df[target_col]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ======================= PHASE 6: MODEL BUILDING =======================
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(n_estimators=300, max_depth=8, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=300, learning_rate=0.05, max_depth=3, random_state=42),
}

# ======================= PHASE 7: MODEL EVALUATION =======================
results = []
trained_models = {}
for name, model in models.items():
    if name == "Linear Regression":
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, preds)

    results.append({"Model": name, "MAE": round(mae, 3), "MSE": round(mse, 3),
                     "RMSE": round(rmse, 3), "R2_Score": round(r2, 4)})
    trained_models[name] = model

results_df = pd.DataFrame(results).sort_values("R2_Score", ascending=False)
print("\n=== Model Comparison ===")
print(results_df.to_string(index=False))
results_df.to_csv(f"{BASE}/Documentation/model_comparison.csv", index=False)

# Comparative bar chart
plt.figure(figsize=(6, 4))
sns.barplot(x="Model", y="R2_Score", data=results_df, palette="viridis")
plt.title("Model Comparison — R² Score")
plt.ylim(0, 1)
plt.tight_layout()
plt.savefig(f"{EDA_DIR}/model_comparison_r2.png")
plt.close()

# ======================= SAVE BEST MODEL =======================
best_model_name = results_df.iloc[0]["Model"]
best_model = trained_models[best_model_name]
print(f"\nBest model: {best_model_name}")

with open(f"{MODEL_DIR}/best_model.pkl", "wb") as f:
    pickle.dump(best_model, f)

with open(f"{MODEL_DIR}/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

with open(f"{MODEL_DIR}/encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)

with open(f"{MODEL_DIR}/feature_cols.pkl", "wb") as f:
    pickle.dump({"feature_cols": feature_cols, "best_model_name": best_model_name}, f)

print("Model, scaler, encoders, and feature list saved to /Model")
