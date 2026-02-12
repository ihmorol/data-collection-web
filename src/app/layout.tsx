/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import ToastViewport from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "MemeConsole — Meme Data Collection Platform",
  description:
    "A research platform for collecting annotator survey responses on Bangla memes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&family=Hind+Siliguri:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="font-body text-slate-200 antialiased overflow-x-hidden">
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
