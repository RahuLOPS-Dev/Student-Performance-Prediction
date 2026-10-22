"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";

// ────────────────────────────────────────────────────────────────
// Loading State — Skeleton
// ────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-border/60 p-6" role="status" aria-label="Loading">
      <Skeleton className="mb-4 h-6 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("mb-2 h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = "h-[260px]" }: { height?: string }) {
  return (
    <div className={cn("flex items-end gap-2 rounded-lg border border-border/60 p-4", height)} role="status" aria-label="Loading chart">
      {[40, 65, 30, 80, 55, 70, 45, 90, 60].map((h, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8", className)} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Empty State
// ────────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Error State
// ────────────────────────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this content.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold text-destructive">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Progress Indicator — for async operations
// ────────────────────────────────────────────────────────────────
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%`, transitionDuration: "300ms" }}
      />
    </div>
  );
}
