import pickle
import numpy as np
import pandas as pd
import streamlit as st
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE, "Model")

st.set_page_config(page_title="Student Performance Predictor", page_icon="🎓", layout="centered")

@st.cache_resource
def load_artifacts():
    with open(f"{MODEL_DIR}/best_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open(f"{MODEL_DIR}/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    with open(f"{MODEL_DIR}/encoders.pkl", "rb") as f:
        encoders = pickle.load(f)
    with open(f"{MODEL_DIR}/feature_cols.pkl", "rb") as f:
        meta = pickle.load(f)
    return model, scaler, encoders, meta

model, scaler, encoders, meta = load_artifacts()
feature_cols = meta["feature_cols"]
best_model_name = meta["best_model_name"]

st.title("🎓 Student Performance Prediction System")
st.caption(f"Predicts final exam score using academic + behavioral indicators · Model: {best_model_name}")

st.markdown("### Enter Student Details")

col1, col2 = st.columns(2)
with col1:
    attendance = st.slider("Attendance (%)", 40.0, 100.0, 80.0)
    study_hours_per_week = st.slider("Study Hours / Week", 0.0, 35.0, 12.0)
    sleep_hours = st.slider("Sleep Hours / Day", 3.0, 10.0, 6.5)
    extracurricular_hours = st.slider("Extracurricular Hours / Week", 0.0, 15.0, 4.0)
    assignment_score = st.slider("Assignment Score", 0.0, 100.0, 70.0)
    internal_assessment_1 = st.slider("Internal Assessment 1", 0.0, 100.0, 65.0)
    internal_assessment_2 = st.slider("Internal Assessment 2", 0.0, 100.0, 65.0)
    previous_semester_gpa = st.slider("Previous Semester GPA", 0.0, 10.0, 7.0)

with col2:
    gender = st.selectbox("Gender", ["Male", "Female"])
    parental_support = st.selectbox("Parental Support", ["Low", "Medium", "High"])
    family_income_level = st.selectbox("Family Income Level", ["Low", "Medium", "High"])
    internet_access = st.selectbox("Internet Access", ["Yes", "No"])
    part_time_job = st.selectbox("Part-time Job", ["Yes", "No"])

if st.button("Predict Final Exam Score", type="primary"):
    avg_internal_score = (internal_assessment_1 + internal_assessment_2) / 2
    engagement_index = (attendance / 100) * study_hours_per_week

    row = {
        "attendance": attendance,
        "study_hours_per_week": study_hours_per_week,
        "sleep_hours": sleep_hours,
        "extracurricular_hours": extracurricular_hours,
        "assignment_score": assignment_score,
        "internal_assessment_1": internal_assessment_1,
        "internal_assessment_2": internal_assessment_2,
        "previous_semester_gpa": previous_semester_gpa,
        "avg_internal_score": avg_internal_score,
        "engagement_index": engagement_index,
        "gender_enc": encoders["gender"].transform([gender])[0],
        "parental_support_enc": encoders["parental_support"].transform([parental_support])[0],
        "family_income_level_enc": encoders["family_income_level"].transform([family_income_level])[0],
        "internet_access_enc": encoders["internet_access"].transform([internet_access])[0],
        "part_time_job_enc": encoders["part_time_job"].transform([part_time_job])[0],
    }
    X_input = pd.DataFrame([row])[feature_cols]

    if best_model_name == "Linear Regression":
        X_input_final = scaler.transform(X_input)
    else:
        X_input_final = X_input

    prediction = model.predict(X_input_final)[0]
    prediction = float(np.clip(prediction, 0, 100))

    st.markdown("### Prediction")
    st.metric("Predicted Final Exam Score", f"{prediction:.1f} / 100")

    if prediction >= 75:
        st.success("Strong predicted performance. Keep up the consistency.")
    elif prediction >= 50:
        st.warning("Moderate predicted performance. Room for improvement in study hours or attendance.")
    else:
        st.error("At-risk prediction. Consider additional academic support.")

st.markdown("---")
st.caption("AIML Summer Internship 2026 · Capstone Project 1 · Student Performance Prediction System")
