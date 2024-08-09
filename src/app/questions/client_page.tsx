"use client";
import { useContext, useEffect, useState } from "react";
import HomeNav from "../components/main/homeNav";
import axios from "axios";
import PageLinkBlock from "../components/pages/main/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Page } from "@/types/page";
import { UserPublic } from "@/types/user";
import { UserContext } from "../components/providers/userProvider";

export default function Questions() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageUser, setPageUser] = useState<{ [key: string]: UserPublic }>({});
  const [isLoading, setIsLoading] = useState(true);
  const headerData = useContext(UserContext);

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
      setIsLoading(false);
    };
    fetcher();
  }, []);

  return (
    <div className="h-full">
      <HomeNav pathName="/questions"></HomeNav>
      <p className={`mt-4 text-3xl text-center font-bold ${headerData.user.isDarkMode ? "text-white" : "text-gray-800"}`}>新着質問</p>
      {isLoading ? (
        <></>
      ) : pages.length === 0 ? (
        <p className={`text-center mt-4 ${headerData.user.isDarkMode ? "text-white" : "text-black"}`}>質問は存在しません</p>
      ) : (
        pages.map((e) => <PageLinkBlock key={returnRandomString(32)} pageUser={pageUser[e.user_id]} page={e} pageType="questions"></PageLinkBlock>)
      )}
    </div>
  );
}
