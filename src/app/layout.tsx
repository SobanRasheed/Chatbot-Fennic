import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kimi AI with K3 | Built for Agentic Coding & Knowledge Work",
  description:
    "Try Kimi K3 to build playable multiplayer and 3D games, create consulting grade slides, and run parallel tasks with Swarm and Goal to get more work done.",
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
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-kimi-ground">
        {children}
      </body>
    </html>
  );
}
