# Student Performance Prediction System

A faculty-presentable ML project that predicts a student's final exam score from
academic, behavioral, and demographic indicators. The trained Gradient Boosting
model (300 trees) runs entirely client-side — predictions happen in the browser.

## Project Structure

```
/
├── frontend/          # Next.js 16 app (the web UI + client-side model inference)
│   ├── src/           #   React/TS components, sections, lib (model.ts, eda.ts)
│   ├── public/        #   Static assets + exported model.json + eda-data.json
│   ├── prisma/        #   Prisma schema (SQLite)
│   ├── next.config.ts, tsconfig.json, tailwind.config.ts, …
│   └── .env           #   Frontend env (DATABASE_URL)
│
├── backend/           # FastAPI model-serving API (optional — model also runs client-side)
│   ├── main.py        #   REST endpoints: /api/predict, /api/eda, /api/model-info
│   └── requirements.txt
│
├── ai-ml/             # AI/ML pipeline — Python training, model artifacts, dataset
│   ├── Dataset/       #   Synthetic student_performance.csv + generator
│   ├── Model/         #   Trained model.pkl, scaler.pkl, encoders.pkl, feature_cols.pkl
│   ├── Notebook/      #   Full ML pipeline (preprocessing → EDA → training → eval)
│   ├── Documentation/ #   EDA plots + model_comparison.csv + report
│   ├── Streamlit_App/ #   Original Streamlit deployment app
│   └── scripts/       #   export_model.py (ai-ml → frontend/public) + verify script
│
├── db/                # SQLite database file (custom.db)
├── package.json       # Root scripts (dev/lint/build delegate into frontend/)
├── node_modules/      # Shared dependencies (resolved upward from frontend/)
├── Caddyfile          # Gateway config (port 81 → 3000)
└── .zscripts/         # Sandbox dev/build orchestration
```

## How to Run

### 1. Frontend (Next.js dev server — port 3000)
```bash
bun run dev            # runs `cd frontend && next dev -p 3000`
```
The app is served at http://localhost:3000 (visible via the Preview Panel).

### 2. AI/ML pipeline (re-train + re-export data)
```bash
cd ai-ml/Notebook && python3 pipeline.py        # retrains model → ai-ml/Model/
bun run export-data                              # re-exports JSON → frontend/public/
```
The exported `model.json` + `eda-data.json` are read by the frontend so predictions
run client-side with no Python dependency at runtime.

### 3. Backend API (optional — port 8001)
```bash
cd backend && python3 main.py                    # FastAPI on :8001
```
Only needed if you want server-side prediction instead of client-side inference.

## Tech Stack
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, framer-motion
- **AI/ML**: Python, scikit-learn (Gradient Boosting), pandas, numpy, matplotlib, seaborn
- **Backend**: FastAPI, uvicorn (optional)

## Key Results
- Best model: **Gradient Boosting** (300 trees, lr 0.05)
- R² = 70.84% · MAE = 5.01 · 90.4% of predictions within ±10 points
- Top predictor: `engagement_index` (attendance × study hours) — 37% importance
