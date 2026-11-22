import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthContext";
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
  title: "Reservi",
  description: "Plateforme de réservation de professionnels",
};

export default function RootLayout({
  children,
}: { children: ReactNode }) {
  return (
    <html
      lang="fr" data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full antialiased flex flex-col">
        <AuthProvider>
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}