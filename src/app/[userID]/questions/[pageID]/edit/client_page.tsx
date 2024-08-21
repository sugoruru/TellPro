"use client";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Menu, Transition } from "@headlessui/react";
import Lex from "@/modules/md/md";
import Prism from "prismjs";
import { FaTag } from "react-icons/fa6";
import { IoMdImages } from "react-icons/io";
import React from "react";
import TagsDialog from "@/app/components/pages/pages/tagsDialog";
import returnRandomString from "@/modules/algo/returnRandomString";
import template from "@/modules/other/questionTemplate";
import { Page } from "@/types/page";
import ImageUploader from "@/app/components/pages/main/imageUploader";
import { UserPublic } from "@/types/user";
import { BiCopyAlt } from "react-icons/bi";
import { useGetWindowSize } from "@/app/components/hooks/useGetWindowSize";
import { useTagsContext } from "@/app/components/hooks/tagsContext";
import handlePageUpload from "@/modules/handle/handlePageUpload";
import HaveNoAuthToEdit from "@/app/components/pages/pages/haveNoAuthToEdit";
import { UserContext } from "@/app/components/providers/userProvider";

const MakeNewQuestion = ({ params }: { params: { userID: string; pageID: string } }) => {
  const { status } = useSession();
  const [existUser, setExistUser] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isPageExist, setIsPageExist] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpenImageUpload, setIsOpenImageUpload] = useState(false);
  const [sendingImageMessage, setSendingImageMessage] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [realTimePreview, setRealTimePreview] = useState(false);
  const [mdAreaValue, setMdAreaValue] = useState(template);
  const [prevIcon, setPrevIcon] = useState("");
  const [title, setTitle] = useState("");
  const [sendingMessage, setSendingMessage] = useState("");
  const router = useRouter();
  const [content, setContent] = useState<JSX.Element>(<></>);
  const { width } = useGetWindowSize();
  const { handleSetIsOpenTagEditor, tagSearchValue, setTagSearchValue } = useTagsContext();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    setTagSearchValue("");
    window.addEventListener("beforeunload", onBeforeunloadHandler);
    return () => {
      window.removeEventListener("beforeunload", onBeforeunloadHandler);
    };
  }, [router, params.pageID, setTagSearchValue]);

  const onBeforeunloadHandler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          // 並列処理でユーザーとページの存在確認を行う.
          const [fetchMe, fetchQuestion] = await Promise.all([axios.get(`/api/db/users/existMe`), axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}&pageType=questions`)]);
          if (!fetchMe.data.exist || !fetchMe.data.data) {
            signOut();
            router.replace("/");
          } else {
            const tempUser = fetchMe.data.data as UserPublic;
            if (tempUser) {
              setPrevIcon(tempUser.icon);
              if (params.userID === tempUser.id) {
                setCanEdit(true);
                if (fetchQuestion.data.exist) {
                  const tempQuestion = fetchQuestion.data.data as Page;
                  setMdAreaValue(tempQuestion.content);
                  setTitle(tempQuestion.title);
                  setTagSearchValue(tempQuestion.tags.join(" "));
                  setIsPublic(tempQuestion.is_public);
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
  }, [status, router, params.pageID, params.userID, setTagSearchValue]);

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
      setContent(Lex(mdAreaValue));
    }
  }, [isMarkdown, mdAreaValue]);

  return status == "loading" || !existUser ? (
    // ロード中またはユーザーが存在しない場合.
    <div className="h-full"></div>
  ) : canEdit ? (
    // 編集権限がある場合.
    <div className={`grow ${isMarkdown ? "bg-white" : "bg-slate-100"} dark:${isMarkdown ? "bg-neutral-800" : "bg-gray-800"} flex-col flex h-[calc(100vh-80px)]`}>
      <div className={`bg-white dark:bg-neutral-800`}>
        <button
          onClick={() => setIsMarkdown(true)}
          className={`${isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} ${
            isMarkdown ? "dark:text-gray-100 dark:border-b-2" : "dark:text-white"
          } hover:text-gray-800 dark:hover:text-gray-300 text-sm font-bold py-2 px-4 border-blue-500`}
        >
          編集(Markdown)
        </button>
        <button
          onClick={() => setIsMarkdown(false)}
          className={`${!isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} dark:${
            !isMarkdown ? "text-gray-100 dark:border-b-2" : "text-white"
          } hover:text-gray-800 dark:hover:text-gray-300 text-sm font-bold py-2 px-4 border-blue-500`}
        >
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
              className={`border ${
                sendingMessage === "タイトルを入力してください" && title === "" ? "border-red-500" : ""
              } outline-1 outline-sky-400 rounded p-1 h-10 text-xl w-full bg-white text-black dark:bg-gray-700 dark:text-white`}
              placeholder="タイトル"
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTitle(e.target.value);
                }
              }}
              value={title}
            />
          </div>
          {/* 本文・公開ボタン・設定ボタン */}
          <div className="grow w-full p-3">
            <div className="h-5/6 flex w-full">
              <div className="relative w-full h-full">
                {width && width > 1042 && (
                  <>
                    <div className="absolute right-0 mx-6 my-2 text-3xl cursor-pointer">
                      <BiCopyAlt
                        className={`absolute right-0 mx-6 my-2 text-3xl cursor-pointer text-black dark:text-white`}
                        title="簡易リアルタイムプレビュー"
                        onClick={() => {
                          setRealTimePreview(!realTimePreview);
                        }}
                      />
                    </div>
                  </>
                )}
                <textarea
                  className={`border ${
                    sendingMessage === "本文を入力してください" && mdAreaValue === "" ? "border-red-500" : ""
                  } h-full outline-1 resize-none rounded outline-sky-400 p-1 w-full bg-white text-black dark:bg-gray-700 dark:text-white`}
                  placeholder="本文(Markdown)"
                  onChange={(e) => setMdAreaValue(e.target.value)}
                  value={mdAreaValue}
                  id="mdArea"
                />
              </div>
              {realTimePreview && width && width > 1042 ? (
                <div className="relative w-full break-all overflow-y-scroll">
                  <div className="absolute w-full bg-white min-h-full">{Lex(mdAreaValue)}</div>
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="justify-end flex mt-2">
              <button
                onClick={() => handleSetIsOpenTagEditor(true)}
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
              <TagsDialog />
              {/* save button */}
              <button
                disabled={isSending}
                onClick={() => {
                  handlePageUpload({
                    setIsSending,
                    setSendingMessage,
                    title,
                    mdAreaValue,
                    tagSearchValue,
                    isPublic,
                    isPageExist,
                    params,
                    pageType: "questions",
                    router,
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 px-4 rounded-l border-r"
              >
                {isPublic ? "公開する" : "下書き"}
              </button>
              {/* 公開/非公開選択ボタン */}
              <Menu as="div" className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-r border-l flex align-middle">
                <Menu.Button>
                  <div className="py-1 px-2">
                    <MdKeyboardArrowDown className="text-xl" />
                  </div>
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
                  <Menu.Items className="transform -translate-y-36 -translate-x-3 absolute right-0 mt-10 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
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
        <div className={`w-lvw bg-slate-100 dark-bg-zinc-800`}>
          <div className={`text-center text-4xl font-bold my-5 text-gray-700 dark:text-white`}>{title === "" ? "untitled" : title}</div>
          <div className={`text-center text-base font-bold text-gray-700 dark:text-white`}>公開日時:{new Date().toISOString().split("T")[0]}</div>
          <div className="flex justify-center">
            <div className="mt-2 px-1 flex-wrap flex">
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
          <div className={`flex justify-center mx-auto text-base font-bold text-gray-700 dark:text-white`}>
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
          <div className="lg:w-3/5 w-lvw bg-white mx-auto my-3 p-5">{content}</div>
        </div>
      )}
    </div>
  ) : (
    // 編集権限が無い場合.
    <HaveNoAuthToEdit />
  );
};

export default MakeNewQuestion;
