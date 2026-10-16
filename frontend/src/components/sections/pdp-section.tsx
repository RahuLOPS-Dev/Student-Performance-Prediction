"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, Line, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, LineChart } from "recharts";
import type { EdaData, PDPCurve, ICECurve } from "@/lib/eda";
import { Activity, TrendingUp, GitBranch, Users, BarChart3 } from "lucide-react";

const PDP_LABELS: Record<string, string> = {
  engagement_index: "Engagement Index",
  assignment_score: "Assignment Score",
  avg_internal_score: "Avg Internal Score",
  study_hours_per_week: "Study Hours / Week",
  attendance: "Attendance (%)",
  previous_semester_gpa: "Previous GPA",
};

// ICE features are a subset of PDP features
const ICE_AVAILABLE = ["engagement_index", "assignment_score", "study_hours_per_week", "attendance"];

export default function PdpSection({ eda }: { eda: EdaData }) {
  const pdp = eda.pdp;
  const ice = eda.ice;
  const features = Object.keys(pdp);
  const [active, setActive] = useState<string>(features[0] ?? "engagement_index");
  const [mode, setMode] = useState<"pdp" | "ice">("pdp");

  const curve: PDPCurve | undefined = pdp[active];
  const iceCurve: ICECurve | undefined = ice[active];
  const hasCI = !!(curve?.ci_low && curve?.ci_high);
  const hasICE = !!iceCurve && ICE_AVAILABLE.includes(active);

  const label = curve ? (PDP_LABELS[active] ?? active) : active;
  const ys = curve ? curve.curve.map((p) => p.y) : [0];
  const swing = curve ? Math.max(...ys) - Math.min(...ys) : 0;

  // PDP chart data (with CI band)
  const pdpData = useMemo(() => {
    if (!curve) return [];
    return curve.curve.map((p, i) => ({
      x: p.x,
      y: p.y,
      ciLow: hasCI ? curve.ci_low![i] : p.y,
      ciHigh: hasCI ? curve.ci_high![i] : p.y,
    }));
  }, [curve, hasCI]);

  // ICE chart data
  const iceData = useMemo(() => {
    if (!iceCurve || !curve) return [];
    const n = iceCurve.curves[0]?.length ?? 0;
    return Array.from({ length: n }, (_, i) => {
      const row: Record<string, number> = { x: curve.curve[i]?.x ?? i };
      iceCurve.curves.forEach((c, ci) => { row[`s${ci}`] = c[i]; });
      return row;
    });
  }, [iceCurve, curve]);

  const baselineY = curve ? curve.curve[Math.floor(curve.curve.length / 2)].y : 50;

  if (!curve) return null;

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Partial Dependence — How each feature moves the predicted score
              </CardTitle>
              <CardDescription className="mt-1">
                {mode === "pdp"
                  ? "Average effect of one feature (holding others at mean)" + (hasCI ? " · shaded band = 90% bootstrap CI" : "")
                  : "Individual student prediction curves (30 sampled students) — shows heterogeneity the average hides"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* PDP / ICE toggle */}
              <div className="flex rounded-lg border bg-muted/40 p-0.5">
                <button
                  onClick={() => setMode("pdp")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    mode === "pdp" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BarChart3 className="h-3 w-3" /> PDP
                </button>
                <button
                  onClick={() => hasICE && setMode("ice")}
                  disabled={!hasICE}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    mode === "ice" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  } ${!hasICE ? "cursor-not-allowed opacity-40" : ""}`}
                  title={hasICE ? "Show ICE curves" : "ICE not available for this feature"}
                >
                  <Users className="h-3 w-3" /> ICE
                </button>
              </div>
              {/* swing indicator */}
              <div className="hidden items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs sm:flex">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Swing:</span>
                <span className="font-bold tabular-nums text-primary">{swing.toFixed(1)}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Feature selector pills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {features.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  active === f
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {PDP_LABELS[f] ?? f}
              </button>
            ))}
          </div>

          <div className="h-[340px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {mode === "pdp" ? (
                <ComposedChart data={pdpData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="pdpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: label, position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[40, 95]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Predicted Score", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number, name: string) => {
                      if (name === "ciLow") return [`${value} (5th pctile)`, "CI low"];
                      if (name === "ciHigh") return [`${value} (95th pctile)`, "CI high"];
                      return [`${value}/100`, "Predicted"];
                    }}
                    labelFormatter={(v) => `${label} = ${v}`}
                  />
                  <ReferenceLine y={baselineY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.4} label={{ value: "baseline", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "right" }} />
                  {/* CI band */}
                  {hasCI && <Area type="monotone" dataKey="ciHigh" stroke="none" fill="hsl(var(--chart-1))" fillOpacity={0.12} />}
                  {hasCI && <Area type="monotone" dataKey="ciLow" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />}
                  <Line type="monotone" dataKey="y" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              ) : (
                <LineChart data={iceData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: label, position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Predicted Score", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
                    formatter={(value: number) => [`${value}/100`, "Student"]}
                    labelFormatter={(v) => `${label} = ${v}`}
                  />
                  <ReferenceLine y={baselineY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.4} />
                  {iceCurve && iceCurve.curves.map((_, ci) => (
                    <Line
                      key={ci}
                      type="monotone"
                      dataKey={`s${ci}`}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={1}
                      strokeOpacity={0.25}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {mode === "pdp" ? (
              <>
                Click a feature above. {hasCI ? "Shaded band = 90% bootstrap CI (12 refits). " : ""}
                A swing of <strong className="text-foreground">{swing.toFixed(1)}</strong> pts means this feature materially impacts outcomes.
              </>
            ) : (
              <>
                Each thin line is one of 30 sampled students&apos; prediction as <strong className="text-foreground">{label}</strong> varies.
                Diverging lines = strong feature×other-feature interactions.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
