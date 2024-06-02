"use client";
import { useEffect, useState } from "react";
import HomeNav from "../components/homeNav";
import axios from "axios";
import PageLinkBlock from "../components/articles/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Page } from "@/types/page";

export default function Questions() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageUser, setPageUser] = useState<{ [key: string]: UserPublic }>({});
  useEffect(() => {
    document.title = "Questions｜TellPro";
  }, []);
  useEffect(() => {
    const fetcher = async () => {
      const res = await axios.get("/api/db/pages/get_new_arrival?pageType=questions");
      if (res.data.ok) {
        setPages(res.data.data);
        const _pageUser: { [key: string]: UserPublic } = {};
        res.data.userData.forEach((e: UserPublic) => {
          _pageUser[e.id] = e;
        });
        setPageUser(_pageUser);
      }
    };
    fetcher();
  }, []);
  return (
    <>
      <HomeNav pathName="/questions"></HomeNav>
      <p className="mt-4 text-3xl text-center font-bold">新着質問</p>
      {pages.map((e) => (
        <PageLinkBlock key={returnRandomString(32)} pageUser={pageUser[e.user_id]} page={e} pageType="questions"></PageLinkBlock>
      ))}
    </>
  );
}
