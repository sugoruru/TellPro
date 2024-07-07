import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import sleep from "../main/sleep";

export const handleBookmark = async (props: {
  setIsBookmarkSending: Dispatch<SetStateAction<boolean>>,
  isBookmark: boolean,
  setIsBookmark: Dispatch<SetStateAction<boolean>>,
  myID: string,
  params: { userID: string, pageID: string },
  pageType: string,
}) => {
  try {
    props.setIsBookmarkSending(true);
    if (!props.isBookmark) {
      props.setIsBookmark(true);
      await axios.post("/api/db/bookmarks/create", {
        myID: props.myID,
        pageUserID: props.params.userID,
        pageID: props.params.pageID,
        pageType: props.pageType,
      });
    } else {
      props.setIsBookmark(false);
      await axios.post("/api/db/bookmarks/delete", {
        myID: props.myID,
        pageUserID: props.params.userID,
        pageID: props.params.pageID,
        pageType: props.pageType,
      });
    }
    // 連打防止用に1秒待機.
    await sleep(1000);
    props.setIsBookmarkSending(false);
  } catch (e) {
    console.log(e);
    props.setIsBookmarkSending(false);
  }
};
