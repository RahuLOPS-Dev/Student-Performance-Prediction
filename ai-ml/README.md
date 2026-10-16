# Student Performance Prediction System

**AIML Summer Internship 2026 — IIHMF, MNNIT Allahabad, Prayagraj**
Capstone Project 1

## Objective
Predict a student's final exam score using attendance, assignment scores, internal
assessments, study habits, and other academic/behavioral indicators.

## Folder Structure
```
StudentPerformancePrediction/
├── Dataset/
│   ├── generate_dataset.py      # generates the synthetic dataset
│   └── student_performance.csv  # 1200+ student records
├── Notebook/
│   └── pipeline.py              # preprocessing, EDA, feature engineering, model training/evaluation
├── Model/
│   ├── best_model.pkl           # best-performing trained model
│   ├── scaler.pkl               # StandardScaler used for Linear Regression
│   ├── encoders.pkl             # LabelEncoders for categorical features
│   └── feature_cols.pkl         # feature list + chosen model name
├── Streamlit_App/
│   └── app.py                   # deployment app
├── Documentation/
│   ├── eda_plots/                # histograms, scatter, boxplot, heatmap, model comparison
│   └── model_comparison.csv     # MAE / MSE / RMSE / R² per model
└── README.md
```

## How to Run

1. **Install dependencies**
   ```bash
   pip install pandas numpy scikit-learn matplotlib seaborn streamlit
   ```

2. **(Optional) Regenerate the dataset**
   ```bash
   cd Dataset && python generate_dataset.py
   ```

3. **Run the full ML pipeline** (preprocessing → EDA → feature engineering → training → evaluation)
   ```bash
   cd Notebook && python pipeline.py
   ```
   This saves EDA plots to `Documentation/eda_plots/`, model comparison metrics to
   `Documentation/model_comparison.csv`, and the trained model artifacts to `Model/`.

4. **Launch the deployment app**
   ```bash
   cd Streamlit_App && streamlit run app.py
   ```

## Methodology (ML Lifecycle)
- **Preprocessing**: median imputation, duplicate removal, IQR-based outlier capping,
  label encoding of categorical features.
- **EDA**: univariate (distribution of scores), bivariate (study hours vs. score,
  parental support vs. score), correlation heatmap.
- **Feature Engineering**: `avg_internal_score`, `engagement_index` (attendance × study hours).
- **Models trained**: Linear Regression, Random Forest Regressor, Gradient Boosting Regressor
  (used in place of XGBoost, which requires internet access to install and wasn't available
  in this environment — Gradient Boosting is functionally equivalent for this use case).
- **Evaluation metrics**: MAE, MSE, RMSE, R² Score.

## Results
On this run, Gradient Boosting was the best-performing model (see
`Documentation/model_comparison.csv` for exact numbers, which will vary slightly on rerun
due to random data generation).

## Notes for Your Submission
- Swap `Dataset/student_performance.csv` for a real dataset (e.g. from Kaggle) if your
  faculty requires a specific public source — the pipeline works unchanged as long as
  column names match, or you adjust `feature_cols` in `pipeline.py`.
- You still need to write **Documentation/Project_Report.pdf** (15–25 pages, per the
  guidelines) and the **presentation (10–15 slides)** — say the word and I'll draft those next.
- Per the academic integrity policy: understand every line here before you submit it as your own.
