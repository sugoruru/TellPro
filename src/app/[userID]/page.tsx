"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Dialog, Transition } from "@headlessui/react";
import sleep from "@/modules/sleep";
import PageLinkBlock from "../components/articles/pageLinkBlock";
import { Page } from "@/types/page";
import { IoShieldCheckmark } from "react-icons/io5";
import { SiCodeforces } from "react-icons/si";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";
import { getAtCoderColors, getCodeforcesColors } from "@/modules/getColors";

export default function UserPage({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [isOpenDeletePageModal, setIsOpenDeletePageModal] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [pageUser, setPageUser] = useState<UserPublic>({} as UserPublic);
  const [me, setMe] = useState<UserPublic | null>(null);
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [questions, setQuestions] = useState<Page[]>([] as Page[]);
  const [navPlace, setNavPlace] = useState("articles");
  const [deletePageID, setDeletePageID] = useState("");
  const [codeforcesRatingColor, setCodeforcesRatingColor] = useState("#000000");
  const [atcoderRatingColor, setAtcoderRatingColor] = useState("#000000");
  const router = useRouter();
  let isFetched = false;

  useEffect(() => {
    try {
      const fetcher = async () => {
        if (isFetched) return;
        isFetched = true;
        const [tempMe, userData, articlesData, questionsData] = await Promise.all([
          axios.get(`/api/db/users/existMe`),
          axios.get(`/api/db/users/exist?userID=${params.userID}`),
          axios.get(`/api/db/pages/getPages?userID=${params.userID}&pageType=articles`),
          axios.get(`/api/db/pages/getPages?userID=${params.userID}&pageType=questions`),
        ]);
        if (userData.data.exist) {
          setIsExist(true);
          setPageUser(userData.data.data as UserPublic);
        }
        setIsLoading(false);
        if (articlesData.data.ok) {
          setPages(articlesData.data.pages);
        }
        if (tempMe.data.ok && tempMe.data.exist) {
          setMe(tempMe.data.data as UserPublic);
        }
        if (questionsData.data.ok) {
          setQuestions(questionsData.data.pages);
        }
        if (userData.data.exist) {
          if (userData.data.data.atcoder_id !== "") {
            axios.get(`https://kenkoooo.com/atcoder/proxy/users/${userData.data.data.atcoder_id}/history/json`).then((res) => {
              const rate = res.data.slice(-1)[0].NewRating;
              setAtcoderRatingColor(getAtCoderColors(rate) as string);
            });
          }
          if (userData.data.data.codeforces_id !== "") {
            axios.get(`https://codeforces.com/api/user.info?handles=${userData.data.data.codeforces_id}&checkHistoricHandles=false`).then((res) => {
              const rate = res.data.result[0].rating;
              setCodeforcesRatingColor(getCodeforcesColors(rate) as string);
            });
          }
        }
      };
      fetcher();
    } catch (e) {
      router.replace("/");
    }
  }, [params.userID, router, isLoading, isExist]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isExist) {
      document.title = `${pageUser.username}｜TellPro`;
    } else {
      document.title = "Not found User｜TellPro";
    }
  }, [isLoading, isExist, pageUser.username]);

  const deletePage = async () => {
    setIsDeleteSending(true);
    if (!me) return;
    await axios.post("/api/db/pages/delete", {
      pageID: deletePageID,
      pageUserID: params.userID,
      userID: me.id,
      pageType: "articles",
    });
    setPages(pages.filter((e) => e.id !== deletePageID));
    setIsOpenDeletePageModal(false);
    // 削除ボタン連打防止.
    await sleep(1000);
    setIsDeleteSending(false);
  };

  const deleteQuestion = async () => {
    setIsDeleteSending(true);
    if (!me) return;
    await axios.post("/api/db/pages/delete", {
      pageID: deletePageID,
      pageUserID: params.userID,
      userID: me.id,
      pageType: "questions",
    });
    setQuestions(questions.filter((e) => e.id !== deletePageID));
    setIsOpenDeletePageModal(false);
    // 削除ボタン連打防止.
    await sleep(1000);
    setIsDeleteSending(false);
  };

  return isLoading ? (
    <></>
  ) : isExist ? (
    <>
      <div className="mb-2">
        <div className="bg-white">
          <div className="p-5 md:flex sm:block">
            <img alt={pageUser.username} src={pageUser.icon} width={100} height={100} className="md:mx-5 w-24 h-24" />
            <div className="flex mt-3 md:mt-0">
              <div>
                <div className="flex">
                  <b>{pageUser.username}</b>
                  {pageUser.is_admin ? <IoShieldCheckmark className="text-purple-700 text-xl" title="Admin"></IoShieldCheckmark> : <></>}
                </div>
                <div>{pageUser.status_message}</div>
                <div>
                  <span>
                    <b>{Number(pageUser.answer_score) + Number(pageUser.page_score)}</b> Scores
                  </span>
                </div>
              </div>
              <div className="ml-4">
                {pageUser.atcoder_id === "" ? (
                  <></>
                ) : (
                  <div className="flex mb-1">
                    <img src="/svg/atcoder.png" alt="atcoder:" width={25} height={25} />
                    <Link href={`https://atcoder.jp/users/${pageUser.atcoder_id}`} target="_blank" style={{ color: `${atcoderRatingColor}` }}>
                      {pageUser.atcoder_id}
                    </Link>
                  </div>
                )}
                {pageUser.codeforces_id === "" ? (
                  <></>
                ) : (
                  <div className="flex mb-1">
                    <SiCodeforces width={25} height={25} className={`text-xl mx-1`} />
                    <Link href={`https://codeforces.com/profile/${pageUser.codeforces_id}`} target="_blank" style={{ color: `${codeforcesRatingColor}` }}>
                      {pageUser.codeforces_id}
                    </Link>
                  </div>
                )}
                {pageUser.x_id === "" ? (
                  <></>
                ) : (
                  <div className="flex mb-1">
                    <BsTwitterX width={25} height={25} className="text-xl mx-1" />
                    <Link href={`https://x.com/${pageUser.x_id}`} target="_blank">
                      {pageUser.x_id}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white">
            <nav className="pl-5 pb-1">
              <span className={`cursor-pointer px-2 ${navPlace === "articles" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("articles")}>
                Articles
              </span>
              <span className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
                Questions
              </span>
            </nav>
          </div>
        </div>
        <div className="bg-slate-100">
          {navPlace === "articles" ? (
            pages.length === 0 ? (
              <div className="m-5">記事はありません</div>
            ) : (
              <div className="bg-slate-100">
                {pages.map((page) => (
                  <div key={returnRandomString(32)}>
                    <PageLinkBlock page={page} pageUser={pageUser} pageType="articles" me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                  </div>
                ))}
              </div>
            )
          ) : questions.length === 0 ? (
            <div className="m-5">質問はありません</div>
          ) : (
            <div className="bg-slate-100">
              {questions.map((question) => (
                <div key={returnRandomString(32)}>
                  <PageLinkBlock page={question} pageUser={pageUser} pageType="questions" me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                </div>
              ))}
            </div>
          )}
          <Transition appear show={isOpenDeletePageModal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpenDeletePageModal(false)}>
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black/25" />
              </Transition.Child>
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title as="h3" className="text-lg text-center font-medium leading-6 text-gray-900">
                        {isDeleteSending ? "削除中です..." : "本当に削除しますか？"}
                      </Dialog.Title>
                      {isDeleteSending ? (
                        <>
                          <div className="flex justify-center mt-2" aria-label="読み込み中">
                            <div className="animate-ping h-4 w-4 bg-blue-600 rounded-full"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-2 text-center">
                            <p className="text-sm text-gray-500">この操作はもとに戻せません</p>
                          </div>
                        </>
                      )}
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={() => {
                            if (navPlace === "articles") {
                              deletePage();
                            } else {
                              deleteQuestion();
                            }
                          }}
                          disabled={isDeleteSending}
                        >
                          <b>削除する</b>
                        </button>
                        <button
                          type="button"
                          className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setIsOpenDeletePageModal(false)}
                          disabled={isDeleteSending}
                        >
                          <b>キャンセル</b>
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
    </>
  ) : (
    <>
      <p>⚠ユーザーが存在しませんでした</p>
    </>
  );
}
