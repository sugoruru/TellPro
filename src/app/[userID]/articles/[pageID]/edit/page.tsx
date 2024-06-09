"use client";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Lex from "@/modules/md/md";
import Prism from "prismjs";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { FaTag } from "react-icons/fa6";
import { IoMdImages } from "react-icons/io";
import React from "react";
import TagsDialog from "@/app/components/articles/tagsDialog";
import returnRandomString from "@/modules/algo/returnRandomString";
import { Page } from "@/types/page";
import ImageUploader from "@/app/components/articles/imageUploader";

const MakeNewPage = ({ params }: { params: { userID: string; pageID: string } }) => {
  const { status } = useSession();
  const [existUser, setExistUser] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isPageExist, setIsPageExist] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpenImageUpload, setIsOpenImageUpload] = useState(false);
  const [isOpenTagEditor, setIsOpenTagEditor] = useState(false);
  const [sendingImageMessage, setSendingImageMessage] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [mdAreaValue, setMdAreaValue] = useState("");
  const [prevIcon, setPrevIcon] = useState("");
  const [title, setTitle] = useState("");
  const [sendingMessage, setSendingMessage] = useState("");
  const [tagSearchValue, setTagSearchValue] = useState<string>("");
  const router = useRouter();
  const [content, setContent] = useState<JSX.Element>(<></>);
  const lastTagsAPICalled = useRef(0);

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    window.addEventListener("beforeunload", onBeforeunloadHandler);
    return () => {
      window.removeEventListener("beforeunload", onBeforeunloadHandler);
    };
  }, [router, params.pageID]);

  const onBeforeunloadHandler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          // 並列処理でユーザーとページの存在確認を行う.
          const [fetchMe, fetchPage] = await Promise.all([axios.get(`/api/db/users/existMe`), axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}&pageType=articles`)]);
          if (!fetchMe.data.exist || !fetchMe.data.data) {
            signOut();
            router.replace("/");
          } else {
            const tempUser = fetchMe.data.data as UserPublic;
            if (tempUser) {
              setPrevIcon(tempUser.icon);
              if (params.userID === tempUser.id) {
                setCanEdit(true);
                if (fetchPage.data.exist) {
                  const tempPage = fetchPage.data.data as Page;
                  setMdAreaValue(tempPage.content);
                  setTitle(tempPage.title);
                  setTagSearchValue(tempPage.tags.join(" "));
                  setIsPublic(tempPage.is_public);
                  setIsPageExist(true);
                }
              }
            } else {
              router.replace("/");
            }
            setExistUser(true);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          router.replace("/");
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router, params.pageID, params.userID]);

  useEffect(() => {
    if (status == "loading" || !existUser) {
      document.title = "Loading...｜TellPro";
    } else if (canEdit) {
      document.title = title === "" ? "untitled" : title;
    } else {
      document.title = "編集権限がありません｜TellPro";
    }
  }, [existUser, canEdit, title, status]);

  useEffect(() => {
    if (!isMarkdown) {
      setContent(Lex({ text: mdAreaValue }));
    }
  }, [isMarkdown, mdAreaValue]);

  const handlePageUpload = async () => {
    setIsSending(true);
    setSendingMessage("");
    if (title === "") {
      setSendingMessage("タイトルを入力してください");
      setIsSending(false);
      return;
    }
    if (mdAreaValue.length > 20000) {
      setSendingMessage("記事のサイズが大きすぎます");
      setIsSending(false);
      return;
    }
    if (mdAreaValue === "") {
      setSendingMessage("本文を入力してください");
      setIsSending(false);
      return;
    }
    if (isPageExist) {
      try {
        await axios.post("/api/db/pages/update", {
          ID: params.pageID,
          userID: params.userID,
          title: title,
          content: mdAreaValue,
          tags: tagSearchValue
            .trim()
            .split(" ")
            .filter((e) => e !== ""),
          isPublic: isPublic,
          pageType: "articles",
        });
        router.push(`/${params.userID}/articles/${params.pageID}`);
      } catch (e) {
        setSendingMessage("エラーが発生しました");
        setIsSending(false);
      }
    } else {
      try {
        await axios.post("/api/db/pages/create", {
          ID: params.pageID,
          userID: params.userID,
          title: title,
          content: mdAreaValue,
          tags: tagSearchValue
            .trim()
            .split(" ")
            .filter((e) => e !== ""),
          isPublic: isPublic,
          pageType: "articles",
        });
        router.push(`/${params.userID}/articles/${params.pageID}`);
      } catch (e) {
        setSendingMessage("エラーが発生しました");
        setIsSending(false);
      }
    }
  };
  const handleSetTagValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 空白で5つまでのタグを設定する.
    if (e.target.value.split(" ").length > 5) return;
    setTagSearchValue(e.target.value);
  };

  const TagsDialogMemo = React.memo(TagsDialog);

  return status == "loading" || !existUser ? (
    // ロード中またはユーザーが存在しない場合.
    <></>
  ) : canEdit ? (
    // 編集権限がある場合.
    <div className={`grow ${isMarkdown ? "bg-white" : "bg-slate-100"} flex-col flex h-screen`}>
      <div className="bg-white">
        <button onClick={() => setIsMarkdown(true)} className={`${isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}>
          編集(Markdown)
        </button>
        <button onClick={() => setIsMarkdown(false)} className={`${!isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}>
          プレビュー
        </button>
      </div>
      {isMarkdown ? (
        // マークダウンタブの場合.
        <>
          {/* タイトル */}
          <div className="border-b w-full p-3">
            <input
              type="text"
              className={`border ${sendingMessage === "タイトルを入力してください" && title === "" ? "border-red-500" : ""} outline-1 outline-sky-400 rounded p-1 h-10 text-xl w-full`}
              placeholder="タイトル"
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setTitle(e.target.value);
                }
              }}
              value={title}
            />
          </div>
          {/* 本文・公開ボタン・設定ボタン */}
          <div className="grow w-full p-3">
            <textarea
              className={`border ${sendingMessage === "本文を入力してください" && mdAreaValue === "" ? "border-red-500" : ""} outline-1 resize-none rounded h-5/6 outline-sky-400 p-1 w-full`}
              placeholder="本文(Markdown)"
              onChange={(e) => setMdAreaValue(e.target.value)}
              value={mdAreaValue}
              id="mdArea"
            ></textarea>
            <div className="justify-end flex mt-2">
              <button
                onClick={() => setIsOpenTagEditor(true)}
                title="タグの設定"
                className="bg-slate-400 leading-10 transition text-center hover:bg-slate-500 disabled:bg-slate-400 text-white font-bold text-2xl rounded-full mx-2 h-10 w-10"
              >
                <FaTag className="inline-flex" />
              </button>
              <button
                onClick={() => {
                  setIsOpenImageUpload(true);
                  setSendingImageMessage("");
                }}
                title="画像をアップロード"
                className="bg-slate-400 leading-10 transition text-center hover:bg-slate-500 disabled:bg-slate-400 text-white font-bold text-2xl rounded-full mx-2 h-10 w-10"
              >
                <IoMdImages className="inline-flex" />
              </button>
              <ImageUploader
                mdAreaValue={mdAreaValue}
                sendingImageMessage={sendingImageMessage}
                isOpenImageUpload={isOpenImageUpload}
                setIsOpenImageUpload={setIsOpenImageUpload}
                setMdAreaValue={setMdAreaValue}
                setSendingImageMessage={setSendingImageMessage}
              />
              {/* tag editor */}
              <Transition appear show={isOpenTagEditor} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsOpenTagEditor(false)}>
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
                        <Dialog.Panel className="w-full text-center max-w-md transform overflow-hidden rounded-2xl bg-white p-3 align-middle shadow-xl transition-all">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            タグの編集(5つまで)
                          </Dialog.Title>
                          <input value={tagSearchValue} onChange={handleSetTagValue} type="text" className="border w-full outline-sky-400" placeholder="タグを検索(半角スペース区切り)" />
                          <TagsDialogMemo setTagSearchValue={setTagSearchValue} tagSearchValue={tagSearchValue} lastAPICalled={lastTagsAPICalled} />
                          <button
                            type="button"
                            className="mx-2 mt-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={() => setIsOpenTagEditor(false)}
                          >
                            決定
                          </button>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
              {/* save button */}
              <button disabled={isSending} onClick={handlePageUpload} className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 px-4 rounded-l border-r">
                {isPublic ? "公開する" : "下書き"}
              </button>
              {/* 公開/非公開選択ボタン */}
              <Menu as="div" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-r border-l">
                <Menu.Button>
                  <MdKeyboardArrowDown className="text-xl" />
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
                  <Menu.Items className="transform -translate-y-36 -translate-x-3 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active || isPublic ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setIsPublic(true)}
                          >
                            公開する
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active || !isPublic ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setIsPublic(false)}
                          >
                            下書き
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </>
      ) : (
        // プレビュータブの場合.
        <>
          <div className="text-center text-4xl font-bold text-gray-700 my-5">{title === "" ? "untitled" : title}</div>
          <div className="text-center text-base font-bold text-gray-700">公開日時:{new Date().toISOString().split("T")[0]}</div>
          <div className="mx-auto">
            <div className="flex mt-2 px-1 flex-wrap">
              {tagSearchValue.split(" ").map((e) =>
                e === "" ? (
                  <Fragment key={returnRandomString(32)}></Fragment>
                ) : (
                  <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
                    <FaTag className="inline-flex my-auto mr-1" />
                    {e}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="mx-auto text-base font-bold text-gray-700">
            <div
              className="flex cursor-pointer"
              onClick={() => {
                if (confirm("データの保存はされませんがページを遷移しますか？")) router.replace(`/${params.userID}`);
              }}
            >
              <img src={prevIcon} alt="" width={24} height={24} className="mr-1" />
              <u>@{params.userID}</u>
            </div>
          </div>
          <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5">{content}</div>
        </>
      )}
    </div>
  ) : (
    // 編集権限が無い場合.
    <div className="min-h-screen bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
      <div className="flex justify-center">
        <BsExclamationCircle className="text-green-500 text-6xl" />
      </div>
      <p>編集権限がありません</p>
      <p className="text-sm pt-5">
        <span>(</span>
        <Link href="/" className="text-blue-300">
          こちら
        </Link>
        <span>からホームに戻ることが出来ます)</span>
      </p>
    </div>
  );
};

export default MakeNewPage;
