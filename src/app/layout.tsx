"use client";
import "../css/globals.css";
import Header from "./components/header";
import { titles } from "@/modules/returnTitle";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeaderPage = ["/init"];

  // 別のDNSに接続した時、トップページにリダイレクトする.
  useEffect(() => {
    if (window.location.protocol + "//" + window.location.host != process.env.NEXT_PUBLIC_TRUTH_URL) {
      location.href = process.env.NEXT_PUBLIC_TRUTH_URL + pathname;
    }
  }, []);

  return (
    <html lang="ja">
      <head>
        <title>{titles[pathname]}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" href="/svg/logo.svg"></link>
      </head>
      <body className="bg-slate-100">
        <SessionProvider>
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
          {hideHeaderPage.includes(pathname) ? null : <Header />}
          <div>{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
