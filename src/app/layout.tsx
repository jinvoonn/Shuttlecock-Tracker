import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ClientProviders } from "@/components/ClientProviders";
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

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialMatches = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });
      initialMatches = data || [];
    } catch (err) {
      console.error("Failed to fetch initial matches:", err);
    }
  }

  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-900 text-slate-100 min-h-screen selection:bg-emerald-500/30`}
      >
        <ClientProviders initialMatches={initialMatches}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
