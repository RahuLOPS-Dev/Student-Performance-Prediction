"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check, Share2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sectionId?: string;
  sectionLabel?: string;
}

export function ShareDialog({ open, onOpenChange, sectionId, sectionLabel }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}${sectionId ? `#${sectionId}` : ""}`
    : "";
  const text = `Check out this Student Performance Prediction System${sectionLabel ? ` — ${sectionLabel} section` : ""}!`;
  const hashtags = "MachineLearning,EdTech,DataScience,GradientBoosting";

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`, "_blank", "noopener,noreferrer");
  };
  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" /> Share
          </DialogTitle>
          <DialogDescription>
            {sectionLabel ? `Share the "${sectionLabel}" section` : "Share this project"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={shareTwitter}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 transition hover:border-sky-300 hover:bg-sky-50/50 dark:hover:border-sky-800 dark:hover:bg-sky-950/30"
          >
            <Twitter className="h-5 w-5 text-sky-600" />
            <span className="text-[10px] font-semibold">Twitter</span>
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 transition hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
            <span className="text-[10px] font-semibold">LinkedIn</span>
          </button>
          <button
            onClick={copyLink}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 transition hover:border-primary/40 hover:bg-primary/5"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Link2 className="h-5 w-5 text-primary" />}
            <span className="text-[10px] font-semibold">{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>
        <div className="mt-2 rounded-md border bg-muted/30 p-2">
          <div className="truncate text-[11px] text-muted-foreground" title={url}>{url}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
