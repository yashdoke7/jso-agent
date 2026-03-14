import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "JSO Agent — AI Job Search Query Generator",
  description:
    "Generate optimized Boolean and X-Ray search queries for LinkedIn, Indeed, Naukri, Glassdoor, Reed, and TotalJobs using AI.",
  openGraph: {
    title: "JSO Agent — AI Job Search Query Generator",
    description:
      "Enter your job preferences and get optimized Boolean & X-Ray queries for 6 major job platforms — instantly.",
    url: "https://jso-agent-lilac.vercel.app",
    siteName: "JSO Agent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSO Agent — AI Job Search Query Generator",
    description:
      "Enter your job preferences and get optimized Boolean & X-Ray queries for 6 major job platforms — instantly.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
