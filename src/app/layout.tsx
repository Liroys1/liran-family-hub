import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DepositGuard AI — Get Your Security Deposit Back",
  description:
    "AI-powered security deposit recovery. Upload your lease, get an instant analysis of illegal charges, and download a professional demand letter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#020617]">{children}</body>
    </html>
  );
}
