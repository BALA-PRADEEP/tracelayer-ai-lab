import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceLayer — Production AI systems you can inspect",
  description:
    "A production-minded AI engineering lab demonstrating retrieval, tool calls, evidence, reliability, and inspectable execution traces.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
