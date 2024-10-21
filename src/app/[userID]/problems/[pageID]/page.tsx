import { Metadata } from "next";
import Problems from "./client_page";
import axios from "axios";
import React from "react";

export const generateMetadata = async ({ params }: { params: { userID: string; pageID: string } }): Promise<Metadata> => {
  const user = (
    await axios.get<{ ok: false } | { ok: true; page: { title: string }; user: { status_message: string; icon: string } }>(
      `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/pages/page_meta?pageID=${params.pageID}&pageType=articles&userID=${params.userID}`
    )
  ).data;
  return {
    openGraph: {
      url: process.env.NEXT_PUBLIC_TRUTH_URL,
      title: `@${params.userID}｜TellPro`,
      siteName: "TellPro",
      type: "article",
      description: "TellProの問題集ページです。",
      images: {
        url: user.ok
          ? `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/og?OGPType=user&userID=${params.userID}&userStatusMessage=${user.user.status_message}&userIcon=${user.user.icon}`
          : `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/og`,
        width: 1200,
        height: 630,
      },
    },
    twitter: {
      card: "summary_large_image",
    },
  };
};

export default function Page({ params }: { params: { userID: string; pageID: string } }) {
  return (
    <>
      <Problems params={params} />
    </>
  );
}
