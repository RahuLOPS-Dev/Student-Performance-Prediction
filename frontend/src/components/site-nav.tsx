"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const SECTIONS = [
  { id: "insights", label: "Insights" },
  { id: "predictor", label: "Predictor" },
  { id: "reliability", label: "Reliability" },
  { id: "impact", label: "Impact" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("overview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all ${
        scrolled ? "bg-background/85 shadow-sm" : "bg-background/60"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">SPP System</span>
          <span className="sm:hidden">SPP</span>
        </button>

        <nav className="hidden items-center gap-0.5 md:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" onClick={() => scrollTo("predictor")} className="hidden sm:inline-flex">
            Try Predictor
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-background px-4 py-2 md:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                active === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
