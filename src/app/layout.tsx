import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-title",
});

export const metadata: Metadata = {
  title: "RBLM",
  description: "You never know who's behind the screen.",
  openGraph: {
    title: "RBLM",
    description: "You never know who's behind the screen.",
    images: ["/templates/rabbit-lion-mask.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6b7884",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
