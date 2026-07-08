import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
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
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
