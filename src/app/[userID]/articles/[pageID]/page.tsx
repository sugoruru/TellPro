"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import Lex from "@/modules/md/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import Prism from "prismjs";
import { useEffect, useState } from "react";
import sleep from "@/modules/sleep";
import DeleteCommentModal from "@/app/components/articles/deleteCommentModal";
import UpdateCommentModal from "@/app/components/articles/updateCommentModal";
import { Page } from "@/types/page";
import { Comment } from "@/types/comment";
import SendComment from "@/app/components/articles/sendComment";
import PageTags from "@/app/components/articles/pageTags";
import PageUser from "@/app/components/articles/pageUser";
import PageMenu from "@/app/components/articles/pageMenu";
import PageNotExist from "@/app/components/articles/pageNotExist";
import PageNotPublic from "@/app/components/articles/pageNotPublic";

export default function Articles({ params }: { params: { userID: string; pageID: string } }) {
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
  const [isAllLoaded, setIsAllLoaded] = useState(false);
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
        const pageData = await axios.get(`/api/pages/pages?userID=${params.userID}&pageID=${params.pageID}&pageType=articles`);
        if (!pageData.data.ok) {
          router.replace("/");
          return;
        }
        const page: {
          isExist: boolean;
          me: UserPublic | null;
          page: Page | null;
          pageUser: UserPublic | null;
          comments: Comment[];
          commentsUser: UserPublic[];
          commentsLike: { comment_id: string }[];
          isLiked: boolean;
          isBookmarked: boolean;
        } = pageData.data.data;
        setIsExist(page.isExist);
        if (page.isExist && page.page && page.pageUser) {
          setPage(page.page);
          setContent(Lex({ text: page.page.content }));
          setUserIcon(page.pageUser.icon || "");
          setMe(page.me || ({ id: "" } as UserPublic));
          if (page.me) setIsLogin(true);
          setComments(page.comments);
          const commentUserMap: { [key: string]: UserPublic } = {};
          page.commentsUser.forEach((e) => {
            commentUserMap[e.id] = e;
          });
          setCommentUserMap(commentUserMap);
          const likeComments: { [key: string]: boolean } = {};
          page.commentsLike.forEach((e) => {
            likeComments[e.comment_id] = true;
          });
          setLikeComments(likeComments);
          setIsLike(page.isLiked);
          setIsBookmark(page.isBookmarked);
        } else {
          router.replace("/");
          return;
        }
        setIsAllLoaded(true);
      };
      fetch();
    } catch (e) {
      router.replace("/");
    }
  }, [params.pageID, params.userID, router]);

  useEffect(() => {
    if (!isAllLoaded) {
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
  }, [isAllLoaded, isExist, me.id, page.is_public, params.userID, page.title]);

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

  return !isAllLoaded ? (
    <></>
  ) : isExist ? (
    me.id === params.userID || page.is_public ? (
      <>
        <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
        <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
        <div className="flex justify-center">
          <div className={`${page.is_public ? (page.is_closed ? "bg-violet-400" : "bg-blue-400") : "bg-red-400"} text-white px-1 rounded-sm inline-block`}>
            {page.is_public ? (page.is_closed ? "クローズ" : "公開") : "非公開"}
          </div>
        </div>
        <PageTags tags={page.tags} />
        <PageUser userID={params.userID} userIcon={userIcon} />
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
            isLoading={!isAllLoaded}
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
        <PageMenu
          handleGoodButton={handleGoodButton}
          handleBookmark={handleBookmark}
          isLikeSending={isLikeSending}
          isLogin={isLogin}
          isLike={isLike}
          isBookmark={isBookmark}
          isBookmarkSending={isBookmarkSending}
          page={page}
          userID={params.userID}
          pageID={params.pageID}
          me={me}
          pageType="articles"
        />
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
    ) : isAllLoaded ? (
      // ページが非公開の時.
      <PageNotPublic />
    ) : (
      <></>
    )
  ) : (
    // ページが存在しない時.
    <PageNotExist />
  );
}
