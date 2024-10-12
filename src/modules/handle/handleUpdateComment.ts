import { Comment } from "@/types/DBTypes";
import axios from "axios";

export const handleUpdateComment = async (props: {
  setIsUpdateSending: React.Dispatch<React.SetStateAction<boolean>>;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  setIsOpenUpdateCommentModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateSendingMessage: React.Dispatch<React.SetStateAction<string>>;
  updateCommentID: string;
  updateMdAreaValue: string;
  me: { id: string };
  params: { pageID: string };
  comments: Comment[];
  pageType: string;
}) => {
  const {
    setIsUpdateSending,
    updateCommentID,
    updateMdAreaValue,
    me,
    params,
    setComments,
    setIsOpenUpdateCommentModal,
    setUpdateSendingMessage,
    comments,
    pageType
  } = props;
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
      pageType: pageType,
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
