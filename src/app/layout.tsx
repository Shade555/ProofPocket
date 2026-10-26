import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ProofPocket — Open-Weight AI Paperwork Agent",
  description:
    "Drop the paperwork. Review what matters. Get your time back. An open-weight AI agent powered by Google Gemma for evidence-backed document packaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas text-charcoal-900 antialiased selection:bg-sage-100 selection:text-sage-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-charcoal-200 bg-canvas py-8 text-xs text-charcoal-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-charcoal-800">ProofPocket</span>
              <span>•</span>
              <span>Powered by Google Gemma Open-Weight Models</span>
            </div>
            <div className="flex items-center space-x-4 text-charcoal-500">
              <span className="text-[11px] bg-charcoal-100 px-2 py-0.5 rounded text-charcoal-600">
                Deterministic Validation + Semantic AI
              </span>
              <span>Never certifies official legal sufficiency.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
