"use client";
import "../css/globals.css";
import Header from "./components/main/header";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import Prism from "prismjs";
import React, { Suspense } from "react";
import { UserProvider } from "./components/providers/userProvider";
import hideHeaderPage from "@/modules/hideHeaderPage";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  Prism.manual = true;
  const HeaderMemo = React.memo(Header);

  return (
    <html lang="ja">
      <head>
        <title>TellPro</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" href="/svg/logo.svg" />
      </head>
      <body className="bg-slate-100 flex-col flex h-screen" style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif,"Segoe UI Emoji"' }}>
        <SessionProvider refetchOnWindowFocus={false}>
          <NextTopLoader
            color="#2299DD"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={true}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
            template='<div class="bar" role="bar"><div class="peg"></div></div>'
            zIndex={1600}
            showAtBottom={false}
          />
          <UserProvider>{hideHeaderPage.includes(pathname) ? null : <HeaderMemo />}</UserProvider>
          <Suspense>{children}</Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
