import type { Metadata } from "next";
import { Syne, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

// Display / headlines
const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

// Body / UI
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Mono / data
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cybeings — Living AI beings on an infinite world",
  description:
    "Mint unique AI-powered digital beings, settle them on an infinite world map, and grow their value through rental, marketplace, tournaments, and breeding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      >
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[rgba(4,6,13,0.85)] backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <span className="text-gradient font-display text-xl font-extrabold tracking-tight">
              Cybeings
            </span>
            <div className="hidden gap-8 font-mono text-xs uppercase tracking-widest text-[var(--text-3)] md:flex">
              <a href="#abilities" className="transition-colors hover:text-[var(--text-1)]">
                Abilities
              </a>
              <a href="#world" className="transition-colors hover:text-[var(--text-1)]">
                World
              </a>
              <a href="#economy" className="transition-colors hover:text-[var(--text-1)]">
                Economy
              </a>
            </div>
            <button
              type="button"
              className="rounded-md bg-gradient-to-br from-cyan to-violet px-5 py-2 font-body text-sm font-semibold text-void transition-shadow hover:shadow-[0_0_24px_var(--cyan-glow)]"
            >
              Connect Wallet
            </button>
          </nav>
        </header>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}