import { Metadata } from "next";
import axios from "axios";
import Questions from "./client_page";
import React from "react";

export const generateMetadata = async ({ params }: { params: { userID: string; questionID: string } }): Promise<Metadata> => {
  const page = (await axios.get(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/pages/page_meta?pageID=${params.questionID}&pageType=questions&userID=${params.userID}`)).data;
  if (!page.ok) return { title: "TellPro" };
  return {
    openGraph: {
      url: process.env.NEXT_PUBLIC_TRUTH_URL,
      title: `${page.page.title}｜TellPro`,
      siteName: "TellPro",
      type: "article",
      description: "TellProの質問ページです。",
      images: {
        url: page.ok ? `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/og?OGPType=article&articleUser=${params.userID}&articleTitle=${page.page.title}` : `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/og`,
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
      <Questions params={params} />
    </>
  );
}
