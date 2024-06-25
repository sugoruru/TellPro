import { Metadata } from "next";
import axios from "axios";
import Articles from "./client_page";

export const generateMetadata = async ({ params }: { params: { userID: string; pageID: string } }): Promise<Metadata> => {
  const page = (await axios.get(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/pages/page_meta?pageID=${params.pageID}&pageType=articles&userID=${params.userID}`)).data;
  if (!page.ok) return { title: "TellPro" };
  return {
    openGraph: {
      url: process.env.NEXT_PUBLIC_TRUTH_URL,
      title: `${page.page.title}｜TellPro`,
      siteName: "TellPro",
      type: "article",
      description: "TellProの記事ページです。",
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
      <Articles params={params} />
    </>
  );
}
