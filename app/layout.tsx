import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "@/components";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const APP_NAME = "hawapani";
const APP_DEFAULT_TITLE = "hawapani | Real-Time Forecasts & Atmospheric Trends";
const APP_TITLE_TEMPLATE = "%s | hawapani";
const APP_DESCRIPTION =
  "Accurate global weather forecasts, interactive 24-hour hourly trendlines, 7-day extended outlooks, Air Quality Index (AQI), UV safety index, and multi-city weather comparison.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hawapani.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "weather",
    "weather forecast",
    "hourly weather",
    "7-day forecast",
    "air quality index",
    "AQI",
    "UV index",
    "atmospheric pressure",
    "humidity",
    "weather comparison",
  ],
  authors: [
    { name: "Rahul Raj Dahal", url: "https://rahulrajdahal.vercel.app" },
  ],
  creator: "Rahul Raj Dahal",
  publisher: "Rahul Raj Dahal",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    description: APP_DESCRIPTION,
    applicationCategory: "WeatherApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <link rel="preconnect" href="https://cdn.weatherapi.com" />
        <link rel="dns-prefetch" href="https://cdn.weatherapi.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Accessible skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-hidden"
        >
          Skip to main content
        </a>
        <PostHogProvider>
          <Suspense fallback="Loading...">{children}</Suspense>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}
