"use client";
import { useEffect, useState } from "react";
import HomeNav from "./components/homeNav";
import NoticeBlock from "./components/noticeBlock";
import axios from "axios";
import { Page } from "@/types/page";
import PageLinkBlock from "./components/articles/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [trendPages, setTrendPages] = useState<Page[]>([]);
  const [trendQuestions, setTrendQuestions] = useState<Page[]>([]);
  const [trendPageUsers, setTrendPageUsers] = useState<{ [key: string]: UserPublic }>({});
  useEffect(() => {
    document.title = "Home｜TellPro";
  }, []);
  useEffect(() => {
    const getNotice = async () => {
      const [notice, trendPage, trendQuestion] = await Promise.all([
        axios.get("/api/db/notices/get_three"),
        axios.get("/api/db/pages/get_trend?pageType=articles"),
        axios.get("/api/db/pages/get_trend?pageType=questions"),
      ]);
      if (notice.data.ok && trendPage.data.ok && trendQuestion.data.ok) {
        const json = notice.data;
        setNotices(json.data as Notice[]);
        setTrendPages(trendPage.data.data as Page[]);
        setTrendQuestions(trendQuestion.data.data as Page[]);
        const userData: { [key: string]: UserPublic } = {};
        trendPage.data.userData.forEach((e: UserPublic) => {
          userData[e.id] = e;
        });
        trendQuestion.data.userData.forEach((e: UserPublic) => {
          userData[e.id] = e;
        });
        setTrendPageUsers(userData);
      }
    };
    getNotice();
  }, []);
  return (
    <>
      <HomeNav pathName="/"></HomeNav>
      <div className="m-10">
        <div className="text-3xl font-semibold text-center text-gray-800">トレンド記事</div>
        {trendPages.map((page) => (
          <PageLinkBlock page={page} pageType="articles" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        <div className="text-3xl font-semibold text-center text-gray-800">質問</div>
        {trendQuestions.map((page) => (
          <PageLinkBlock page={page} pageType="questions" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        <div className="text-3xl font-semibold text-center text-gray-800">お知らせ</div>
        <div className="bg-white p-5 border-gray-200 transition border-b-4 border-r-4 relative max-w-[60rem] mt-3 min-h-40 rounded-lg break-words mx-auto">
          {notices.map((notice) => (
            <NoticeBlock created_at={notice.created_at} key={notice.id} title={notice.title} content={notice.content}></NoticeBlock>
          ))}
        </div>
      </div>
    </>
  );
}
