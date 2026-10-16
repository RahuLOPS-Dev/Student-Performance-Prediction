"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

const KEYS = ["spp:welcome-seen", "spp:last-section"];

export function ResetOnboardingButton({ className = "" }: { className?: string }) {
  const handleReset = () => {
    try {
      KEYS.forEach((k) => localStorage.removeItem(k));
      toast.success("Onboarding reset", {
        description: "Reload to see the welcome modal again",
      });
      // reload after a short delay so the toast is visible
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Couldn't reset onboarding");
    }
  };

  return (
    <button
      onClick={handleReset}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground ${className}`}
      aria-label="Reset onboarding"
      title="Clear saved preferences and show the welcome modal again"
    >
      <RotateCcw className="h-3 w-3" /> Reset onboarding
    </button>
  );
}
