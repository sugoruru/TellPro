"use client";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Lex from "@/modules/md/md";
import Prism from "prismjs";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { FaTag } from "react-icons/fa6";
import { IoMdImages } from "react-icons/io";
import Image from "next/image";
import handleImageChange from "@/modules/handle/handleImageChange";
import imageSendToImgur from "@/modules/network/imageSendToImgur";
import React from "react";
import TagsDialog from "@/app/components/tagsDialog";
import data from "@/modules/tags.json";
import returnRandomString from "@/modules/algo/returnRandomString";
import getImageBase64 from "@/modules/network/getImageBase64";

const MakeNewPage = ({ params }: { params: { userID: string; pageID: string } }) => {
  const { status } = useSession();
  const [existUser, setExistUser] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isPageExist, setIsPageExist] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpenImageUpload, setIsOpenImageUpload] = useState(false);
  const [isOpenTagEditor, setIsOpenTagEditor] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [sendingImageMessage, setSendingImageMessage] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [mdAreaValue, setMdAreaValue] = useState("");
  const [prevIcon, setPrevIcon] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [title, setTitle] = useState("");
  const [sendingMessage, setSendingMessage] = useState("");
  const [imageValue, setImageValue] = useState<string>("");
  const [tags, setTags] = useState<Number[]>([]);
  const router = useRouter();
  const [content, setContent] = useState<JSX.Element>(<></>);
  const tagJSON: { [key: string]: any } = data;

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const fetchUser = await axios.get(`/api/db/users/existMe`);
          const fetchPage = await axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}`);
          if (!fetchUser.data.exist || !fetchUser.data.data) {
            signOut();
            router.replace("/");
          } else {
            setExistUser(true);
            const tempUser = fetchUser.data.data as User;
            if (tempUser) {
              setPrevIcon(await getImageBase64(tempUser.icon));
              if (params.userID === tempUser.ID) {
                setCanEdit(true);
                if (fetchPage.data.exist) {
                  const tempPage = fetchPage.data.data as Page;
                  setMdAreaValue(tempPage.content);
                  setTitle(tempPage.title);
                  setTags(tempPage.tags.map((e) => Number(e)));
                  setIsPublic(tempPage.isPublic);
                  setIsPageExist(true);
                }
              }
            } else {
              router.replace("/");
            }
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
  }, [status]);

  useEffect(() => {
    if (!isMarkdown) {
      setContent(Lex({ text: mdAreaValue }));
    }
  }, [isMarkdown]);

  const handleImageUpload = async () => {
    setIsSendingImage(true);
    if (selectedImage !== "") {
      const imageUrl = await imageSendToImgur(selectedImage, setSendingImageMessage);
      const imageTag = `![image](${imageUrl})`;
      setMdAreaValue(mdAreaValue + imageTag + "\n");
      setSelectedImage("");
    }
    setIsSendingImage(false);
    setIsOpenImageUpload(false);
  };

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
          tags: tags,
          isPublic: isPublic,
        });
        router.push(`/${params.userID}/pages/${params.pageID}`);
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
          tags: tags,
          isPublic: isPublic,
        });
        router.push(`/${params.userID}/pages/${params.pageID}`);
      } catch (e) {
        setSendingMessage("エラーが発生しました");
        setIsSending(false);
      }
    }
  };
  const TagsDialogMemo = React.memo(TagsDialog);

  // TODO: タグつけのサーチ機能の作成
  return status == "loading" || !existUser ? (
    // ロード中またはユーザーが存在しない場合.
    <>
      <title>TellPro｜ロード中...</title>
      <Loading />
    </>
  ) : canEdit ? (
    // 編集権限がある場合.
    <div className={`grow ${isMarkdown ? "bg-white" : "bg-slate-100"} flex-col flex h-full`}>
      <title>{title === "" ? "untitled" : title}</title>
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
              {/* image uploader */}
              <Transition appear show={isOpenImageUpload || isSendingImage} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsOpenImageUpload(false)}>
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
                        <Dialog.Panel className="w-full text-center max-w-md transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            画像のアップロード
                          </Dialog.Title>
                          <div className="max-sm:block max-md:flex">
                            <div className="rounded-md border border-indigo-500 bg-gray-50 p-4 shadow-md hover:shadow-xl transition w-full">
                              <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="text-gray-600 font-medium">Upload file</span>
                              </label>
                              <input
                                value={imageValue}
                                onClick={() => setImageValue("")}
                                onChange={async (e) => setSelectedImage(await handleImageChange(e))}
                                id="upload"
                                type="file"
                                className="hidden"
                                disabled={isSending}
                                accept=".jpg, .jpeg, .png"
                              />
                            </div>
                            <Image
                              src={selectedImage == "" ? "/svg/userIcon.svg" : selectedImage}
                              className={`w-full h-auto mx-auto mt-5 ${selectedImage === "" ? "hidden" : ""}`}
                              alt=""
                              width={150}
                              height={150}
                            />
                          </div>
                          <p className="mt-4 text-red-900 font-bold">{sendingImageMessage}</p>
                          <button
                            type="button"
                            className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            onClick={() => setIsOpenImageUpload(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={handleImageUpload}
                          >
                            Send
                          </button>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
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
                          <TagsDialogMemo tags={tags} setTags={setTags} />
                          <div className="flex mt-2 px-1 flex-wrap">
                            {tags.map((e) => (
                              <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-400" key={returnRandomString(32)}>
                                <FaTag className="inline-flex my-auto mr-1" />
                                {tagJSON[String(e)]}
                              </div>
                            ))}
                          </div>
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
              <button disabled={isSending} onClick={handlePageUpload} className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 px-4 rounded-l border-r">
                {isPublic ? "公開する" : "下書き"}
              </button>
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
              {tags.map((e) => (
                <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
                  <FaTag className="inline-flex my-auto mr-1" />
                  {tagJSON[String(e)]}
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto text-base font-bold text-gray-700">
            <div
              className="flex cursor-pointer"
              onClick={() => {
                if (confirm("データの保存はされませんがページを遷移しますか？")) router.replace(`/${params.userID}`);
              }}
            >
              <Image src={prevIcon} alt="" width={24} height={24} className="mr-1" priority />
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
