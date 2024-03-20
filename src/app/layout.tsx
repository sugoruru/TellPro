"use client";
import "../css/globals.css";
import Header from "./components/header";
import { titles } from "@/modules/returnTitle";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="ja">
      <head>
        <title>{titles[pathname]}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="../svg/logo.svg"></link>
      </head>
      <body className="bg-slate-100">
        <Header />
        {children}
      </body>
    </html>
  );
}
