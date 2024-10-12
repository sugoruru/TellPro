import { Page } from "@/types/DBTypes";
import { User } from "@/types/DBTypes";
import { Comment } from "@/types/DBTypes";
import returnRandomString from "../algo/returnRandomString";
import axios from "axios";

export const handleCommentUpload = async (props: {
  setIsCommentSending: React.Dispatch<React.SetStateAction<boolean>>;
  setMdAreaValue: React.Dispatch<React.SetStateAction<string>>;
  setSendingMessage: React.Dispatch<React.SetStateAction<string>>;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setCommentLikeUserMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setCommentUserMap: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  me: User;
  page: Page;
  params: { userID: string; pageID: string };
  mdAreaValue: string;
  pageType: string;
}) => {
  const {
    setIsCommentSending,
    me,
    setMdAreaValue,
    setSendingMessage,
    page,
    setComments,
    setCommentLikeUserMap,
    setCommentUserMap,
    params,
    mdAreaValue,
    setPage,
    pageType,
  } = props;
  setIsCommentSending(true);
  if (mdAreaValue === "") {
    setSendingMessage("コメントを入力してください");
    setIsCommentSending(false);
    return;
  }
  if (mdAreaValue.length > 10000) {
    setSendingMessage("コメントは10000文字以内で入力してください");
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
      pageType: pageType,
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
        page_type: pageType,
        page_user_id: params.userID,
        created_at: new Date().toISOString(),
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
      prev[me.id] = me;
      return prev;
    });
  } catch (e) {
    setSendingMessage("エラーが発生しました");
    console.log(e);
    setIsCommentSending(false);
  }
};
