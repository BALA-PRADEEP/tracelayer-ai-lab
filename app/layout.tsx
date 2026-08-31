import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildPilot — Construction operations intelligence",
  description:
    "Monitor project costs, investigate overruns, compare supplier pricing, and make evidence-backed construction decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
