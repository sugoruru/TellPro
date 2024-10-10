import { Metadata } from "next";
import ProposalPage from "./client_page";
import React from "react";

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
      <ProposalPage />
    </>
  );
}
