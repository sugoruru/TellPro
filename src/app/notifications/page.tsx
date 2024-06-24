import { Metadata } from "next";
import Messages from "./client_page";

export const metadata: Metadata = {
  openGraph: {
    url: process.env.NEXT_PUBLIC_TRUTH_URL,
    title: `TellPro`,
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

export default function Page() {
  return (
    <>
      <Messages />
    </>
  );
}
