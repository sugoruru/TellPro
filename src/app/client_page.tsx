"use client";
import { useEffect, useState } from "react";
import HomeNav, { HomeNavItems } from "./components/main/homeNav";
import NoticeBlock from "./components/main/noticeBlock";
import axios from "axios";
import { Page } from "@/types/DBTypes";
import PageLinkBlock from "./components/pages/main/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { User } from "@/types/DBTypes";
import { Notice } from "@/types/DBTypes";
import { PagesRoot } from "@/types/axiosTypes";

export default function Home(props: { root: PagesRoot }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [trendPages, setTrendArticles] = useState<Page[]>([]);
  const [trendQuestions, setTrendQuestions] = useState<Page[]>([]);
  const [trendPageUsers, setTrendPageUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    document.title = "Home｜TellPro";
  }, []);
  useEffect(() => {
    const root = { data: props.root };
    if (root.data.ok) {
      const notices = root.data.data.notices;
      const trendPage = root.data.data.trending_articles;
      const trendQuestion = root.data.data.trending_questions;
      const users = root.data.data.users;
      setNotices(notices);
      setTrendArticles(trendPage);
      setTrendQuestions(trendQuestion);
      const userData: { [key: string]: User } = {};
      users.forEach((user: User) => {
        userData[user.id] = user;
      });
      setTrendPageUsers(userData);
    } else {
      alert("エラーが発生しました。");
    }
  }, [props.root]);
  return (
    <div className="h-full">
      <HomeNav path={HomeNavItems.Home} />
      <div className="m-10">
        {trendPages.map((page) => (
          <PageLinkBlock page={page} pageType="articles" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        {trendQuestions.map((page) => (
          <PageLinkBlock page={page} pageType="questions" pageUser={trendPageUsers[page.user_id]} key={returnRandomString(32)}></PageLinkBlock>
        ))}
      </div>
      <div className="mr-10 ml-10 mb-10">
        <div className={`p-5 border-gray-200 transition border-b-4 border-r-4 relative max-w-[60rem] mt-3 min-h-40 rounded-lg break-words mx-auto bg-white dark:bg-slate-700`}>
          {notices.map((notice) => (
            <NoticeBlock created_at={notice.created_at} key={notice.id} title={notice.title} content={notice.content}></NoticeBlock>
          ))}
        </div>
      </div>
    </div>
  );
}
