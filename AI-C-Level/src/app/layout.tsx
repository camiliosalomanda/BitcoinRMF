import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import { CompanyProvider } from "@/contexts/CompanyContext";

export const metadata: Metadata = {
  title: "BizAI - AI Executive Suite for Small Business",
  description: "AI-powered C-Suite executives that collaborate to run your business. Get CFO-level financial insights, CMO marketing strategy, and more.",
  keywords: ["AI", "small business", "CFO", "executive", "financial analysis", "business intelligence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CompanyProvider>
            <OnboardingGuard>{children}</OnboardingGuard>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
