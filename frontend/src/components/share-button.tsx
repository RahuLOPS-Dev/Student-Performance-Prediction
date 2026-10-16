"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";

interface ShareButtonProps {
  sectionId?: string;
  sectionLabel?: string;
  className?: string;
  label?: string;
}

export function ShareButton({ sectionId, sectionLabel, className = "", label }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground ${className}`}
        aria-label={`Share ${sectionLabel ?? "project"}`}
        title="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
        {label && <span className="text-xs">{label}</span>}
      </button>
      <ShareDialog open={open} onOpenChange={setOpen} sectionId={sectionId} sectionLabel={sectionLabel} />
    </>
  );
}
