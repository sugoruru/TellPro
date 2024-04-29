"use client";
import { useContext, useEffect, useState } from "react";
import Loading from "../components/loading";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserContext } from "../components/providers/userProvider";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";
import LinkBlock from "../components/linkBlock";
import getImageBase64 from "@/modules/network/getImageBase64";
import Title from "../components/title";

// TODO: try-catchを使ってエラーをキャッチする.
export default function Bookmark() {
  const { status } = useSession();
  const me = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [navPlace, setNavPlace] = useState("pages");
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});
  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoading(false);
    } else if (status === "authenticated") {
      setIsLoading(false);
      setIsLogin(true);
    }
  }, [status]);

  // ユーザー情報が取得できているか確認.
  useEffect(() => {
    if (me) {
      const fetcher = async () => {
        const bookmarks = await axios.get("/api/db/bookmarks/getPages");
        setPages(bookmarks.data.pages);
        for (const pageUser in bookmarks.data.userMap) {
          bookmarks.data.userMap[pageUser].icon = await getImageBase64(bookmarks.data.userMap[pageUser].icon);
        }
        setUserMap(bookmarks.data.userMap);
        setIsBookmarkLoading(true);
      };
      fetcher();
    }
  }, [me]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isLogin) {
      document.title = "Bookmark｜TellPro";
    } else {
      document.title = "Not found User｜TellPro";
    }
  }, [isLoading, isLogin]);

  return isLoading ? (
    <Loading title="ユーザーを読込中..." />
  ) : isLogin ? (
    <>
      <div className="bg-white">
        <nav className="pl-5 pb-[5.5px]">
          <span className={`cursor-pointer px-2 ${navPlace === "pages" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("pages")}>
            Pages
          </span>
          <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
            Questions
          </span>
        </nav>
      </div>
      <div className="bg-slate-100">
        {isBookmarkLoading ? (
          navPlace === "pages" ? (
            <div>
              {pages.map((page) => (
                <div key={returnRandomString(32)}>
                  <LinkBlock page={page} pageUser={userMap[page.userID]} me={me} />
                </div>
              ))}
            </div>
          ) : (
            <></>
          )
        ) : (
          // TODO: ブックマークがない場合の処理を追加する.
          <></>
        )}
      </div>
    </>
  ) : (
    <>
      <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p>ログインしてください</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </>
  );
}
