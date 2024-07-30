import axios from "axios";
import { PageType } from "../other/pageTypes";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const handlePageUpload = async (props: {
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  setSendingMessage: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  mdAreaValue: string;
  tagSearchValue: string;
  isPublic: boolean;
  isPageExist: boolean;
  params: { userID: string; pageID: string };
  pageType: PageType;
  router: AppRouterInstance;
}) => {
  const {
    setIsSending,
    setSendingMessage,
    title,
    mdAreaValue,
    tagSearchValue,
    isPublic,
    isPageExist,
    params,
    pageType,
    router,
  } = props;
  setIsSending(true);
  setSendingMessage("");
  if (title === "") {
    setSendingMessage("タイトルを入力してください");
    alert("タイトルを入力してください");
    setIsSending(false);
    return;
  }
  if (title.length > 50) {
    setSendingMessage("タイトルが長すぎます");
    alert("タイトルが長すぎます");
    setIsSending(false);
    return;
  }
  if (mdAreaValue.length > 20000) {
    setSendingMessage("記事のサイズが大きすぎます");
    alert("記事のサイズが大きすぎます");
    setIsSending(false);
    return;
  }
  if (mdAreaValue === "") {
    setSendingMessage("本文を入力してください");
    alert("本文を入力してください");
    setIsSending(false);
    return;
  }
  if (isPageExist) {
    try {
      await axios.post("/api/db/pages/update", {
        ID: params.pageID,
        userID: params.userID,
        title: title,
        content: mdAreaValue,
        tags: tagSearchValue
          .trim()
          .split(" ")
          .filter((e) => e !== ""),
        isPublic: isPublic,
        pageType: pageType,
      });
      router.push(`/${params.userID}/${pageType}/${params.pageID}`);
    } catch (e) {
      setSendingMessage("エラーが発生しました");
      setIsSending(false);
    }
  } else {
    try {
      await axios.post("/api/db/pages/create", {
        ID: params.pageID,
        userID: params.userID,
        title: title,
        content: mdAreaValue,
        tags: tagSearchValue
          .trim()
          .split(" ")
          .filter((e) => e !== ""),
        isPublic: isPublic,
        pageType: pageType,
      });
      router.push(`/${params.userID}/${pageType}/${params.pageID}`);
    } catch (e) {
      setSendingMessage("エラーが発生しました");
      setIsSending(false);
    }
  }
};

export default handlePageUpload;