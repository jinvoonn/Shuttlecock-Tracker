import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CockCount",
  description: "Because Shuttlecocks Aren’t Free. Track shuttlecock usage, sessions, matches, and shared costs for your badminton group.",
  keywords: ["badminton tracker", "shuttlecock tracker", "badminton sessions", "shuttlecock inventory", "badminton score tracker"],
  authors: [{ name: "CockCount Team" }],
  openGraph: {
    title: "CockCount",
    description: "Because Shuttlecocks Aren’t Free. Track shuttlecock usage, sessions and match stats for your badminton group.",
    url: "https://cockcount.vercel.app",
    siteName: "CockCount",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CockCount - Badminton Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CockCount",
    description: "Because Shuttlecocks Aren’t Free. Track shuttlecock usage, sessions, and matches.",
    images: ["/og-image.png"],
  },
  other: {
    "app-stats": "CockCount 12 Players 86 Shuttlecocks Used",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-950 text-slate-50 min-h-screen selection:bg-sky-500/30`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
