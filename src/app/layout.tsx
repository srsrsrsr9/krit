import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Krit — Skill-first learning",
    template: "%s · Krit",
  },
  description:
    "A learning platform built around skills, not courses. For corporate L&D teams and retail learners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} min-h-screen font-sans`}>
        <QueryProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
