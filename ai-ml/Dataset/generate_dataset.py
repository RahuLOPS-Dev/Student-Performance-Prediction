"""
Generates a realistic synthetic dataset for the Student Performance Prediction project.
Simulates attendance, assignment scores, internal assessments, study hours, and other
academic/behavioral indicators, with a final exam score as the target variable.
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 1200

# ---- Core indicators ----
attendance = np.clip(np.random.normal(78, 12, N), 40, 100)
study_hours_per_week = np.clip(np.random.normal(12, 5, N), 0, 35)
assignment_score = np.clip(np.random.normal(72, 15, N), 0, 100)
internal_assessment_1 = np.clip(np.random.normal(68, 14, N), 0, 100)
internal_assessment_2 = np.clip(np.random.normal(70, 14, N), 0, 100)
previous_semester_gpa = np.clip(np.random.normal(6.8, 1.3, N), 0, 10)

# ---- Behavioral / demographic indicators ----
sleep_hours = np.clip(np.random.normal(6.5, 1.2, N), 3, 10)
extracurricular_hours = np.clip(np.random.normal(4, 3, N), 0, 15)
parental_support = np.random.choice(["Low", "Medium", "High"], N, p=[0.2, 0.5, 0.3])
family_income_level = np.random.choice(["Low", "Medium", "High"], N, p=[0.3, 0.5, 0.2])
internet_access = np.random.choice(["Yes", "No"], N, p=[0.85, 0.15])
part_time_job = np.random.choice(["Yes", "No"], N, p=[0.25, 0.75])
gender = np.random.choice(["Male", "Female"], N, p=[0.55, 0.45])

support_map = {"Low": -3, "Medium": 0, "High": 3}
income_map = {"Low": -1, "Medium": 0, "High": 1.5}

# ---- Target: Final Exam Score (weighted combination + noise) ----
final_exam_score = (
    0.28 * assignment_score
    + 0.22 * internal_assessment_1
    + 0.20 * internal_assessment_2
    + 0.15 * attendance
    + 1.2 * study_hours_per_week
    + 2.0 * previous_semester_gpa
    + np.vectorize(support_map.get)(parental_support)
    + np.vectorize(income_map.get)(family_income_level)
    + np.where(internet_access == "No", -4, 0)
    + np.where(part_time_job == "Yes", -3, 0)
    + np.where(sleep_hours < 5, -3, 0)
    - 15
    + np.random.normal(0, 6, N)
)
final_exam_score = np.clip(final_exam_score, 0, 100)

df = pd.DataFrame({
    "student_id": [f"STU{1000+i}" for i in range(N)],
    "gender": gender,
    "attendance": attendance.round(1),
    "study_hours_per_week": study_hours_per_week.round(1),
    "sleep_hours": sleep_hours.round(1),
    "extracurricular_hours": extracurricular_hours.round(1),
    "assignment_score": assignment_score.round(1),
    "internal_assessment_1": internal_assessment_1.round(1),
    "internal_assessment_2": internal_assessment_2.round(1),
    "previous_semester_gpa": previous_semester_gpa.round(2),
    "parental_support": parental_support,
    "family_income_level": family_income_level,
    "internet_access": internet_access,
    "part_time_job": part_time_job,
    "final_exam_score": final_exam_score.round(1),
})

# Inject some missing values and duplicates to make preprocessing meaningful
missing_idx = np.random.choice(df.index, 40, replace=False)
df.loc[missing_idx, "sleep_hours"] = np.nan
missing_idx2 = np.random.choice(df.index, 25, replace=False)
df.loc[missing_idx2, "internal_assessment_2"] = np.nan
df = pd.concat([df, df.sample(15, random_state=1)], ignore_index=True)

df.to_csv("student_performance.csv", index=False)
print(f"Dataset generated: {df.shape[0]} rows, {df.shape[1]} columns -> student_performance.csv")
