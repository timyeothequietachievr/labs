import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://labs.thequietachievr.com"
).replace(/\/$/, "");

const siteDescription =
  "AI tools and everyday utilities from Tim Yeo / The Quiet Achiever — vibe-coded experiments in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Quiet Achiever Labs",
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Quiet Achiever Labs",
    title: "Quiet Achiever Labs",
    description: siteDescription,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "Quiet Achiever Labs",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
