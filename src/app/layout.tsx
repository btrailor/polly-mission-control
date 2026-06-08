"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Single Page Apps for GitHub Pages
            // https://github.com/rafgraph/spa-github-pages
            (function(l) {
              if (l.search[1] === '/') {
                var decoded = l.search.slice(1).split('&').map(function(s) {
                  return s.replace(/~and~/g, '&')
                }).join('?');
                window.history.replaceState(null, null,
                  l.pathname.slice(0, -1) + decoded + l.hash
                );
              }
            }(window.location))
          `
        }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="h-full">
        <ThemeProvider>
          <div className="flex h-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopNav />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
