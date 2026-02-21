import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { getBaseUrl } from "@/lib/url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Bitcoin RMF - Institutional-Grade Risk Management Framework",
  description: "Apply NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape. Identify threats, score severity, track remediation, evaluate BIPs, and counter FUD with evidence-based analysis.",
  keywords: ["Bitcoin", "risk management", "NIST RMF", "FAIR", "STRIDE", "threat analysis", "BIP evaluation", "FUD tracker"],
  openGraph: {
    title: "Bitcoin RMF - Institutional-Grade Risk Management Framework",
    description: "Apply NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape.",
    siteName: "Bitcoin RMF",
    images: [{ url: "/api/og?type=default", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@BitcoinRMF",
    creator: "@BitcoinRMF",
    title: "Bitcoin RMF - Institutional-Grade Risk Management Framework",
    description: "Apply NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape.",
    images: ["/api/og?type=default"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0f] text-gray-100 min-h-screen">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
