import { Metadata } from "next";
import UserPage from "./client_page";
import axios from "axios";

export const generateMetadata = async ({ params }: { params: { userID: string } }): Promise<Metadata> => {
  const user = (await axios.get(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/pages/user_meta?userID=${params.userID}`)).data;
  return {
    openGraph: {
      url: process.env.NEXT_PUBLIC_TRUTH_URL,
      title: `@${params.userID}｜TellPro`,
      siteName: "TellPro",
      type: "article",
      description: "TellProのユーザーページです。",
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

export default function Page({ params }: { params: { userID: string } }) {
  return (
    <>
      <UserPage params={params} />
    </>
  );
}
