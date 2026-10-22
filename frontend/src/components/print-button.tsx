"use client";

import type { ReactNode } from "react";

export function PrintButton({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const handlePrint = () => {
    // Add a printing class so the @media print CSS shows only the report
    document.body.classList.add("printing");
    window.print();
    // Clean up after the print dialog (handles cancel + after-print)
    const cleanup = () => {
      document.body.classList.remove("printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    // Fallback cleanup in case afterprint doesn't fire
    setTimeout(cleanup, 1000);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={className}
      aria-label="Print or save report as PDF"
    >
      {children}
    </button>
  );
}
