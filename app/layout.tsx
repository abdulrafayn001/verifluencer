import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Navigation } from "@/src/components/Navigation";
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
  title: "VerifyInfluencers",
  description: "Analyze health claims from influencers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1120] text-white min-h-screen`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
