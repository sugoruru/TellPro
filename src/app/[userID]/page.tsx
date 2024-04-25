"use client";
import { Fragment, useContext, useEffect, useState } from "react";
import Loading from "../components/loading";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import returnRandomString from "@/modules/algo/returnRandomString";
import getImageBase64 from "@/modules/network/getImageBase64";
import { UserContext } from "../components/providers/userProvider";
import { Dialog, Transition } from "@headlessui/react";
import sleep from "@/modules/sleep";
import LinkBlock from "../components/linkBlock";

// TODO:記事のエクスポートを実装する
// TODO:10個ずつページを表示する
export default function Page({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [isOpenDeletePageModal, setIsOpenDeletePageModal] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [pageUser, setUser] = useState<User>({} as User);
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [navPlace, setNavPlace] = useState("pages");
  const [deletePageID, setDeletePageID] = useState("");
  const router = useRouter();
  const me = useContext(UserContext);

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

  const deletePage = async () => {
    setIsDeleteSending(true);
    if (!me) return;
    await axios.post("/api/db/pages/delete", {
      pageID: deletePageID,
      pageUserID: params.userID,
      userID: me.ID,
    });
    setPages(pages.filter((e) => e.ID !== deletePageID));
    setIsOpenDeletePageModal(false);
    // 削除ボタン連打防止.
    await sleep(1000);
    setIsDeleteSending(false);
  };

  return isLoading ? (
    <>
      <title>Loading...｜TellPro</title>
      <Loading />
    </>
  ) : isExist ? (
    <>
      <div className="mb-2">
        <div className="bg-white">
          <div className="p-5 md:flex sm:block">
            <Image alt={pageUser.username} src={pageUser.icon} width={100} height={100} priority className="md:mx-5" />
            <div>
              <div>
                <b>{pageUser.username}</b>
              </div>
              <div>{pageUser.statusMessage}</div>
              <div>
                <span>
                  <b>{Number(pageUser.answerScore) + Number(pageUser.pageScore)}</b> Scores
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
        </div>
        <div className="bg-slate-100">
          {navPlace === "pages" ? (
            <div className="bg-slate-100">
              {pages.map((page) => (
                <div key={returnRandomString(32)}>
                  <LinkBlock page={page} pageUser={pageUser} me={me} stateFunctions={{ setIsOpenDeletePageModal, setDeletePageID }} />
                </div>
              ))}
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
                                deletePage();
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
