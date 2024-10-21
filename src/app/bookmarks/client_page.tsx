"use client";
import { useEffect, useRef, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";
import PageLinkBlock from "../components/pages/main/pageLinkBlock";
import { User } from "@/types/DBTypes";
import { Page } from "@/types/DBTypes";
import { DBUsersExistMe } from "@/types/axiosTypes";

export default function Bookmark() {
  const { status } = useSession();
  const [me, setMe] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [navPlace, setNavPlace] = useState("articles");
  const [articles, setArticles] = useState<Page[]>([] as Page[]);
  const [questions, setQuestions] = useState<Page[]>([] as Page[]);
  const [problems, setProblems] = useState<Page[]>([] as Page[]);
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});
  const isFetched = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoading(false);
    } else if (status === "authenticated") {
      setIsLoading(false);
      setIsLogin(true);
    }
    const fetcher = async () => {
      try {
        const me = await axios.get<DBUsersExistMe>("/api/db/users/existMe");
        if (me.data.ok === false) {
          setIsLoading(false);
        } else {
          setMe(me.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetcher();
  }, [status]);

  // ユーザー情報が取得できているか確認.
  useEffect(() => {
    if (me) {
      const fetcher = async () => {
        try {
          if (isFetched.current) return;
          isFetched.current = true;
          const bookmarks = (await axios.get<{ ok: false } | { ok: true; pages: { articles: Page[]; questions: Page[]; problems: Page[] }; userData: User[] }>(`/api/pages/bookmarks`)).data;
          if (bookmarks.ok === false) {
            console.error("Error");
            return;
          }
          if (bookmarks.pages.articles !== null) {
            setArticles(bookmarks.pages.articles);
          }
          if (bookmarks.pages.questions !== null) {
            setQuestions(bookmarks.pages.questions);
          }
          if (bookmarks.pages.problems !== null) {
            setProblems(bookmarks.pages.problems);
          }
          // bookmarks.userDataからuserMapを作成する.
          if (bookmarks.userData.length !== 0) {
            const _userMap: { [key: string]: User } = {};
            bookmarks.userData.forEach((user: User) => {
              _userMap[user.id] = user;
            });
            setUserMap(_userMap);
          }
          setIsBookmarkLoading(true);
        } catch (e) {
          console.error(e);
        }
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
    <div className="h-full"></div>
  ) : isLogin ? (
    <div className="h-full">
      <div className={`bg-white text-black dark:bg-neutral-800 dark:text-white`}>
        <nav className="pl-5 pb-[5.5px]">
          <span className={`cursor-pointer px-2 ${navPlace === "articles" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("articles")}>
            Articles
          </span>
          <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
            Questions
          </span>
          <span className={`cursor-pointer px-2 ${navPlace === "problems" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("problems")}>
            Problems
          </span>
        </nav>
      </div>
      <div>
        {isBookmarkLoading ? (
          navPlace === "articles" ? (
            articles.length === 0 ? (
              <p className={`mt-4 text-center text-black dark:text-white`}>記事のブックマークは存在しません</p>
            ) : (
              <div>
                {articles.map((article) => (
                  <div key={returnRandomString(32)}>
                    <PageLinkBlock page={article} pageUser={userMap[article.user_id]} pageType="articles" me={me} />
                  </div>
                ))}
              </div>
            )
          ) : navPlace === "questions" ? (
            questions.length === 0 ? (
              <p className={`mt-4 text-center text-black dark:text-white`}>質問のブックマークは存在しません</p>
            ) : (
              <div>
                {questions.map((question) => (
                  <div key={returnRandomString(32)}>
                    <PageLinkBlock page={question} pageUser={userMap[question.user_id]} pageType="questions" me={me} />
                  </div>
                ))}
              </div>
            )
          ) : navPlace === "problems" ? (
            problems.length === 0 ? (
              <p className={`mt-4 text-center text-black dark:text-white`}>問題集のブックマークは存在しません</p>
            ) : (
              <div>
                {problems.map((problem) => (
                  <div key={returnRandomString(32)}>
                    <PageLinkBlock page={problem} pageUser={userMap[problem.user_id]} pageType="problems" me={me} />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="h-full"></div>
          )
        ) : (
          <div className="h-full"></div>
        )}
      </div>
    </div>
  ) : (
    <div className="h-full">
      <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p className={`text-black dark:text-white`}>ログインしてください</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </div>
  );
}
