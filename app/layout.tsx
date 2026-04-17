import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golf Heroes — Play. Win. Give.",
  description:
    "A subscription-driven platform combining golf performance tracking, charity fundraising, and monthly draw-based rewards. Join Golf Heroes to enter scores, win prizes, and support charities.",
  keywords: [
    "golf",
    "charity",
    "monthly draw",
    "subscription",
    "prizes",
    "stableford",
    "golf heroes",
  ],
  openGraph: {
    title: "Golf Heroes — Play. Win. Give.",
    description:
      "Enter your golf scores, participate in monthly draws, and support a charity of your choice.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        {children}
      </body>
    </html>
  );
}
