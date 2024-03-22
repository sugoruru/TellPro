"use client";
import "../css/globals.css";
import Header from "./components/header";
import { titles } from "@/modules/returnTitle";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeaderPage = ["/init"];

  return (
    <html lang="ja">
      <head>
        <title>{titles[pathname]}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" href="../svg/logo.svg"></link>
      </head>
      <body className="bg-slate-100">
        <SessionProvider>
          {hideHeaderPage.includes(pathname) ? null : <Header />}
          <div>{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
