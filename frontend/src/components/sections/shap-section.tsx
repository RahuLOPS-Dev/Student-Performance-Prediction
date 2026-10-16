"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from "recharts";
import type { EdaData, SHAPFeature } from "@/lib/eda";
import { FEATURE_LABELS } from "@/lib/eda";
import { Term } from "@/components/term";
import { Brain, TrendingUp } from "lucide-react";

const SHAP_FEATURE_ORDER = [
  "engagement_index",
  "assignment_score",
  "avg_internal_score",
  "study_hours_per_week",
  "previous_semester_gpa",
  "attendance",
];

export default function ShapSection({ eda }: { eda: EdaData }) {
  const shap = eda.shap;

  // Build per-feature chart data with a normalized color value (0=low → 1=high)
  const features = SHAP_FEATURE_ORDER.filter((f) => shap[f]);
  const allShap = features.flatMap((f) => shap[f].points.map((p) => p.shap));
  const maxAbs = Math.max(...allShap.map(Math.abs), 0.1);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-primary" />
          <Term term="SHAP">SHAP</Term>-style Global Summary
        </CardTitle>
        <CardDescription>
          Each dot = one student. Position = how much that feature pushes the score up (right) or down (left).
          Color shows the feature&apos;s value (blue = low, red = high).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {features.map((featKey) => {
            const feat: SHAPFeature = shap[featKey];
            const label = (FEATURE_LABELS as Record<string, string>)[featKey] ?? featKey;
            const values = feat.points.map((p) => p.value);
            const vMin = Math.min(...values);
            const vMax = Math.max(...values);
            const data = feat.points.map((p) => ({
              shap: p.shap,
              jitter: (Math.random() - 0.5) * 0.8, // vertical jitter for beeswarm look
              norm: (p.value - vMin) / (vMax - vMin || 1), // 0..1 for color
              value: p.value,
            }));

            return (
              <div key={featKey} className="grid grid-cols-[120px_1fr] items-center gap-2 border-b border-border/40 py-1.5 last:border-0">
                <div className="truncate text-xs font-semibold" title={label}>{label}</div>
                <div className="h-[44px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 2, right: 8, left: 8, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" opacity={0.3} />
                      <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} />
                      <XAxis
                        type="number"
                        dataKey="shap"
                        domain={[-maxAbs, maxAbs]}
                        tick={{ fontSize: 9 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(v) => (v >= 0 ? `+${v}` : `${v}`)}
                      />
                      <YAxis type="number" dataKey="jitter" domain={[-1, 1]} hide />
                      <ZAxis type="number" dataKey="norm" range={[20, 60]} />
                      <Tooltip
                        cursor={false}
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 11 }}
                        formatter={(_value: number, _name: string, props: { payload?: { value?: number; shap?: number } }) => {
                          const v = props?.payload?.value;
                          const s = props?.payload?.shap;
                          return [`value ${v?.toFixed(1)} → ${s >= 0 ? "+" : ""}${s?.toFixed(1)} pts`, label];
                        }}
                      />
                      <Scatter
                        data={data}
                        fill="hsl(var(--chart-1))"
                        shape={(props: { payload?: { norm?: number; cx?: number; cy?: number } }) => {
                          const n = props?.payload?.norm ?? 0.5;
                          // blue (low) → red (high) ramp
                          const hue = 200 - n * 200; // 200 (blue) → 0 (red)
                          const color = `hsl(${hue}, 70%, 50%)`;
                          return <circle key={Math.random()} cx={props?.cx ?? 0} cy={props?.cy ?? 0} r={3} fill={color} fillOpacity={0.7} />;
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span>feature value:</span>
          <span className="flex items-center gap-1">
            low
            <span className="h-2.5 w-12 rounded-full" style={{ background: "linear-gradient(to right, hsl(200,70%,50%), hsl(100,70%,50%), hsl(0,70%,50%))" }} />
            high
          </span>
          <span className="mx-2">·</span>
          <span>← pushes score down</span>
          <span>0</span>
          <span>pushes score up →</span>
        </div>

        <div className="mt-3 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
          <span className="font-semibold">Reading guide:</span> For{" "}
          <Term term="Engagement Index">engagement_index</Term> (top row), high values (red, right side)
          push the score up by 10+ points; low values (blue, left) drag it down. This is the model&apos;s
          most influential feature.
        </div>
      </CardContent>
    </Card>
  );
}
