"use client";
import { useEffect, useState } from "react";
import HomeNav from "../components/main/homeNav";
import axios from "axios";
import PageLinkBlock from "../components/articles/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Page } from "@/types/page";
import { UserPublic } from "@/types/user";

export default function Articles() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageUser, setPageUser] = useState<{ [key: string]: UserPublic }>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    document.title = "Articles｜TellPro";
  }, []);
  useEffect(() => {
    const fetcher = async () => {
      const res = await axios.get("/api/db/pages/get_new_arrival?pageType=articles");
      if (res.data.ok) {
        setPages(res.data.data);
        const _pageUser: { [key: string]: UserPublic } = {};
        res.data.userData.forEach((e: UserPublic) => {
          _pageUser[e.id] = e;
        });
        setPageUser(_pageUser);
      }
      setIsLoading(false);
    };
    fetcher();
  }, []);
  return (
    <>
      <HomeNav pathName="/articles"></HomeNav>
      <p className="mt-4 text-3xl text-center font-bold">新着記事</p>
      {isLoading ? (
        <></>
      ) : pages.length === 0 ? (
        <p className="text-center mt-4">記事は存在しません</p>
      ) : (
        pages.map((e) => <PageLinkBlock key={returnRandomString(32)} pageUser={pageUser[e.user_id]} page={e} pageType="articles"></PageLinkBlock>)
      )}
    </>
  );
}
