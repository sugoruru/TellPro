"use client";
import Lex from "@/modules/md/md";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Prism from "prismjs";
import { useEffect, useState } from "react";
import sleep from "@/modules/main/sleep";
import DeleteCommentModal from "@/app/components/pages/comments/deleteCommentModal";
import UpdateCommentModal from "@/app/components/pages/comments/updateCommentModal";
import { Page } from "@/types/page";
import { Comment } from "@/types/comment";
import SendComment from "@/app/components/pages/comments/sendComment";
import PageTags from "@/app/components/pages/pages/pageTags";
import PageUser from "@/app/components/pages/pages/pageUser";
import PageMenu from "@/app/components/pages/pages/pageMenu";
import PageNotExist from "@/app/components/pages/pages/pageNotExist";
import PageNotPublic from "@/app/components/pages/pages/pageNotPublic";
import { UserPublic } from "@/types/user";
import { handleBookmark } from "@/modules/handle/handleBookmark";
import { handleGoodButton } from "@/modules/handle/handleGoodButton";
import { handleCommentGood } from "@/modules/handle/handleCommentGood";
import { handleCommentUpload } from "@/modules/handle/handleCommentUpload";
import { handleCommentDelete } from "@/modules/handle/handleCommentDelete";
import { handleUpdateComment } from "@/modules/handle/handleUpdateComment";

export default function Questions({ params }: { params: { userID: string; pageID: string } }) {
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
  const [commentLikeUserMap, setCommentLikeUserMap] = useState<{ [key: string]: boolean }>({} as { [key: string]: boolean });
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
  const [isUpdateClosedSending, setIsUpdateClosedSending] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [me, setMe] = useState<UserPublic>({ id: "" } as UserPublic);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    try {
      const fetch = async () => {
        const pageData = await axios.get(`/api/pages/pages?userID=${params.userID}&pageID=${params.pageID}&pageType=questions`);
        if (!pageData.data.ok) {
          alert("エラーが発生しました");
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
          const commentLikeUserMap: { [key: string]: boolean } = {};
          page.commentsLike.forEach((e) => {
            commentLikeUserMap[e.comment_id] = true;
          });
          setCommentLikeUserMap(commentLikeUserMap);
          setCommentUserMap(commentUserMap);
          setIsLike(page.isLiked);
          setIsBookmark(page.isBookmarked);
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
      const toComment = searchParams.get("toComment");
      if (toComment) {
        const commentElement = document.getElementById(toComment);
        if (commentElement) {
          const rect = commentElement.getBoundingClientRect();
          const currentScrolledHeight = window.scrollY || document.documentElement.scrollTop;
          const position = window.innerHeight * 0.2;
          scrollTo({ top: rect.bottom + currentScrolledHeight - position, behavior: "smooth" });
        }
      }
      if (me.id === params.userID || page.is_public) {
        document.title = `${page.title}｜TellPro`;
      } else {
        document.title = "ページが非公開です｜TellPro";
      }
    } else {
      document.title = "ページが存在しません｜TellPro";
    }
  }, [isAllLoaded, isExist, me.id, page.is_public, params.userID, page.title]);

  const handleSwitchClosed = async () => {
    if (me.id !== params.userID) return;
    setIsUpdateClosedSending(true);
    setPage({ ...page, is_closed: !page.is_closed });
    await axios.post("/api/db/questions/update_closed", {
      userID: params.userID,
      pageID: params.pageID,
      isClosed: !page.is_closed,
    });
    await sleep(1500);
    setIsUpdateClosedSending(false);
  };

  return !isAllLoaded ? (
    <></>
  ) : isExist ? (
    me.id === params.userID || page.is_public ? (
      <div className="w-[calc(100vw-calc(100vw-100%))]">
        <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
        <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
        <div className="flex justify-center">
          <div className={`${page.is_public ? (page.is_closed ? "bg-violet-400" : "bg-blue-400") : "bg-red-400"} text-white px-1 rounded-sm inline-block`}>
            {page.is_public ? (page.is_closed ? "クローズ" : "公開") : "非公開"}
          </div>
          {me.id === params.userID ? (
            <label className="inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={page.is_closed}
                onChange={() => {
                  if (!isUpdateClosedSending) handleSwitchClosed();
                }}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
            </label>
          ) : (
            <></>
          )}
        </div>
        <PageTags tags={page.tags} />
        <PageUser userID={params.userID} userIcon={userIcon} />
        <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5 rounded">
          {content}
          {/* 回答 */}
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
            likeComments={commentLikeUserMap}
            setUpdateMdAreaValue={setUpdateMdAreaValue}
            setUpdateCommentID={setUpdateCommentID}
            setIsOpenUpdateCommentModal={setIsOpenUpdateCommentModal}
            setDeleteCommentID={setDeleteCommentID}
            setIsOpenDeleteCommentModal={setIsOpenDeleteCommentModal}
            setMdAreaValue={setMdAreaValue}
            handleCommentGood={handleCommentGood}
            handleCommentUpload={() => {
              handleCommentUpload({
                setMdAreaValue,
                setSendingMessage,
                setCommentLikeUserMap,
                setCommentUserMap,
                setComments,
                setIsCommentSending,
                setPage,
                mdAreaValue,
                me,
                page,
                params,
                pageType: "articles",
              });
            }}
            setComments={setComments}
            setCommentLikeUserMap={setCommentLikeUserMap}
            setIsLikeSending={setIsLikeSending}
          ></SendComment>
        </div>
        <PageMenu
          handleGoodButton={() => {
            handleGoodButton({
              setIsLikeSending,
              isLike,
              setIsLike,
              page,
              setPage,
              me,
              params: { userID: params.userID, pageID: params.pageID },
              pageType: "questions",
            });
          }}
          handleBookmark={() => {
            handleBookmark({
              setIsBookmarkSending,
              isBookmark,
              setIsBookmark,
              myID: me.id,
              params: { userID: params.userID, pageID: params.pageID },
              pageType: "questions",
            });
          }}
          isLikeSending={isLikeSending}
          isLogin={isLogin}
          isLike={isLike}
          isBookmark={isBookmark}
          isBookmarkSending={isBookmarkSending}
          page={page}
          userID={params.userID}
          pageID={params.pageID}
          me={me}
          pageType="questions"
        />
        <DeleteCommentModal
          handleCommentDelete={() => {
            handleCommentDelete({
              setIsDeleteSending,
              setComments,
              setIsOpenDeleteCommentModal,
              setPage,
              deleteCommentID,
              me,
              params: { pageID: params.pageID },
              page,
              comments,
              pageType: "questions",
            });
          }}
          isDeleteSending={isDeleteSending}
          isOpenDeleteCommentModal={isOpenDeleteCommentModal}
          stateFunc={{ setIsOpenDeleteCommentModal }}
        />
        <UpdateCommentModal
          handleUpdateComment={() => {
            handleUpdateComment({
              setIsUpdateSending,
              setComments,
              setIsOpenUpdateCommentModal,
              setUpdateSendingMessage,
              updateCommentID,
              updateMdAreaValue,
              me,
              params: { pageID: params.pageID },
              comments,
              pageType: "questions",
            });
          }}
          isUpdateSending={isUpdateSending}
          isOpenUpdateCommentModal={isOpenUpdateCommentModal}
          updateMdAreaValue={updateMdAreaValue}
          updateSendingMessage={updateSendingMessage}
          stateFunc={{ setIsOpenUpdateCommentModal, setUpdateMdAreaValue }}
        />
      </div>
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
