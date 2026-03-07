import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Shuttle Tracker",
  description: "Track badminton group costs, shuttles, and payments seamlessly.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-zinc-950 text-zinc-50 min-h-screen selection:bg-emerald-500/30`}
      >
        <div className="flex flex-col md:flex-row min-h-screen relative">
          <Navigation />
          <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
