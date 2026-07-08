import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { ToasterLazy } from "@/components/ui/toaster-lazy";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sandryne Boutique — We Curate Elegance",
    template: "%s | Sandryne Boutique",
  },
  description:
    "A curated luxury fashion boutique. Timeless silhouettes, modern minimalism, effortless elegance — dresses, tops, bottoms, active wear, accessories and jewelry.",
  applicationName: "Sandryne Boutique",
  keywords: [
    "luxury fashion boutique",
    "women's designer clothing",
    "curated fashion",
    "silk dresses",
    "minimalist wardrobe",
    "elevated basics",
    "gold vermeil jewelry",
    "Sandryne Boutique",
  ],
  openGraph: {
    siteName: "Sandryne Boutique",
    type: "website",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sandryne Boutique — We Curate Elegance",
    description:
      "A curated luxury fashion boutique. Timeless silhouettes, modern minimalism, effortless elegance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {children}
        <ToasterLazy />
      </body>
    </html>
  );
}
