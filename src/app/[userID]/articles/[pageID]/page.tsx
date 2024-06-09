"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import Lex from "@/modules/md/md";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Prism from "prismjs";
import { Fragment, useEffect, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { FaTag } from "react-icons/fa6";
import { MdEditNote } from "react-icons/md";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import sleep from "@/modules/sleep";
import DeleteCommentModal from "@/app/components/articles/deleteCommentModal";
import UpdateCommentModal from "@/app/components/articles/updateCommentModal";
import { Page } from "@/types/page";
import { Comment } from "@/types/comment";
import SendComment from "@/app/components/articles/sendComment";

export default function Articles({ params }: { params: { userID: string; pageID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element>(<></>);
  const [userIcon, setUserIcon] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState("");
  const [mdAreaValue, setMdAreaValue] = useState("");
  const [deleteCommentID, setDeleteCommentID] = useState("");
  const [updateCommentID, setUpdateCommentID] = useState("");
  const [updateMdAreaValue, setUpdateMdAreaValue] = useState("");
  const [updateSendingMessage, setUpdateSendingMessage] = useState("");
  const [page, setPage] = useState<Page>({} as Page);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUserMap, setCommentUserMap] = useState<{ [key: string]: UserPublic }>({} as { [key: string]: UserPublic });
  const [likeComments, setLikeComments] = useState<{ [key: string]: boolean }>({} as { [key: string]: boolean });
  const [isExist, setIsExist] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const [isLikeSending, setIsLikeSending] = useState(false);
  const [isBookmarkSending, setIsBookmarkSending] = useState(false);
  const [isCommentSending, setIsCommentSending] = useState(false);
  const [isOpenDeleteCommentModal, setIsOpenDeleteCommentModal] = useState(false);
  const [isOpenUpdateCommentModal, setIsOpenUpdateCommentModal] = useState(false);
  const [isUpdateSending, setIsUpdateSending] = useState(false);
  const [isDeleteSending, setIsDeleteSending] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [me, setMe] = useState<UserPublic>({ id: "" } as UserPublic);
  const router = useRouter();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    try {
      const fetch = async () => {
        const res = await axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}&pageType=articles`);
        if (!res.data.exist) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setPage(res.data.data as Page);
          setContent(Lex({ text: res.data.data.content }));
        }
        setIsLoading(false);
        const [fetchUser, me] = await Promise.all([axios.get(`/api/db/users/exist?userID=${params.userID}`), axios.get(`/api/db/users/existMe`)]);
        if (!fetchUser.data.exist || !me.data.ok) {
          router.replace("/");
          return;
        }
        setUserIcon(fetchUser.data.data.icon);
        if (!me.data.exist) {
          setMe({ id: "" } as UserPublic);
        } else {
          setMe(me.data.data);
        }
        if (res.data.exist) {
          const fetchComments = await axios.get(`/api/db/comments/get?pageUserID=${params.userID}&pageID=${params.pageID}&pageType=articles&myID=${me.data.exist ? me.data.data.id : "null"}`);
          if (!fetchComments.data.ok) {
            router.replace("/");
            return;
          }
          let isLike, isBookmark;
          if (me.data.exist) {
            setIsLogin(true);
            [isLike, isBookmark] = await Promise.all([
              axios.get(`/api/db/likes/exist?myID=${me.data.data.id}&pageUserID=${params.userID}&pageID=${params.pageID}&pageType=articles`),
              axios.get(`/api/db/bookmarks/exist?myID=${me.data.data.id}&pageUserID=${params.userID}&pageID=${params.pageID}&pageType=articles`),
            ]);
            if (!isLike.data.ok || !isBookmark.data.ok) {
              router.replace("/");
              return;
            }
            setIsLike(isLike.data.isLiked);
            setIsBookmark(isBookmark.data.isBookmark);
          }
          setComments(fetchComments.data.data as Comment[]);
          const _commentUserMapArray = fetchComments.data.userData as UserPublic[];
          const commentUserMap2: { [key: string]: UserPublic } = {};
          _commentUserMapArray.forEach((e) => {
            commentUserMap2[e.id] = e;
          });
          setCommentUserMap(commentUserMap2);
          const _likeComments = fetchComments.data.likeComments as { comment_id: string }[];
          const likeComments2: { [key: string]: boolean } = {};
          _likeComments.forEach((e) => {
            likeComments2[e.comment_id] = true;
          });
          setLikeComments(likeComments2);
        }
      };
      fetch();
    } catch (e) {
      router.replace("/");
    }
  }, [params.pageID, params.userID, router]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isExist) {
      if (me.id === params.userID || page.is_public) {
        document.title = `${page.title}｜TellPro`;
      } else {
        document.title = "ページが非公開です｜TellPro";
      }
    } else {
      document.title = "ページが存在しません｜TellPro";
    }
  }, [isLoading, isExist, me.id, page.is_public, params.userID, page.title]);

  const handleGoodButton = async () => {
    try {
      setIsLikeSending(true);
      setIsLike(!isLike);
      if (!isLike) {
        setPage({ ...page, like_count: Number(page.like_count) + 1 });
        await axios.post("/api/db/likes/create", {
          myID: me.id,
          pageUserID: params.userID,
          pageID: params.pageID,
          pageType: "articles",
        });
      } else {
        setPage({ ...page, like_count: Number(page.like_count) - 1 });
        await axios.post("/api/db/likes/delete", {
          myID: me.id,
          pageUserID: params.userID,
          pageID: params.pageID,
          pageType: "articles",
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
          myID: me.id,
          pageUserID: params.userID,
          pageID: params.pageID,
          pageType: "articles",
        });
      } else {
        setIsBookmark(false);
        await axios.post("/api/db/bookmarks/delete", {
          myID: me.id,
          pageUserID: params.userID,
          pageID: params.pageID,
          pageType: "articles",
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
      setSendingMessage("コメントを入力してください");
      setIsCommentSending(false);
      return;
    }
    try {
      const commentID = returnRandomString(64);
      await axios.post("/api/db/comments/create", {
        ID: commentID,
        myID: me.id,
        pageUserID: params.userID,
        pageID: params.pageID,
        pageType: "articles",
        content: mdAreaValue,
      });
      setMdAreaValue("");
      setSendingMessage("");
      setIsCommentSending(false);
      setPage({ ...page, comment_count: Number(page.comment_count) + 1 });
      setComments((prev) => [
        {
          id: commentID,
          user_id: me.id,
          content: mdAreaValue,
          like_count: 0,
          page_id: params.pageID,
          page_type: "articles",
          page_user_id: params.userID,
          created_at: new Date().toISOString(),
        } as Comment,
        ...prev,
      ]);
      setLikeComments((prev) => {
        return {
          ...prev,
          [commentID]: false,
        };
      });
      setCommentUserMap((prev) => {
        prev[me.id] = me;
        return prev;
      });
    } catch (e) {
      setSendingMessage("エラーが発生しました");
      console.log(e);
      setIsCommentSending(false);
    }
  };

  const handleCommentGood = async (commentID: string) => {
    try {
      setIsLikeSending(true);
      if (!likeComments[commentID]) {
        // コメントのlikeCountを増やす.
        setLikeComments((prev) => {
          prev[commentID] = true;
          return prev;
        });
        let pageUserID = "";
        const newComments = comments.map((e) => {
          if (e.id === commentID) {
            e.like_count = Number(e.like_count) + 1;
            pageUserID = e.user_id;
          }
          return e;
        });
        setComments(newComments);
        await axios.post("/api/db/likes/create", {
          myID: me.id,
          pageUserID: pageUserID,
          pageID: commentID,
          pageType: "comments",
        });
      } else {
        // コメントのlikeCountを減らす.
        setLikeComments((prev) => {
          prev[commentID] = false;
          return prev;
        });
        let pageUserID = "";
        const newComments = comments.map((e) => {
          if (e.id === commentID) {
            e.like_count = Number(e.like_count) - 1;
            pageUserID = e.user_id;
          }
          return e;
        });
        setComments(newComments);
        await axios.post("/api/db/likes/delete", {
          myID: me.id,
          pageUserID: pageUserID,
          pageID: commentID,
          pageType: "comments",
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
        userID: me.id,
        pageID: params.pageID,
        pageType: "articles",
      });
      setComments(comments.filter((e) => e.id !== deleteCommentID));
      setIsDeleteSending(false);
      setIsOpenDeleteCommentModal(false);
      setPage({ ...page, comment_count: Number(page.comment_count) - 1 });
    } catch (e) {
      console.error(e);
      setIsDeleteSending(false);
    }
  };

  const handleUpdateComment = async () => {
    try {
      setIsUpdateSending(true);
      if (updateMdAreaValue === "") {
        setUpdateSendingMessage("コメントを入力してください");
        setIsUpdateSending(false);
        return;
      }
      await axios.post("/api/db/comments/update", {
        pageID: params.pageID,
        commentID: updateCommentID,
        userID: me.id,
        content: updateMdAreaValue,
        pageType: "articles",
      });
      setComments(
        comments.map((e) => {
          if (e.id === updateCommentID) {
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

  return isLoading ? (
    <></>
  ) : isExist ? (
    me.id === params.userID || page.is_public ? (
      <>
        <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
        <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
        <div className="mx-auto">
          <div className="flex mt-2 px-1 flex-wrap">
            {page.tags.map((e) =>
              e === "" ? (
                <Fragment key={returnRandomString(64)}></Fragment>
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
          <Link href={`/${params.userID}`} className="flex cursor-pointer">
            <img src={userIcon} alt="" width={24} height={24} className="mr-1" />
            <u>@{params.userID}</u>
          </Link>
        </div>
        <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5 rounded">
          {content}
          {/* コメント */}
          <SendComment
            page={page}
            isLogin={isLogin}
            sendingMessage={sendingMessage}
            mdAreaValue={mdAreaValue}
            isCommentSending={isCommentSending}
            isLikeSending={isLikeSending}
            comments={comments}
            me={me}
            commentUserMap={commentUserMap}
            likeComments={likeComments}
            setUpdateMdAreaValue={setUpdateMdAreaValue}
            setUpdateCommentID={setUpdateCommentID}
            setIsOpenUpdateCommentModal={setIsOpenUpdateCommentModal}
            setDeleteCommentID={setDeleteCommentID}
            setIsOpenDeleteCommentModal={setIsOpenDeleteCommentModal}
            setMdAreaValue={setMdAreaValue}
            handleCommentGood={handleCommentGood}
            handleCommentUpload={handleCommentUpload}
          ></SendComment>
        </div>
        <div className="fixed right-0 p-1 w-full lg:w-auto bottom-0 bg-slate-100 lg:right-2 lg:bottom-2 lg:bg-inherit">
          <div className="flex flex-row lg:flex-col justify-center lg:justify-normal h-10 lg:h-auto">
            <div className={`text-center lg:mr-2 flex lg:block mx-2`}>
              <button
                className={`cursor-pointer w-10 lg:w-16 flex flex-col items-center h-10 lg:h-16 justify-center bg-white rounded-full border-gray-300 border`}
                title="いいね"
                onClick={handleGoodButton}
                disabled={isLikeSending || !isLogin}
              >
                {isLike ? <FaHeart className="inline-flex text-sm lg:text-3xl text-red-500" /> : <FaRegHeart className="inline-flex text-sm lg:text-3xl text-red-500" />}
              </button>
              <b className="ml-1 my-auto">{Number(page.like_count)}</b>
            </div>
            <div className="text-center mb-2 lg:mr-2 mx-2">
              <button
                className={`cursor-pointer flex items-center justify-center w-10 lg:w-16 h-10 lg:h-16 bg-white rounded-full border-gray-300 border`}
                title="ブックマーク"
                onClick={handleBookmark}
                disabled={isBookmarkSending || !isLogin}
              >
                {isBookmark ? <FaBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" /> : <FaRegBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" />}
              </button>
            </div>
            <Link title="編集" className={`mx-2 cursor-pointer ${me.id === params.userID ? "" : "hidden"}`} href={`/${params.userID}/articles/${params.pageID}/edit`}>
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
