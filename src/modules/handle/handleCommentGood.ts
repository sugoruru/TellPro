import { UserPublic } from "@/types/user";
import { Comment } from "@/types/comment";
import axios from "axios";
import sleep from "../main/sleep";

export interface HandleCommentGoodProps {
  me: UserPublic;
  comments: Comment[];
  commentID: string;
  commentLikeUserMap: { [key: string]: boolean };
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setCommentLikeUserMap: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setIsLikeSending: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleCommentGood = async (props: HandleCommentGoodProps) => {
  const { me, comments, commentID, commentLikeUserMap, setComments, setCommentLikeUserMap, setIsLikeSending } = props;
  try {
    setIsLikeSending(true);
    if (!commentLikeUserMap[commentID]) {
      // 回答のlikeCountを増やす.
      setCommentLikeUserMap((prev) => {
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
      // 回答のlikeCountを減らす.
      setCommentLikeUserMap((prev) => {
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

