import type { Metadata } from "next";
import { Geist, Geist_Mono, Arimo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huddle - The Social Planner",
  description: "Plan your next hangout with friends, family or whoever you want to huddle with!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${arimo.variable}`} style={{ backgroundColor: "var(--dark-gray)", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
