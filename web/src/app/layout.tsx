import type { Metadata } from "next";
import { Merriweather, Open_Sans } from "next/font/google";
import "./globals.css";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { AuthProvider } from "@/context/AuthContext";
import { getSiteOrigin, seoDescription, seoKeywords } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const siteOrigin = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: `${siteConfig.name} (${siteConfig.shortName}) | International Open-Access Journal for Young Researchers`,
    template: `%s · ${siteConfig.shortName}`,
  },
  icons: {
    icon: "/globe-logo.png",
  },
  description: seoDescription,
  keywords: [...seoKeywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.publisherOrganisation,
  publisher: siteConfig.publisherOrganisation,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteOrigin,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | International Peer-Reviewed Open-Access Journal`,
    description: seoDescription,
    images: [
      {
        url: "/GCR_logo.jpg",
        alt: `${siteConfig.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} (${siteConfig.shortName})`,
    description: seoDescription,
    images: ["/GCR_logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${merriweather.variable} h-full antialiased`}>
      <body className={`${openSans.className} flex min-h-full flex-col`}>
        <SiteJsonLd />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
