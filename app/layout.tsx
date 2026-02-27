import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Burnout Radar",
  description: "We don't treat — we warn early."
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/inputs", label: "Inputs" },
  { href: "/plan", label: "Weekly Plan" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">Burnout Radar</h1>
              <p className="text-xs text-slate-600">We don&apos;t treat — we warn early.</p>
            </div>
            <nav className="flex gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
