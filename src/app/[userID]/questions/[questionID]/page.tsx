"use client";
import Loading from "@/app/components/loading";
import returnRandomString from "@/modules/algo/returnRandomString";
import Lex from "@/modules/md/md";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Prism from "prismjs";
import { Fragment, useEffect, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { FaTag } from "react-icons/fa6";
import { MdDelete, MdEditNote } from "react-icons/md";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import sleep from "@/modules/sleep";
import { Menu, Transition } from "@headlessui/react";
import { IoChevronDown } from "react-icons/io5";
import DeleteCommentModal from "@/app/components/deleteCommentModal";
import UpdateCommentModal from "@/app/components/updateCommentModal";

export default function Page({ params }: { params: { userID: string; questionID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element>(<></>);
  const [userIcon, setUserIcon] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState("");
  const [mdAreaValue, setMdAreaValue] = useState("");
  const [deleteCommentID, setDeleteCommentID] = useState("");
  const [updateCommentID, setUpdateCommentID] = useState("");
  const [updateMdAreaValue, setUpdateMdAreaValue] = useState("");
  const [updateSendingMessage, setUpdateSendingMessage] = useState("");
  const [page, setPage] = useState<Question>({} as Question);
  const [tagsData, setTagsData] = useState<Tag>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUserMap, setCommentUserMap] = useState<{ [key: string]: UserList }>({} as { [key: string]: UserList });
  const [commentLikeUserMap, setCommentLikeUserMap] = useState<{ [key: string]: boolean }>({} as { [key: string]: boolean });
  const [isExist, setIsExist] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const [isLikeSending, setIsLikeSending] = useState(false);
  const [isBookmarkSending, setIsBookmarkSending] = useState(false);
  const [isCommentMarkdown, setIsCommentMarkdown] = useState(true);
  const [isCommentSending, setIsCommentSending] = useState(false);
  const [isOpenDeleteCommentModal, setIsOpenDeleteCommentModal] = useState(false);
  const [isOpenUpdateCommentModal, setIsOpenUpdateCommentModal] = useState(false);
  const [isUpdateSending, setIsUpdateSending] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [me, setMe] = useState<UserList>({} as UserList);
  const router = useRouter();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.questionID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    try {
      const fetch = async () => {
        const res = await axios.get(`/api/db/questions/exist?userID=${params.userID}&pageID=${params.questionID}`);
        if (!res.data.exist) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setPage(res.data.data as Question);
          setContent(Lex({ text: res.data.data.content }));
        }
        const [fetchUser, me] = await Promise.all([axios.get(`/api/db/users/exist?userID=${params.userID}`), axios.get(`/api/db/users/existMe`)]);
        if (!fetchUser.data.exist || !me.data.ok) {
          router.replace("/");
          return;
        }
        setUserIcon(fetchUser.data.data.icon);
        setMe(me.data.data);
        if (res.data.exist) {
          const fetchComments = await axios.get(`/api/db/comments/get?pageUserID=${params.userID}&pageID=${params.questionID}&URLType=questions&myID=${me.data.exist ? me.data.data.ID : "null"}`);
          if (!fetchComments.data.ok) {
            router.replace("/");
            return;
          }
          const fetchTags = await axios.get("/api/db/tags/get?page=1");
          fetchTags.data.data.forEach((e: TagData) => {
            setTagsData((prev) => {
              prev[e.ID] = e;
              return prev;
            });
          });
          let isLike, isBookmark;
          if (me.data.exist) {
            setIsLogin(true);
            [isLike, isBookmark] = await Promise.all([
              axios.get(`/api/db/likes/exist?myID=${me.data.data.ID}&pageUserID=${params.userID}&pageID=${params.questionID}&URLType=questions`),
              axios.get(`/api/db/bookmarks/exist?myID=${me.data.data.ID}&pageUserID=${params.userID}&pageID=${params.questionID}&URLType=questions`),
            ]);
            if (!isLike.data.ok || !isBookmark.data.ok) {
              router.replace("/");
              return;
            }
            setIsLike(isLike.data.isLiked);
            setIsBookmark(isBookmark.data.isBookmark);
          }
          setComments(fetchComments.data.data as Comment[]);
          setCommentUserMap(fetchComments.data.userMap as { [key: string]: UserList });
          setCommentLikeUserMap(fetchComments.data.likeComments as { [key: string]: boolean });
        }
        setIsLoading(false);
      };
      fetch();
    } catch (e) {
      router.replace("/");
    }
  }, [params.questionID, params.userID, router]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isExist) {
      if (me.ID === params.userID || page.isPublic) {
        document.title = `${page.title}｜TellPro`;
      } else {
        document.title = "ページが非公開です｜TellPro";
      }
    } else {
      document.title = "ページが存在しません｜TellPro";
    }
  }, [isLoading, isExist, me.ID, page.isPublic, params.userID, page.title]);

  const handleGoodButton = async () => {
    try {
      setIsLikeSending(true);
      setIsLike(!isLike);
      if (!isLike) {
        setPage({ ...page, likeCount: Number(page.likeCount) + 1 });
        await axios.post("/api/db/likes/create", {
          myID: me.ID,
          pageUserID: params.userID,
          pageID: params.questionID,
          URLType: "questions",
        });
      } else {
        setPage({ ...page, likeCount: Number(page.likeCount) - 1 });
        await axios.post("/api/db/likes/delete", {
          myID: me.ID,
          pageUserID: params.userID,
          pageID: params.questionID,
          URLType: "questions",
        });
      }
      // 連打防止用に1秒待機.
      await sleep(1000);
      setIsLikeSending(false);
    } catch (e) {
      console.log(e);
      setIsLikeSending(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarkSending(true);
      if (!isBookmark) {
        setIsBookmark(true);
        await axios.post("/api/db/bookmarks/create", {
          myID: me.ID,
          pageUserID: params.userID,
          pageID: params.questionID,
          URLType: "questions",
        });
      } else {
        setIsBookmark(false);
        await axios.post("/api/db/bookmarks/delete", {
          myID: me.ID,
          pageUserID: params.userID,
          pageID: params.questionID,
          URLType: "questions",
        });
      }
      // 連打防止用に1秒待機.
      await sleep(1000);
      setIsBookmarkSending(false);
    } catch (e) {
      console.log(e);
      setIsLikeSending(false);
    }
  };

  const handleCommentUpload = async () => {
    setIsCommentSending(true);
    if (mdAreaValue === "") {
      setSendingMessage("回答を入力してください");
      setIsCommentSending(false);
      return;
    }
    try {
      const commentID = returnRandomString(32);
      await axios.post("/api/db/comments/create", {
        ID: commentID,
        myID: me.ID,
        pageUserID: params.userID,
        pageID: params.questionID,
        URLType: "questions",
        content: mdAreaValue,
      });
      setMdAreaValue("");
      setSendingMessage("");
      setIsCommentSending(false);
      setPage({ ...page, answerCount: Number(page.answerCount) + 1 });
      setComments((prev) => [
        {
          ID: commentID,
          userID: me.ID,
          pageID: params.questionID,
          time: Date.now(),
          URLType: "questions",
          pageUserID: params.userID,
          content: mdAreaValue,
          likeCount: 0,
        } as Comment,
        ...prev,
      ]);
      setCommentLikeUserMap((prev) => {
        return {
          ...prev,
          [commentID]: false,
        };
      });
      setCommentUserMap((prev) => {
        prev[me.ID] = me;
        return prev;
      });
    } catch (e) {
      setSendingMessage("エラーが発生しました");
      console.log(e);
      setIsCommentSending(false);
    }
  };

  const handleCommentGood = async (commentID: string, pageUserID: string) => {
    try {
      setIsLikeSending(true);
      if (!commentLikeUserMap[commentID]) {
        // 回答のlikeCountを増やす.
        setCommentLikeUserMap((prev) => {
          prev[commentID] = true;
          return prev;
        });
        const newComments = comments.map((e) => {
          if (e.ID === commentID) {
            e.likeCount = Number(e.likeCount) + 1;
          }
          return e;
        });
        setComments(newComments);
        await axios.post("/api/db/likes/create", {
          myID: me.ID,
          pageUserID: pageUserID,
          pageID: commentID,
          URLType: "comments",
        });
      } else {
        // 回答のlikeCountを減らす.
        setCommentLikeUserMap((prev) => {
          prev[commentID] = false;
          return prev;
        });
        const newComments = comments.map((e) => {
          if (e.ID === commentID) {
            e.likeCount = Number(e.likeCount) - 1;
          }
          return e;
        });
        setComments(newComments);
        await axios.post("/api/db/likes/delete", {
          myID: me.ID,
          pageUserID: pageUserID,
          pageID: commentID,
          URLType: "comments",
        });
      }
      // 連打防止用に1秒待機.
      await sleep(1000);
      setIsLikeSending(false);
    } catch (e) {
      console.error(e);
      setIsLikeSending(false);
    }
  };

  const handleCommentDelete = async () => {
    try {
      setIsDeleteSending(true);
      await axios.post("/api/db/comments/delete", {
        commentID: deleteCommentID,
        userID: me.ID,
      });
      setComments(comments.filter((e) => e.ID !== deleteCommentID));
      setIsDeleteSending(false);
      setIsOpenDeleteCommentModal(false);
      setPage({ ...page, answerCount: Number(page.answerCount) - 1 });
    } catch (e) {
      console.error(e);
      setIsDeleteSending(false);
    }
  };

  const handleUpdateComment = async () => {
    try {
      setIsUpdateSending(true);
      if (updateMdAreaValue === "") {
        setUpdateSendingMessage("回答を入力してください");
        setIsUpdateSending(false);
        return;
      }
      await axios.post("/api/db/comments/update", {
        pageID: params.questionID,
        commentID: updateCommentID,
        userID: me.ID,
        content: updateMdAreaValue,
      });
      setComments(
        comments.map((e) => {
          if (e.ID === updateCommentID) {
            e.content = updateMdAreaValue;
          }
          return e;
        })
      );
      setIsUpdateSending(false);
      setIsOpenUpdateCommentModal(false);
    } catch (e) {
      console.error(e);
      setIsUpdateSending(false);
    }
  };

  // TODO:(DEV) ページの目次(MDのheaderから)を作成する.
  // TODO:(DEV) 最終ログインと比較していいねのお知らせが来るようにする.
  // TODO:(DEV) コメントに画像を添付できるようにする.
  return isLoading ? (
    <>
      <Loading title="読み込み中..." />
    </>
  ) : isExist ? (
    me.ID === params.userID || page.isPublic ? (
      <>
        <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
        <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
        <div className="mx-auto">
          <div className="flex mt-2 px-1 flex-wrap">
            {page.tags.map((e) => (
              <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
                <FaTag className="inline-flex my-auto mr-1" />
                {tagsData[e].name}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto text-base font-bold text-gray-700">
          <Link href={`/${params.userID}`} className="flex cursor-pointer">
            <img src={userIcon} alt="" width={24} height={24} className="mr-1" />
            <u>@{params.userID}</u>
          </Link>
        </div>
        <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5 rounded">
          {content}
          {/* 回答 */}
          <div className="mt-10 flex flex-col">
            <b>回答({page.answerCount})</b>
            <hr />
            {isLogin ? (
              <>
                <div className="bg-white">
                  <button
                    onClick={() => setIsCommentMarkdown(true)}
                    className={`${isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
                  >
                    編集(Markdown)
                  </button>
                  <button
                    onClick={() => setIsCommentMarkdown(false)}
                    className={`${!isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
                  >
                    プレビュー
                  </button>
                </div>
                {isCommentMarkdown ? (
                  <textarea
                    className={`border ${sendingMessage === "回答を入力してください" && mdAreaValue === "" ? "border-red-500" : ""} outline-1 resize-none rounded h-72 mt-2 outline-sky-400 p-1 w-full`}
                    placeholder="回答(Markdown)"
                    onChange={(e) => setMdAreaValue(e.target.value)}
                    value={mdAreaValue}
                  ></textarea>
                ) : (
                  <div>
                    <div className="overflow-y-scroll h-72 mt-2 border outline-1 outline-sky-400 p-1 w-full">{Lex({ text: mdAreaValue })}</div>
                  </div>
                )}
                <div>
                  <b className="ml-2 text-red-600">{sendingMessage}</b>
                  <br />
                  <button
                    disabled={isCommentSending}
                    onClick={handleCommentUpload}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 w-28 px-4 rounded my-3 border-r"
                  >
                    投稿する
                  </button>
                </div>
              </>
            ) : (
              <div className="h-32 mt-2 border outline-1 outline-sky-400 text-center w-full rounded bg-gray-200 p-10">
                <b>ログインをしてコミュニティに参加しましょう！</b>
                <br />
                <button>ログインボタン</button>
              </div>
            )}
            <hr />
            {comments.length === 0 ? (
              <p>このページに回答はありません</p>
            ) : (
              <div>
                {comments.map((e) => (
                  <div key={returnRandomString(64)}>
                    <div className="p-2">
                      <div className="flex justify-between">
                        <Link href={`/${e.userID}`}>
                          <img src={commentUserMap[e.userID].icon} width={30} height={30} alt="" className="inline" />
                          <b className="ml-2">@{e.userID}</b>
                        </Link>
                        {e.userID === me.ID ? (
                          <Menu as="div" className="relative inline-block">
                            <div>
                              <Menu.Button className="inline-flex justify-center rounded-m py-2 text-sm font-medium text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                                <IoChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                              </Menu.Button>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items
                                className={`absolute right-0 ${
                                  e.userID === me.ID ? "mt-[-120px]" : "mt-[-80px]"
                                } w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none`}
                              >
                                <div className="px-1 py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setUpdateMdAreaValue(e.content);
                                          setUpdateCommentID(e.ID);
                                          setIsOpenUpdateCommentModal(true);
                                        }}
                                        className={`${active ? "bg-red-100" : ""} text-gray-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                      >
                                        <MdEditNote className="mr-2 h-5 w-5 text-gray-600" aria-hidden="true" />
                                        編集
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setDeleteCommentID(e.ID);
                                          setIsOpenDeleteCommentModal(true);
                                        }}
                                        className={`${active ? "bg-red-100" : ""} text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                      >
                                        <MdDelete className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div>{Lex({ text: e.content })}</div>
                      <div className={`text-center flex`}>
                        <button
                          className={`cursor-pointer w-10 flex flex-col items-center h-10 justify-center bg-white rounded-full border-gray-300 border`}
                          title="いいね"
                          onClick={() => handleCommentGood(e.ID, e.pageUserID)}
                          disabled={isLikeSending}
                        >
                          {commentLikeUserMap[e.ID] ? <FaHeart className="inline-flex text-sm text-red-500" /> : <FaRegHeart className="inline-flex text-sm text-red-500" />}
                        </button>
                        <b className="ml-1 my-auto">{Number(e.likeCount)}</b>
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="h-10 lg:h-0 w-full"></div>
        </div>
        <div className="fixed right-0 p-1 w-full lg:w-auto bottom-0 bg-slate-100 lg:right-2 lg:bottom-2 lg:bg-inherit">
          <div className="flex flex-row lg:flex-col justify-center lg:justify-normal h-10 lg:h-auto">
            <div className={`text-center lg:mr-2 flex lg:block mx-2`}>
              <button
                className={`cursor-pointer w-10 lg:w-16 flex flex-col items-center h-10 lg:h-16 justify-center bg-white rounded-full border-gray-300 border`}
                title="いいね"
                onClick={handleGoodButton}
                disabled={isLikeSending}
              >
                {isLike ? <FaHeart className="inline-flex text-sm lg:text-3xl text-red-500" /> : <FaRegHeart className="inline-flex text-sm lg:text-3xl text-red-500" />}
              </button>
              <b className="ml-1 my-auto">{Number(page.likeCount)}</b>
            </div>
            <div className="text-center mb-2 lg:mr-2 mx-2">
              <button
                className={`cursor-pointer flex items-center justify-center w-10 lg:w-16 h-10 lg:h-16 bg-white rounded-full border-gray-300 border`}
                title="ブックマーク"
                onClick={handleBookmark}
                disabled={isBookmarkSending}
              >
                {isBookmark ? <FaBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" /> : <FaRegBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" />}
              </button>
            </div>
            <Link title="編集" className={`mx-2 cursor-pointer ${me.ID === params.userID ? "" : "hidden"}`} href={`/${params.userID}/questions/${params.questionID}/edit`}>
              <div className="flex items-center justify-center w-10 h-10 lg:w-16 lg:h-16 bg-white rounded-full border-gray-300 border">
                <MdEditNote className="inline-flex text-base lg:text-4xl" />
              </div>
            </Link>
          </div>
        </div>
        <DeleteCommentModal
          handleCommentDelete={handleCommentDelete}
          isDeleteSending={isDeleteSending}
          isOpenDeleteCommentModal={isOpenDeleteCommentModal}
          stateFunc={{ setIsOpenDeleteCommentModal }}
        />
        <UpdateCommentModal
          handleUpdateComment={handleUpdateComment}
          isUpdateSending={isUpdateSending}
          isOpenUpdateCommentModal={isOpenUpdateCommentModal}
          updateMdAreaValue={updateMdAreaValue}
          updateSendingMessage={updateSendingMessage}
          stateFunc={{ setIsOpenUpdateCommentModal, setUpdateMdAreaValue }}
        />
      </>
    ) : (
      // ページが非公開の時.
      <>
        <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
          <div className="flex justify-center">
            <BsExclamationCircle className="text-green-500 text-6xl" />
          </div>
          <p>ページが非公開です</p>
          <p className="text-sm pt-5">
            <span>(</span>
            <Link href="/" className="text-blue-300">
              こちら
            </Link>
            <span>からホームに戻ることが出来ます)</span>
          </p>
        </div>
      </>
    )
  ) : (
    // ページが存在しない時.
    <>
      <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p>ページが存在しません</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </>
  );
}
