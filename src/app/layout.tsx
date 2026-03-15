import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";

import { seo } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: seo.title,
    template: `%s | ${seo.title}`,
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: "CockCount Team" }],
  metadataBase: new URL(seo.url),
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.url,
    siteName: seo.title,
    images: [
      {
        url: seo.ogImage,
        width: 1200,
        height: 630,
        alt: seo.ogAlt,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [seo.ogImage],
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
