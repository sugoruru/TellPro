import axios from "axios";
import sleep from "../main/sleep";
import { Page } from "@/types/page";

export const handleGoodButton = async (props: {
  setIsLikeSending: React.Dispatch<React.SetStateAction<boolean>>,
  isLike: boolean,
  setIsLike: React.Dispatch<React.SetStateAction<boolean>>,
  page: Page,
  setPage: React.Dispatch<React.SetStateAction<Page>>,
  me: {
    id: string,
  },
  params: {
    userID: string,
    pageID: string,
  },
  pageType: string,
}) => {
  try {
    props.setIsLikeSending(true);
    props.setIsLike(!props.isLike);
    if (!props.isLike) {
      props.setPage({ ...props.page, like_count: Number(props.page.like_count) + 1 });
      await axios.post("/api/db/likes/create", {
        myID: props.me.id,
        pageUserID: props.params.userID,
        pageID: props.params.pageID,
        pageType: props.pageType,
      });
    } else {
      props.setPage({ ...props.page, like_count: Number(props.page.like_count) - 1 });
      await axios.post("/api/db/likes/delete", {
        myID: props.me.id,
        pageUserID: props.params.userID,
        pageID: props.params.pageID,
        pageType: props.pageType,
      });
    }
    // 連打防止用に1秒待機.
    await sleep(1000);
    props.setIsLikeSending(false);
  } catch (e) {
    console.log(e);
    props.setIsLikeSending(false);
  }
}