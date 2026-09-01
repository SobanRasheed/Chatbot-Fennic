import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fennic AI | Built for Agentic Coding & Knowledge Work",
  description:
    "Fennic AI turns one prompt into working software. Build playable multiplayer and 3D games, run deep research, ship websites, and design in the browser — all from a single chat.",
  applicationName: "Fennic AI",
  icons: {
    icon: [
      { url: "/sites/favicon.ico", sizes: "any" },
      { url: "/sites/favicon-light.ico", media: "(prefers-color-scheme: light)" },
      { url: "/sites/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/sites/pwa-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No `light` class here: the palette follows prefers-color-scheme, and both
  // modes are defined in globals.css. Add `light` or `dark` to pin one.
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-fennic-ground">
        {children}
      </body>
    </html>
  );
}
