"use client";
import "../css/globals.css";
import Header from "./components/header";
import { titles } from "@/modules/returnTitle";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import NextTopLoader from "nextjs-toploader";
import Prism from "prismjs";
import React from "react";
import { UserProvider } from "./components/providers/userProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeaderPage = ["/init"];
  Prism.manual = true;

  // 別のDNSに接続した時、トップページにリダイレクトする.
  useEffect(() => {
    // 開発環境の時のみ実行.
    if (process.env.NODE_ENV === "development") {
      if (window.location.protocol + "//" + window.location.host != process.env.NEXT_PUBLIC_TRUTH_URL) {
        location.href = process.env.NEXT_PUBLIC_TRUTH_URL + pathname;
      }
    }
  }, []);
  const HeaderMemo = React.memo(Header);

  return (
    <html lang="ja">
      <head>
        <title>{titles[pathname] ? titles[pathname] : "Loading...｜TellPro"}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" href="/svg/logo.svg"></link>
      </head>
      <body className="bg-slate-100 flex-col flex h-screen" style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif,"Segoe UI Emoji"' }}>
        <SessionProvider refetchOnWindowFocus={false}>
          <UserProvider>
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
            {hideHeaderPage.includes(pathname) ? null : <HeaderMemo />}
            <>{children}</>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
