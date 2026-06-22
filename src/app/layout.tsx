import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "EduSync 4.0 — AI-Powered Learning Platform",
  description: "Master communication, coding, projects, and career skills with AI-powered personalized learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-app-gradient text-foreground font-sans transition-colors duration-500 ease-in-out relative">
        {/* SVG Filters for Liquid Glass refraction effect */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id="liquid-glass-refraction" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02"
                numOctaves="3"
                seed="5"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacement"
              />
              <feSpecularLighting
                in="noise"
                surfaceScale="2"
                specularConstant="0.75"
                specularExponent="20"
                lightingColor="white"
                result="specular"
              >
                <fePointLight x="150" y="150" z="50" />
              </feSpecularLighting>
              <feComposite
                in="specular"
                in2="displacement"
                operator="in"
                result="composite"
              />
              <feMerge>
                <feMergeNode in="displacement" />
                <feMergeNode in="composite" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Animated Mesh Gradient Background */}
        <div className="mesh-background" aria-hidden="true">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'var(--glass-shimmer)' }} />
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
          <div className="mesh-orb mesh-orb-4" />
          <div className="mesh-orb mesh-orb-5" />
        </div>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProviderWrapper>
            <div className="relative z-10 flex flex-col min-h-full">
              {children}
            </div>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
