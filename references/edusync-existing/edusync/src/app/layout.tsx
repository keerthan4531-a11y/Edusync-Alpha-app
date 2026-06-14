import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduSync 4.0 - Revolutionizing Education",
  description: "Master communication skills through AI roleplay, compete in global challenges, and unlock premium job opportunities with your verified skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <Script src="/static/js/edusync-ai-engine.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
