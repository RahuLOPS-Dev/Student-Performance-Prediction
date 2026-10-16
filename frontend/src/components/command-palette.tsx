"use client";

import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  GraduationCap, FlaskConical, Database, Sparkles, Users, Trophy, Activity,
  BarChart3, GitBranch, Brain, CheckCircle2, Scale, BookOpen, Target, Moon, Sun, ArrowUp,
} from "lucide-react";

const ITEMS = [
  { id: "hero", label: "Hero / Top", icon: GraduationCap, group: "Sections" },
  { id: "overview", label: "Overview", icon: Target, group: "Sections" },
  { id: "methodology", label: "Methodology", icon: FlaskConical, group: "Sections" },
  { id: "dataset", label: "Dataset Statistics", icon: Database, group: "Sections" },
  { id: "predictor", label: "Interactive Predictor", icon: Sparkles, group: "Sections" },
  { id: "compare", label: "Student Comparison", icon: Users, group: "Sections" },
  { id: "models", label: "Model Comparison", icon: Trophy, group: "Sections" },
  { id: "diagnostics", label: "Prediction Diagnostics", icon: Activity, group: "Sections" },
  { id: "insights", label: "EDA Insights", icon: BarChart3, group: "Sections" },
  { id: "explainability", label: "Partial Dependence (PDP)", icon: GitBranch, group: "Sections" },
  { id: "shap", label: "SHAP Summary", icon: Brain, group: "Sections" },
  { id: "feature-eng", label: "Feature Engineering", icon: GitBranch, group: "Sections" },
  { id: "results", label: "Results & Conclusion", icon: CheckCircle2, group: "Sections" },
  { id: "model-card", label: "Model Card", icon: Scale, group: "Sections" },
  { id: "glossary", label: "ML Glossary", icon: BookOpen, group: "Sections" },
];

const ACTIONS = [
  { id: "theme", label: "Toggle dark / light theme", icon: Moon, group: "Actions" },
  { id: "top", label: "Scroll back to top", icon: ArrowUp, group: "Actions" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K (mac) / Ctrl+K (others) / "/" to open
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runItem = (id: string) => {
    setOpen(false);
    if (id === "theme") {
      document.querySelector<HTMLButtonElement>('[aria-label="Toggle theme"]')?.click();
    } else if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
          <CommandInput placeholder="Search sections and actions…  (Esc to close)" />
          <CommandList className="max-h-[320px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Sections">
              {ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.id}`}
                    onSelect={() => runItem(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="Actions">
              {ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => runItem(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
