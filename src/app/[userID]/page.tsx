"use client";
import { Fragment, useContext, useEffect, useState } from "react";
import Loading from "../components/loading";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import returnRandomString from "@/modules/algo/returnRandomString";
import data from "@/modules/tags.json";
import Link from "next/link";
import getImageBase64 from "@/modules/network/getImageBase64";
import { UserContext } from "../components/providers/userProvider";
import { MdEditNote, MdKeyboardArrowDown } from "react-icons/md";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { FaTrashAlt } from "react-icons/fa";

// TODO:記事のエクスポートを実装する
// TODO:10個ずつページを表示する
export default function Page({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [isOpenDeletePageModal, setIsOpenDeletePageModal] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const [pages, setPages] = useState<Page[]>([] as Page[]);
  const [navPlace, setNavPlace] = useState("pages");
  const [deletePageID, setDeletePageID] = useState("");
  const router = useRouter();
  const me = useContext(UserContext);
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

  const deletePage = async () => {
    setIsDeleteSending(true);
    if (!me) return;
    await axios.post("/api/db/pages/delete", {
      pageID: deletePageID,
      pageUserID: params.userID,
      userID: me.ID,
    });
    setPages(pages.filter((e) => e.ID !== deletePageID));
    setIsDeleteSending(false);
    setIsOpenDeletePageModal(false);
  };

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
                <div key={returnRandomString(32)}>
                  <div className="border-gray-200">
                    <div className="bg-white transition border-b relative max-w-[60rem] mt-3 min-h-40 rounded-lg break-words mx-auto">
                      <Link href={`/${params.userID}/pages/${page.ID}`} prefetch className="min-h-40 block">
                        <div className="flex p-5">
                          <div>
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
                        </div>
                      </Link>
                      {/* ページの管理者なら表示 */}
                      <div className={`${me?.ID === params.userID ? "" : "hidden"} absolute top-3 right-3`}>
                        <div className="flex">
                          <Link title="編集" className={`cursor-pointer z-10`} href={`/${params.userID}/pages/${page.ID}/edit`}>
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 mr-1 hover:bg-blue-200 transition rounded-full">
                              <MdEditNote className="inline-flex text-xl" />
                            </div>
                          </Link>
                          {/* その他メニュー */}
                          <Menu as="div" className="bg-blue-100 z-10 flex items-center justify-center w-8 h-8 hover:bg-blue-200 font-bold py-1 px-2 rounded-full">
                            <Menu.Button>
                              <MdKeyboardArrowDown className="text-xl text-black" />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="transform translate-y-14 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <div className="px-1 py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button className={`${active ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}>エクスポート</button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setIsOpenDeletePageModal(true);
                                          setDeletePageID(page.ID);
                                        }}
                                        className={`${active ? "bg-sky-200" : "text-gray-900"} text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                      >
                                        <FaTrashAlt className="mr-2" />
                                        削除
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Transition appear show={isOpenDeletePageModal || isDeleteSending} as={Fragment}>
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
                            本当に削除しますか？
                          </Dialog.Title>
                          <div className="mt-2 text-center">
                            <p className="text-sm text-gray-500">この操作はもとに戻せません</p>
                          </div>
                          <div className="mt-4 flex justify-center">
                            <button
                              type="button"
                              className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={() => {
                                deletePage();
                              }}
                            >
                              <b>削除する</b>
                            </button>
                            <button
                              type="button"
                              className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={() => setIsOpenDeletePageModal(false)}
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
