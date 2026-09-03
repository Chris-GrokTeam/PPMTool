import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BrandMark } from "@/components/BrandMark";
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
  title: "PPM Tool",
  description: "Workfront-inspired project portfolio management (learning project)",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <BrandMark />
      </body>
    </html>
  );
}
