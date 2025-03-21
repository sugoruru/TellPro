"use client";
import PageLinkBlock from "@/app/components/pages/main/pageLinkBlock";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Page, Tag } from "@/types/DBTypes";
import { User } from "@/types/DBTypes";
import React from "react";
import { DBTagsTag } from "@/types/axiosTypes";

// 検索ページ.
export default function SearchPage({ params }: { params: { tag: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tag, setTag] = useState<Tag | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [questions, setQuestions] = useState<Page[]>([]);
  const [problems, setProblems] = useState<Page[]>([]);
  const [navPlace, setNavPlace] = useState("pages");
  const [userMap, setUserMap] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    document.title = "Tag｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {
      let res;
      if (page === null) {
        res = await axios.get<DBTagsTag>(`/api/db/tags/tag?name=${params.tag}&page=1`);
      } else if (isNaN(Number(page)) || Number(page) < 1) {
        router.replace(`/tags/${params.tag}?page=1`);
        res = await axios.get<DBTagsTag>(`/api/db/tags/tag?name=${params.tag}&page=1`);
      } else {
        res = await axios.get<DBTagsTag>(`/api/db/tags/tag?name=${params.tag}&page=${page}`);
      }
      if (res.data.ok) {
        setTag(res.data.data);
        setPages(res.data.pages);
        setQuestions(res.data.questions);
        setProblems(res.data.problems);
        setUserMap(res.data.userMap);
      }
    };
    fetcher();
  }, [router, params.tag, page]);

  return (
    <div className="h-full">
      {tag === null ? (
        <div className="h-full"></div>
      ) : (
        <>
          <div className={`p-5 md:flex sm:block bg-white text-black dark:bg-neutral-800 dark:text-white`}>
            <img alt="" src={tag === undefined ? "/svg/tag.svg" : tag.image === "local" ? "/svg/tag.svg" : tag.image} width={100} height={100} className="md:mx-5" />
            <div>
              <div>
                <b>{tag === undefined ? params.tag : tag.name}</b>
              </div>
              <div>
                <span>
                  <b>{tag === undefined ? 0 : Number(tag.page_count) + Number(tag.question_count) + Number(tag.problem_count)}</b> Scores
                </span>
              </div>
            </div>
          </div>
          {tag === undefined ? (
            <></>
          ) : (
            <>
              <div className={`bg-white text-black dark:bg-neutral-800 dark:text-white`}>
                <nav className="pl-5 pb-1">
                  <span className={`cursor-pointer px-2 ${navPlace === "pages" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("pages")}>
                    Pages({tag.page_count})
                  </span>
                  <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
                    Questions({tag.question_count})
                  </span>
                  <span className={`cursor-pointer px-2 ${navPlace === "problems" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("problems")}>
                    Problems({tag.problem_count})
                  </span>
                </nav>
              </div>
              <div className={`bg-slate-100 dark:bg-zinc-800`}>
                {navPlace === "pages" ? (
                  <div className={`bg-slate-100 dark:bg-zinc-800`}>
                    {pages.map((page) => (
                      <div key={returnRandomString(32)}>
                        <PageLinkBlock page={page} pageUser={userMap[page.user_id]} pageType="articles" />
                      </div>
                    ))}
                  </div>
                ) : navPlace === "questions" ? (
                  <div className={`bg-slate-100 dark:bg-zinc-800`}>
                    {questions.map((question) => (
                      <div key={returnRandomString(32)}>
                        <PageLinkBlock page={question} pageUser={userMap[question.user_id]} pageType="questions" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`bg-slate-100 dark:bg-zinc-800`}>
                    {problems.map((problem) => (
                      <div key={returnRandomString(32)}>
                        <PageLinkBlock page={problem} pageUser={userMap[problem.user_id]} pageType="problems" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
