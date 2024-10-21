"use client";
import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";
import { User } from "@/types/DBTypes";
import Link from "next/link";
import { Page } from "@/types/DBTypes";
import { MdArticle } from "react-icons/md";
import HomeNav from "../components/main/homeNav";

// 検索ページ.
export default function SearchPage() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Page[]>([]);
  const lastSearchWord = useRef("");
  const debounceTimeout = useRef<null | NodeJS.Timeout>(null);
  const lastFetchTime = useRef(0);
  const debounceDelay = 200;

  useEffect(() => {
    document.title = "検索｜TellPro";
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    const fetchData = async () => {
      const currentTime = Date.now();
      if (lastSearchWord.current === inputValue || currentTime - lastFetchTime.current < debounceDelay) return;
      try {
        const res = await axios.get<{ ok: false; error: string } | { ok: true; word: string; result: { search_json: { users: User[]; articles: Page[] } }[] }>(`/api/pages/search?word=${inputValue}`);
        if (res.data.ok) {
          lastSearchWord.current = res.data.word;
          lastFetchTime.current = currentTime;
          if (res.data.result[0].search_json.users) {
            setUsers(res.data.result[0].search_json.users);
          } else {
            setUsers([]);
          }
          if (res.data.result[0].search_json.articles) {
            setArticles(res.data.result[0].search_json.articles);
          } else {
            setArticles([]);
          }
        }
      } catch (error) {
        console.error("API fetch error:", error);
      }
    };
    debounceTimeout.current = setTimeout(() => {
      fetchData();
    }, debounceDelay);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue]);

  return (
    <div className="h-full">
      <HomeNav path={""} />
      <div className="flex justify-center text-xl items-center">
        <div className={`bg-white w-4/5 lg:w-3/5 flex items-center mt-20 px-4 transition-all border-2 rounded-lg ${isInputFocused ? "border-sky-400 shadow-xl" : "border-gray-200"}`}>
          <label htmlFor="tellpro_search">
            <IoSearch className={`${isInputFocused ? "text-sky-400" : "text-gray-400"}`} />
          </label>
          <input
            onBlur={() => setIsInputFocused(false)}
            onFocus={() => setIsInputFocused(true)}
            type="text"
            maxLength={30}
            className="h-12 w-full outline-none ml-3"
            placeholder="キーワードを入力"
            id="tellpro_search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4">
        {users.map((user) => (
          <div key={returnRandomString(64)} className="w-3/5 mx-auto bg-white rounded-lg my-3 drop-shadow-sm hover:drop-shadow-lg transition-all">
            <Link href={`/${user.id}`}>
              <div className="flex p-1">
                <img alt={user.username} src={user.icon} width={64} height={64} className="size-12" />
                <div className="ml-2 overflow-x-hidden text-nowrap">
                  <span>
                    <span>{user.username}</span>
                    <br />
                    <span className="text-gray-500">@{user.id}</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {articles.map((article) => (
          <div key={returnRandomString(64)} className="w-3/5 mx-auto bg-white rounded-lg my-3 drop-shadow-sm hover:drop-shadow-lg transition-all">
            <Link href={`/${article.user_id}/articles/${article.id}`}>
              <div className="flex p-1">
                <MdArticle className="text-[3rem]" />
                <div className="ml-2 overflow-x-hidden text-nowrap">
                  <span>
                    <span>{article.title}</span>
                    <br />
                    <span className="text-gray-500">@{article.user_id}</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
