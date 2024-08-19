"use client";
import Lex from "@/modules/md/md";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Prism from "prismjs";
import { useEffect, useState } from "react";
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
import { useGetWindowSize } from "@/app/components/hooks/useGetWindowSize";
import { pageContentSize } from "@/modules/other/uiOptions";

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
  const [isLogin, setIsLogin] = useState(false);
  const [me, setMe] = useState<UserPublic>({ id: "" } as UserPublic);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { width } = useGetWindowSize();

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
          setCommentUserMap(commentUserMap);
          const likeComments: { [key: string]: boolean } = {};
          page.commentsLike.forEach((e) => {
            likeComments[e.comment_id] = true;
          });
          setCommentLikeUserMap(likeComments);
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
      if (me.id === params.userID || page.is_public) {
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
        document.title = `${page.title}｜TellPro`;
      } else {
        document.title = "ページが非公開です｜TellPro";
      }
    } else {
      document.title = "ページが存在しません｜TellPro";
    }
  }, [searchParams, isAllLoaded, isExist, me.id, page.is_public, params.userID, page.title]);

  return !isAllLoaded ? (
    <div className="h-full"></div>
  ) : isExist ? (
    me.id === params.userID || page.is_public ? (
      <div className="w-[calc(100vw-calc(100vw-100%))]">
        <div className={`text-center text-4xl font-bold my-5 text-gray-700 dark:text-white`}>{page.title === "" ? "untitled" : page.title}</div>
        <div className={`text-center text-base font-bold  text-gray-700 dark:text-white`}>公開日時:{page.date.split("T")[0]}</div>
        <div className="flex justify-center">
          <div className={`${page.is_public ? (page.is_closed ? "bg-violet-400" : "bg-blue-400") : "bg-red-400"} text-white px-1 rounded-sm inline-block`}>
            {page.is_public ? (page.is_closed ? "クローズ" : "公開") : "非公開"}
          </div>
        </div>
        <PageTags tags={page.tags} />
        <PageUser userID={params.userID} userIcon={userIcon} />
        <div className={`bg-white mx-auto my-3 p-5 rounded`} style={{ maxWidth: `${width >= 640 ? Math.floor(width * pageContentSize) + "px" : (width * 4.8) / 5 + "px"}` }}>
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
              params,
              pageType: "articles",
            });
          }}
          handleBookmark={() => {
            handleBookmark({
              setIsBookmarkSending,
              isBookmark,
              setIsBookmark,
              myID: me.id,
              params: { userID: params.userID, pageID: params.pageID },
              pageType: "articles",
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
          pageType="articles"
        />
        <DeleteCommentModal
          handleCommentDelete={() => {
            handleCommentDelete({
              setIsDeleteSending,
              deleteCommentID,
              me,
              params,
              setComments,
              setIsOpenDeleteCommentModal,
              page,
              setPage,
              comments,
              pageType: "articles",
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
              updateCommentID,
              updateMdAreaValue,
              me,
              params,
              setComments,
              setIsOpenUpdateCommentModal,
              setUpdateSendingMessage,
              comments,
              pageType: "articles",
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
      <div className="h-full"></div>
    )
  ) : (
    // ページが存在しない時.
    <PageNotExist />
  );
}
