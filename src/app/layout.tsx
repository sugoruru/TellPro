"use client";
import "../css/globals.css";
import Header from "./components/main/header";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import Prism from "prismjs";
import React, { Suspense, useEffect } from "react";
import { UserProvider } from "./components/providers/userProvider";
import { TagsProvider } from "./components/hooks/tagsContext";
import { hideHeaderPage, hideFooterPage } from "@/modules/other/hideComponentPage";
import Footer from "./components/main/footer";
import Script from "next/script";
import * as gtag from "@/modules/network/gtag";
import BackGround from "./background";

function wildcardToRegex(pattern: string) {
  return new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
}

function isMatch(pathname: string, patterns: string[]) {
  for (let pattern of patterns) {
    let regex = wildcardToRegex(pattern);
    if (regex.test(pathname)) {
      return true;
    }
  }
  return false;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  Prism.manual = true;
  const HeaderMemo = React.memo(Header);

  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return (
      <html lang="ja">
        <head>
          <title>メンテナンス中｜TellPro</title>
          <meta name="referrer" content="no-referrer" />
          <link rel="icon" href="/svg/logo.svg" />
        </head>
        <body>
          <p className="m-5 text-center text-xl">
            現在、メンテナンス中です。内容は
            <a href="https://x.com/tellpro_net" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
              公式X
            </a>
            を確認してください。
          </p>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <head>
        <title>TellPro</title>
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" href="/svg/logo.svg" />
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`} />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </head>
      <body className="flex flex-col h-screen overflow-x-hidden">
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
          <div className="grid h-full">
            <div>
              <UserProvider>
                <BackGround>
                  {!isMatch(pathname, hideHeaderPage) && <HeaderMemo />}
                  <TagsProvider>
                    <Suspense>{<>{children}</>}</Suspense>
                  </TagsProvider>
                  {!isMatch(pathname, hideFooterPage) && <Footer />}
                </BackGround>
              </UserProvider>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
