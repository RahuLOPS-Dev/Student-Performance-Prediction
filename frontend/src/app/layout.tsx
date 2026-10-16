import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Performance Prediction System",
  description: "ML system that predicts a student's final exam score from academic & behavioral indicators. Gradient Boosting model trained on 1,200 records with client-side inference.",
  keywords: ["machine learning", "student performance", "gradient boosting", "scikit-learn", "regression", "education analytics"],
  authors: [{ name: "AIML Summer Internship 2026" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Student Performance Prediction System",
    description: "ML-powered prediction of student final exam scores · Capstone Project 1",
    siteName: "Student Performance Prediction",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
