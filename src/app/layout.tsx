import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: "NYKE",
  title: {
    default: "NYKE — FPS Profiles, Aim Settings & Gear",
    template: "%s",
  },
  description: "Build and share your FPS profile with aim settings, active gear and your NYKE Card.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "NYKE",
    title: "NYKE",
    description: "Build and share your FPS profile with aim settings, active gear and your NYKE Card.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NYKE FPS profiles, aim settings and gear" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NYKE — FPS Profiles, Aim Settings & Gear",
    description: "Build and share your FPS profile with aim settings, active gear and your NYKE Card.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-clip bg-[#08090c] text-zinc-100">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
