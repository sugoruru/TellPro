import { Comment } from "@/types/DBTypes";
import { Page } from "@/types/DBTypes";
import axios from "axios";

export const handleCommentDelete = async (props: {
  setIsDeleteSending: React.Dispatch<React.SetStateAction<boolean>>;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  setIsOpenDeleteCommentModal: React.Dispatch<React.SetStateAction<boolean>>;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  deleteCommentID: string;
  me: { id: string };
  params: { pageID: string };
  page: Page;
  comments: Comment[];
  pageType: string;
}) => {
  const {
    setIsDeleteSending,
    deleteCommentID,
    me,
    params,
    setComments,
    setIsOpenDeleteCommentModal,
    page,
    setPage,
    comments,
    pageType
  } = props;
  try {
    setIsDeleteSending(true);
    await axios.post("/api/db/comments/delete", {
      commentID: deleteCommentID,
      userID: me.id,
      pageID: params.pageID,
      pageType: pageType,
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
