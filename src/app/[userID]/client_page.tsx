"use client";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Dialog, Transition } from "@headlessui/react";
import sleep from "@/modules/main/sleep";
import PageLinkBlock from "../components/pages/main/pageLinkBlock";
import { Page } from "@/types/page";
import { IoShieldCheckmark } from "react-icons/io5";
import { SiCodeforces } from "react-icons/si";
import { BsTwitterX, BsTwitter } from "react-icons/bs";
import Link from "next/link";
import { getAtCoderColors, getCodeforcesColors } from "@/modules/other/getColors";
import { max } from "@/modules/algo/max_min";
import { UserPublic } from "@/types/user";
import { UserContext } from "../components/providers/userProvider";
import { useGetWindowSize } from "../components/hooks/useGetWindowSize";

export default function UserPage({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [isOpenDeletePageModal, setIsOpenDeletePageModal] = useState(false);
  const [isOpenReportModal, setIsOpenReportModal] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [isReportSending, setIsReportSending] = useState(false);
  const [isSendingUpdateBanned, setIsSendingUpdateBanned] = useState(false);
  const [canSendReport, setCanSendReport] = useState(true);
  const [pageUser, setPageUser] = useState<UserPublic>({} as UserPublic);
  const [me, setMe] = useState<UserPublic | null>(null);
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [questions, setQuestions] = useState<Page[]>([] as Page[]);
  const [problems, setProblems] = useState<Page[]>([] as Page[]);
  const [navPlace, setNavPlace] = useState("articles");
  const [deletePageID, setDeletePageID] = useState("");
  const [reportValue, setReportValue] = useState("");
  const [codeforcesRatingColor, setCodeforcesRatingColor] = useState("#000000");
  const [atcoderRatingColor, setAtcoderRatingColor] = useState("#000000");
  const router = useRouter();
  const headerData = useContext(UserContext);
  const isFetched = useRef(false);
  const { width } = useGetWindowSize();

  const canSendReportChecker = () => {
    if (me) {
      const prev = new Date(me.sent_report_at).getTime();
      const now = new Date().getTime();
      if (now - prev < 1000 * 60 * 30) {
        setCanSendReport(false);
      } else {
        setCanSendReport(true);
      }
    } else {
      setCanSendReport(false);
    }
  };

  useEffect(() => {
    try {
      const fetcher = async () => {
        if (isFetched.current) return;
        isFetched.current = true;
        const res = await axios.get(`/api/pages/user?userID=${params.userID}`);
        if (res.data.ok) {
          if (res.data.data.user) {
            setIsExist(true);
            setPageUser(res.data.data.user as UserPublic);
            setPages(res.data.data.articles as Page[]);
            setQuestions(res.data.data.questions as Page[]);
            setProblems(res.data.data.problems as Page[]);
          }
          if (res.data.data.me) {
            setMe(res.data.data.me as UserPublic);
          }
          setIsLoading(false);
          if (res.data.data.user) {
            if (res.data.data.user.atcoder_id !== "") {
              try {
                axios.get(`https://kenkoooo.com/atcoder/proxy/users/${res.data.data.user.atcoder_id}/history/json`).then((_res) => {
                  const rate = _res.data.slice(-1)[0].NewRating;
                  setAtcoderRatingColor(getAtCoderColors(rate) as string);
                });
              } catch (e) {
                console.log(e);
              }
            }
            if (res.data.data.user.codeforces_id !== "") {
              try {
                axios.get(`https://codeforces.com/api/user.info?handles=${res.data.data.user.codeforces_id}&checkHistoricHandles=false`).then((_res) => {
                  const rate = _res.data.result[0].rating;
                  setCodeforcesRatingColor(getCodeforcesColors(rate) as string);
                });
              } catch (e) {
                console.log(e);
              }
            }
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

  const deletePage = async (pageType: string) => {
    setIsDeleteSending(true);
    if (!me) return;
    await axios.post("/api/db/pages/delete", {
      pageID: deletePageID,
      pageUserID: params.userID,
      userID: me.id,
      pageType: pageType,
    });
    if (pageType === "articles") {
      setPages(pages.filter((e) => e.id !== deletePageID));
    } else if (pageType === "questions") {
      setQuestions(questions.filter((e) => e.id !== deletePageID));
    } else if (pageType === "problems") {
      setProblems(problems.filter((e) => e.id !== deletePageID));
    }
    setIsOpenDeletePageModal(false);
    // 削除ボタン連打防止.
    await sleep(1000);
    setIsDeleteSending(false);
  };

  const sendReportUser = async () => {
    setIsReportSending(true);
    if (!me) return;
    if (reportValue.trim() === "") return;
    // 30分に1回しか通報できない.
    const prev = new Date(me.sent_report_at).getTime();
    const now = new Date().getTime();
    if (now - prev < 1000 * 60 * 30) {
      setIsOpenReportModal(false);
      setIsReportSending(false);
      return;
    }
    await axios.post("/api/admin/send_report", {
      user_id: me.id,
      reported_user_id: params.userID,
      report_value: reportValue,
    });
    setIsOpenReportModal(false);
    setCanSendReport(false);
    me.sent_report_at = new Date().toISOString();
    // 通報ボタン連打防止.
    await sleep(1000);
    setIsReportSending(false);
  };

  const handleSwitchBanned = async () => {
    if (!me) return;
    if (!me.is_admin) return;
    setIsSendingUpdateBanned(true);
    setPageUser({ ...pageUser, is_banned: !pageUser.is_banned });
    axios.post("/api/admin/switch_banned", {
      banned_user_id: params.userID,
      is_banned: !pageUser.is_banned,
    });
    await sleep(1500);
    setIsSendingUpdateBanned(false);
  };

  return isLoading ? (
    <div className="h-full"></div>
  ) : isExist ? (
    <div className="h-full flex flex-col">
      <div>
        <div className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-black"}`}>
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
                {pageUser.is_admin || !me ? (
                  <></>
                ) : (
                  <button
                    onClick={() => {
                      canSendReportChecker();
                      setIsOpenReportModal(true);
                      setReportValue("");
                    }}
                    className="bg-red-500 hover:bg-red-600 transition px-3 rounded text-white"
                  >
                    通報
                  </button>
                )}
                {!me ? (
                  <></>
                ) : me.is_admin && !pageUser.is_admin ? (
                  <div className="flex align-middle">
                    ban:
                    <input
                      type="checkbox"
                      checked={pageUser.is_banned}
                      onChange={() => {
                        if (!isSendingUpdateBanned) handleSwitchBanned();
                      }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="ml-4">
                {pageUser.atcoder_id === "" ? (
                  <></>
                ) : (
                  <div className="flex mb-1">
                    <img src={`${headerData.user.isDarkMode ? "/svg/atcoder_logo_white.png" : "/svg/atcoder.png"}`} alt="atcoder:" width={25} height={25} />
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
                    {headerData.user.hateX ? <BsTwitter width={25} height={25} className="text-xl mx-1" /> : <BsTwitterX width={25} height={25} className="text-xl mx-1" />}
                    <Link href={`https://x.com/${pageUser.x_id}`} target="_blank">
                      {pageUser.x_id}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <nav className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white border-white" : "bg-white text-black border-black"}`} style={{ width: `${width}px` }}>
            <div className="mr-3 overflow-x-auto hidden-scrollbar">
              <ul className="flex text-base mx-auto max-w-screen-2xl px-2 md:px-8">
                <li style={{ wordBreak: "keep-all" }} className={`cursor-pointer px-2 ${navPlace === "articles" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("articles")}>
                  <span>Articles</span>
                </li>
                <li style={{ wordBreak: "keep-all" }} className={`cursor-pointer px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
                  <span>Questions</span>
                </li>
                <li style={{ wordBreak: "keep-all" }} className={`cursor-pointer px-2 ${navPlace === "problems" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("problems")}>
                  <span>Problems</span>
                </li>
                <li style={{ wordBreak: "keep-all" }} className={`cursor-pointer px-2 ${navPlace === "MyShojin" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("MyShojin")}>
                  <span>My精進ツリー</span>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <Transition appear show={isOpenReportModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsOpenReportModal(false)}>
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
                      {!me
                        ? ""
                        : canSendReport
                        ? isReportSending
                          ? "通報中です"
                          : `通報理由を書いてください(残り: ${max(200 - reportValue.length, 0)}文字)`
                        : `30分ごとにしか通報できません(残り: ${max(30 - Math.floor((new Date().getTime() - new Date(me.sent_report_at).getTime()) / 1000 / 60), 0)}分)`}
                    </Dialog.Title>
                    {isReportSending ? (
                      <>
                        <div className="flex justify-center mt-2" aria-label="読み込み中">
                          <div className="animate-ping h-4 w-4 bg-blue-600 rounded-full"></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-center">
                          <textarea
                            value={reportValue}
                            onChange={(e) => setReportValue(e.target.value)}
                            maxLength={200}
                            disabled={!canSendReport}
                            className="disabled:bg-gray-100 h-60 resize-none rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
                          />
                        </div>
                      </>
                    )}
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        className="mr-2 disabled:bg-gray-200 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          sendReportUser();
                        }}
                        disabled={isReportSending || !canSendReport || reportValue.trim() === ""}
                      >
                        <b>通報する</b>
                      </button>
                      <button
                        type="button"
                        className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsOpenReportModal(false)}
                        disabled={isReportSending}
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
      <div className={`h-full ${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-slate-100 text-black"}`}>
        {navPlace === "articles" ? (
          pages.length === 0 ? (
            <div className="m-5">記事はありません</div>
          ) : (
            <div className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-slate-100 text-black"}`}>
              {pages.map((page) => (
                <div key={returnRandomString(32)}>
                  <PageLinkBlock page={page} pageUser={pageUser} pageType="articles" me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                </div>
              ))}
            </div>
          )
        ) : navPlace === "questions" ? (
          questions.length === 0 ? (
            <div className="m-5">質問はありません</div>
          ) : (
            <div className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-slate-100 text-black"}`}>
              {questions.map((question) => (
                <div key={returnRandomString(32)}>
                  <PageLinkBlock page={question} pageUser={pageUser} pageType="questions" me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                </div>
              ))}
            </div>
          )
        ) : navPlace === "problems" ? (
          problems.length === 0 ? (
            <div className="m-5">問題集はありません</div>
          ) : (
            <div className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-slate-100 text-black"}`}>
              {problems.map((problem) => (
                <div key={returnRandomString(32)}>
                  <PageLinkBlock page={problem} pageUser={pageUser} pageType="problems" me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <p>機能作成中...🏗️</p>
            <p>少しお待ち下さい</p>
          </div>
        )}
      </div>
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
                          deletePage("articles");
                        } else if (navPlace === "questions") {
                          deletePage("questions");
                        } else if (navPlace === "problems") {
                          deletePage("problems");
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
  ) : (
    <div className="h-full">
      <p>⚠ユーザーが存在しませんでした</p>
    </div>
  );
}
