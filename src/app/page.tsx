import { Metadata } from "next";
import Home from "./client_page";
import { PagesRoot } from "@/types/axiosTypes";

export const metadata: Metadata = {
  openGraph: {
    url: process.env.NEXT_PUBLIC_TRUTH_URL,
    title: "TellPro",
    siteName: "TellPro",
    type: "article",
    description: "TellProのホームページです。",
    images: {
      url: `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/og`,
      width: 1200,
      height: 630,
    },
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function Page() {
  const root = await fetch(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/pages/root`);
  if (!root.ok) {
    return <p>エラーが発生しました。</p>;
  }
  const rootData: PagesRoot = await root.json();
  return <Home root={rootData} />;
}
