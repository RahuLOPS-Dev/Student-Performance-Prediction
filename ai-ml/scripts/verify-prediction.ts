// Quick verification: load model.json and run the TS prediction,
// compare against known Python model outputs.
import { loadModel, loadEncoders, predict } from "../src/lib/model";

async function main() {
  // fetch is not available in bun directly for local files; read via fs
  const fs = await import("fs");
  const model = JSON.parse(fs.readFileSync("public/model.json", "utf-8"));
  const encoders = JSON.parse(fs.readFileSync("public/encoders.json", "utf-8"));

  const cases = [
    { name: "default male medium", input: { attendance:80.0,study_hours_per_week:12.0,sleep_hours:6.5,extracurricular_hours:4.0,assignment_score:70.0,internal_assessment_1:65.0,internal_assessment_2:65.0,previous_semester_gpa:7.0,gender:"Male",parental_support:"Medium",family_income_level:"Medium",internet_access:"Yes",part_time_job:"No" } },
    { name: "high performer", input: { attendance:95.0,study_hours_per_week:25.0,sleep_hours:8.0,extracurricular_hours:5.0,assignment_score:92.0,internal_assessment_1:88.0,internal_assessment_2:90.0,previous_semester_gpa:9.2,gender:"Female",parental_support:"High",family_income_level:"High",internet_access:"Yes",part_time_job:"No" } },
    { name: "at-risk", input: { attendance:55.0,study_hours_per_week:3.0,sleep_hours:4.5,extracurricular_hours:1.0,assignment_score:40.0,internal_assessment_1:35.0,internal_assessment_2:38.0,previous_semester_gpa:4.5,gender:"Male",parental_support:"Low",family_income_level:"Low",internet_access:"No",part_time_job:"Yes" } },
  ];

  for (const c of cases) {
    const r = predict(model, encoders, c.input as any);
    console.log(`${c.name}: prediction=${r.prediction} band=${r.band}`);
  }
}
main();
