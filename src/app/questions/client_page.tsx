"use client";
import { useEffect, useState } from "react";
import HomeNav, { HomeNavItems } from "../components/main/homeNav";
import axios from "axios";
import PageLinkBlock from "../components/pages/main/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Page } from "@/types/DBTypes";
import { User } from "@/types/DBTypes";
import React from "react";

export default function Questions() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageUser, setPageUser] = useState<{ [key: string]: User }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Questions｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {
      const res = await axios.get<{ ok: false } | { ok: true; data: Page[]; userData: User[] }>("/api/db/pages/get_new_arrival?pageType=questions");
      if (res.data.ok) {
        setPages(res.data.data);
        const _pageUser: { [key: string]: User } = {};
        res.data.userData.forEach((e: User) => {
          _pageUser[e.id] = e;
        });
        setPageUser(_pageUser);
      }
      setIsLoading(false);
    };
    fetcher();
  }, []);

  return (
    <div className="h-full">
      <HomeNav path={HomeNavItems.Questions} />
      <p className={`mt-4 text-3xl text-center font-bold text-gray-800 dark:text-white`}>新着質問</p>
      {isLoading ? (
        <></>
      ) : pages.length === 0 ? (
        <p className={`text-center mt-4 text-black dark:text-white`}>質問は存在しません</p>
      ) : (
        pages.map((e) => <PageLinkBlock key={returnRandomString(32)} pageUser={pageUser[e.user_id]} page={e} pageType="questions"></PageLinkBlock>)
      )}
    </div>
  );
}
