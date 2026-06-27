import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RBLM — Meme depot & maker",
  description:
    "Rabbit behind the lion mask. Browse community memes or make your own — copy, download, paste.",
  openGraph: {
    title: "RBLM — Meme depot & maker",
    description: "Small rabbit. Big roar. Make and share memes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col selection:bg-[var(--desk-light)]">
        <Navbar />
        <main className="relative z-[1] flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
