"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, BookOpen, Sparkles } from "lucide-react";
import { usePersistentState } from "@/lib/use-persistent-state";

export function WelcomeModal() {
  const [seen, setSeen] = usePersistentState<boolean>("spp:welcome-seen", false);
  const [open, setOpen] = useState(false);

  // Only open via explicit user action (e.g. "Show welcome" button / reset onboarding),
  // NEVER auto-popup on load — that obscures the hero and is a usability anti-pattern.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("spp:show-welcome", onOpen);
    return () => window.removeEventListener("spp:show-welcome", onOpen);
  }, []);

  const handleTour = () => {
    setOpen(false);
    setSeen(true);
    // Trigger the GuidedTour via custom event
    window.dispatchEvent(new CustomEvent("spp:start-tour"));
  };

  const handleDismiss = () => {
    setOpen(false);
    setSeen(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSeen(true); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl">Welcome 👋</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This is a <strong className="text-foreground">Student Performance Prediction System</strong> — an ML
            project that predicts final exam scores from academic &amp; behavioral indicators.
            You can explore freely, or take a 2-minute guided tour of the key sections.
          </DialogDescription>
        </DialogHeader>
        <div className="my-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border bg-muted/30 p-2">
            <Sparkles className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-1 text-[10px] font-semibold">15 Sections</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2">
            <Play className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-1 text-[10px] font-semibold">Live Predictor</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2">
            <BookOpen className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-1 text-[10px] font-semibold">ML Glossary</div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
            Explore on my own
          </Button>
          <Button onClick={handleTour} className="w-full sm:w-auto">
            <Play className="mr-1.5 h-4 w-4" /> Take the Tour
          </Button>
        </DialogFooter>
        <p className="text-center text-[10px] text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1">⌘K</kbd> any time to search · This prompt won&apos;t show again
        </p>
      </DialogContent>
    </Dialog>
  );
}
