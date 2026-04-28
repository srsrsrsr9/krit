import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
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
    "Learn skills, not courses. Krit maps every concept into a skill graph, with an AI tutor that watches what you read and verifiable credentials that prove what you know.",
  openGraph: {
    title: "Krit — Skill-first learning",
    description: "Learn skills. Not courses. Show your work.",
    images: ["/api/og/brand"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/brand"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} min-h-screen font-sans`}>
        <QueryProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
