"use client";
import { useContext, useEffect, useState } from "react";
import Loading from "../components/loading";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserContext } from "../components/providers/userProvider";
import axios from "axios";

// TODO: 処理内容を正確に記述して、ユーザー体感を向上させる.
// TODO: try-catchを使ってエラーをキャッチする.
// TODO: PagesとQuestionsで分ける.
export default function Bookmark() {
  const { status } = useSession();
  const user = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  // ユーザー情報が取得できているか確認.
  useEffect(() => {
    if (user) {
      setIsLogin(true);
      const fetcher = async () => {
        const bookmarks = await axios.get("/api/db/bookmarks/getPages");
        setIsLoading(false);
      };
      fetcher();
    }
  }, [user]);
  return isLoading ? (
    <Loading />
  ) : isLogin ? (
    <>hello</>
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
