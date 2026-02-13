import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bitcoin RMF - Institutional-Grade Risk Management Framework",
  description: "Apply NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape. Identify threats, score severity, track remediation, evaluate BIPs, and counter FUD with evidence-based analysis.",
  keywords: ["Bitcoin", "risk management", "NIST RMF", "FAIR", "STRIDE", "threat analysis", "BIP evaluation", "FUD tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0f] text-gray-100 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
