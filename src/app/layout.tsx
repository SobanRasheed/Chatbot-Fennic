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
  // The palette follows prefers-color-scheme by default. A user who has pinned
  // a theme in Settings gets it back before first paint: this script mirrors
  // the store in preferences.ts (same key, same class names) so there is no
  // flash of the OS-preferred palette. Inline at the top of <body> — it runs
  // synchronously during the initial HTML parse, before hydration and before
  // the app renders. `suppressHydrationWarning` covers the class it adds to
  // <html>, which React never knows about.
  const themeBootstrap = `(function(){try{var p=JSON.parse(localStorage.getItem("fennic-preferences")||"{}");var t=p.theme;var c=document.documentElement.classList;t==="dark"?c.add("dark"):t==="light"?c.add("light"):(c.remove("dark"),c.remove("light"))}catch(e){}})()`;
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-fennic-ground">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        {children}
      </body>
    </html>
  );
}
