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
import { stat } from "fs";

// TODO: ユーザーがロードできたら、ローディング画面を終了する.
// TODO: try-catchを使ってエラーをキャッチする.
// TODO: PagesとQuestionsで分ける.
// TODO: ブックマークがない場合の処理を追加する.
export default function Bookmark() {
  const { status } = useSession();
  const me = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  return isLoading ? (
    <Loading title="ユーザー情報を読み込み中..." />
  ) : isLogin ? (
    <>
      <div className="bg-slate-100">
        {isBookmarkLoading ? (
          pages.map((page) => (
            <div key={returnRandomString(32)}>
              <LinkBlock page={page} pageUser={userMap[page.userID]} me={me} />
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </>
  ) : (
    <>
      <title>ログインしてください｜TellPro</title>
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
