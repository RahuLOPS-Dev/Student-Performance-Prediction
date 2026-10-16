"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  sectionId: string;
  className?: string;
}

export function CopyLinkButton({ sectionId, className = "" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!", { description: `Shareable link to "${sectionId}" section` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); toast.success("Link copied!"); setTimeout(() => setCopied(false), 2000); }
      catch { toast.error("Couldn't copy link"); }
      document.body.removeChild(ta);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 ${copied ? "opacity-100 text-emerald-600" : ""} ${className}`}
      aria-label={`Copy link to ${sectionId} section`}
      title="Copy shareable link"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
    </button>
  );
}
