"use client";
import PageLinkBlock from "@/app/components/articles/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageList } from "@/types/page";
import { UserPublic } from "@/types/user";

// 検索ページ.
export default function SearchPage({ params }: { params: { tag: string } }) {
  const route = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tag, setTag] = useState<TagData | null>(null);
  const [pages, setPages] = useState<PageList[]>([]);
  const [questions, setQuestions] = useState<PageList[]>([]);
  const [navPlace, setNavPlace] = useState("pages");
  const [userMap, setUserMap] = useState<{ [key: string]: UserPublic }>({});

  useEffect(() => {
    document.title = "Tag｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {
      let res;
      if (page === null) {
        res = await axios.get(`/api/db/tags/tag?name=${params.tag}&page=1`);
      } else if (isNaN(Number(page)) || Number(page) < 1) {
        route.replace(`/search/${params.tag}?page=1`);
        res = await axios.get(`/api/db/tags/tag?name=${params.tag}&page=1`);
      } else {
        res = await axios.get(`/api/db/tags/tag?name=${params.tag}&page=${page}`);
      }
      setTag(res.data.data);
      setPages(res.data.pages);
      setQuestions(res.data.questions);
      setUserMap(res.data.userMap);
    };
    fetcher();
  }, [page]);

  return (
    <>
      {tag === null ? (
        <></>
      ) : (
        <>
          <div className="p-5 md:flex sm:block bg-white">
            <img alt="" src={tag === undefined ? "/svg/tag.svg" : tag.image === "local" ? "/svg/tag.svg" : tag.image} width={100} height={100} className="md:mx-5" />
            <div>
              <div>
                <b>{tag === undefined ? params.tag : tag.name}</b>
              </div>
              <div>
                <span>
                  <b>{tag === undefined ? 0 : Number(tag.page_count) + Number(tag.question_count)}</b> Scores
                </span>
              </div>
            </div>
          </div>
          {tag === undefined ? (
            <></>
          ) : (
            <>
              <div className="bg-white">
                <nav className="pl-5 pb-1">
                  <span className={`cursor-pointer px-2 ${navPlace === "pages" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("pages")}>
                    Pages({tag.page_count})
                  </span>
                  <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
                    Questions({tag.question_count})
                  </span>
                </nav>
              </div>
              <div className="bg-slate-100">
                {navPlace === "pages" ? (
                  <div className="bg-slate-100">
                    {pages.map((page) => (
                      <div key={returnRandomString(32)}>
                        <PageLinkBlock page={page} pageUser={userMap[page.user_id]} pageType="articles" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-100">
                    {questions.map((question) => (
                      <div key={returnRandomString(32)}>
                        <PageLinkBlock page={question} pageUser={userMap[question.user_id]} pageType="questions" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
