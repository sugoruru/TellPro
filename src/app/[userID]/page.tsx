"use client";
import { useEffect, useState } from "react";
import Loading from "../components/loading";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import returnRandomString from "@/modules/algo/returnRandomString";
import data from "@/modules/tags.json";
import Link from "next/link";
import getImageBase64 from "@/modules/network/getImageBase64";

// TODO: もし本人であれば全てのページを表示する
// TODO: 他人であれば公開しているページのみ表示する
// TODO: Linkタグの範囲の修正.
export default function Page({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [navPlace, setNavPlace] = useState("pages");
  const router = useRouter();
  const tagJSON: Tags = data;

  useEffect(() => {
    try {
      const fetcher = async () => {
        const [userData, pagesData] = await Promise.all([axios.get(`/api/db/users/exist?userID=${params.userID}`), axios.get(`/api/db/pages/getPages?userID=${params.userID}`)]);
        if (userData.data.exist) {
          setIsExist(true);
          const userIcon = await getImageBase64(userData.data.data.icon);
          setUser({ ...userData.data.data, icon: userIcon });
          document.title = `${userData.data.data.username}｜TellPro`;
        }
        setIsLoading(false);
        if (pagesData.data.ok) {
          setPages(pagesData.data.pages);
        }
      };
      fetcher();
    } catch (e) {
      router.replace("/");
    }
  }, []);
  return isLoading ? (
    <>
      <title>Loading...｜TellPro</title>
      <Loading />
    </>
  ) : isExist ? (
    <>
      <div className="bg-white">
        <div className="m-5 md:flex sm:block">
          <Image alt={user.username} src={user.icon} width={100} height={100} priority className="md:mx-5" />
          <div>
            <div>
              <b>{user.username}</b>
            </div>
            <div>{user.statusMessage}</div>
            <div>
              <span>
                <b>{Number(user.answerScore) + Number(user.pageScore)}</b> Scores
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <nav className="pl-5 pb-1">
            <span className={`cursor-pointer px-2 ${navPlace === "pages" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("pages")}>
              Pages
            </span>
            <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
              Questions
            </span>
          </nav>
        </div>
        <div className="bg-slate-100">
          <div className="h-2"></div>
          {navPlace === "pages" ? (
            <div className="bg-slate-100">
              {pages.map((page) => (
                <Link key={returnRandomString(32)} href={`/${params.userID}/pages/${page.ID}`} prefetch>
                  <div className="bg-white border-b cursor-pointer border-gray-200 mx-auto max-w-[50rem] mt-3 min-h-40 rounded-lg p-5 break-words">
                    <div className="flex">
                      <Image alt={user.username} src={user.icon} width={24} height={24} priority />
                      <u
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          router.push(`/${params.userID}`);
                        }}
                      >
                        @{params.userID}
                      </u>
                    </div>
                    <b className="mr-1">{page.title}</b>
                    <div className={`${page.isPublic ? "bg-blue-400" : "bg-red-400"} text-white px-1 rounded-sm inline-block mb-1`}>{page.isPublic ? "公開" : "非公開"}</div>
                    <div className="flex flex-wrap mb-2">
                      {page.tags.map((e) => (
                        <div className="text-xs select-none mr-1 mb-1 px-1 cursor-pointer flex rounded-sm h-4 bg-slate-300" key={returnRandomString(32)}>
                          {tagJSON.tags[Number(e)].name}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <div>Questions</div>
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <>
      <title>Not found User｜TellPro</title>
      <p>⚠ユーザーが存在しませんでした</p>
    </>
  );
}
