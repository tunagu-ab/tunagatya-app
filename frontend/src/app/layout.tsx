import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TUNAGATYA - Online Gacha",
  description: "Online Gacha Site TUNAGATYA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              TUNAGATYA
            </Link>
            <AuthButton />
          </nav>
        </header>
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="bg-white shadow-md mt-8">
          <div className="container mx-auto px-6 py-4 text-center text-gray-600">
            <p>&copy; 2025 TUNAGATYA. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

