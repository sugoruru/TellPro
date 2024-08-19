"use client";
import { useEffect, useState } from "react";
import HomeNav from "./components/main/homeNav";
import NoticeBlock from "./components/main/noticeBlock";
import axios from "axios";
import { Page } from "@/types/page";
import PageLinkBlock from "./components/pages/main/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { UserPublic } from "@/types/user";

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [trendPages, setTrendArticles] = useState<Page[]>([]);
  const [trendQuestions, setTrendQuestions] = useState<Page[]>([]);
  const [trendPageUsers, setTrendPageUsers] = useState<{ [key: string]: UserPublic }>({});

  useEffect(() => {
    document.title = "Home｜TellPro";
  }, []);
  useEffect(() => {
    const getNotice = async () => {
      const root = await axios.get("/api/pages/root");
      if (root.data.ok) {
        const notices = root.data.data.notices;
        const trendPage = root.data.data.trending_articles;
        const trendQuestion = root.data.data.trending_questions;
        const users = root.data.data.users;
        setNotices(notices as Notice[]);
        setTrendArticles(trendPage as Page[]);
        setTrendQuestions(trendQuestion as Page[]);
        const userData: { [key: string]: UserPublic } = {};
        users.forEach((user: UserPublic) => {
          userData[user.id] = user;
        });
        setTrendPageUsers(userData);
      } else {
        alert("エラーが発生しました。");
      }
    };
    getNotice();
  }, []);
  return (
    <div className="h-full">
      <HomeNav pathName="/"></HomeNav>
      <div className="m-10">
        <div className={`text-3xl font-semibold text-center text-gray-800 dark:text-white`}>トレンド記事</div>
        {trendPages.map((page) => (
          <PageLinkBlock page={page} pageType="articles" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        <div className={`text-3xl font-semibold text-center text-gray-800 dark:text-white`}>質問</div>
        {trendQuestions.map((page) => (
          <PageLinkBlock page={page} pageType="questions" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        <div className={`text-3xl font-semibold text-center text-gray-800 dark:text-white`}>お知らせ</div>
        <div className={`p-5 border-gray-200 transition border-b-4 border-r-4 relative max-w-[60rem] mt-3 min-h-40 rounded-lg break-words mx-auto bg-white dark:bg-slate-700`}>
          {notices.map((notice) => (
            <NoticeBlock created_at={notice.created_at} key={notice.id} title={notice.title} content={notice.content}></NoticeBlock>
          ))}
        </div>
      </div>
    </div>
  );
}
