import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const handleProblemUpload = async (props: {
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  setSendingMessage: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  description: string;
  problems: Map<string, Problem>;
  tagSearchValue: string;
  isPublic: boolean;
  isPageExist: boolean;
  params: { userID: string; pageID: string };
  router: AppRouterInstance
}) => {
  const {
    setIsSending,
    setSendingMessage,
    title,
    description,
    problems,
    tagSearchValue,
    isPublic,
    isPageExist,
    params,
    router
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
  if (description.length > 1000) {
    setSendingMessage("説明が長すぎます");
    alert("説明が長すぎます");
    setIsSending(false);
    return;
  }
  if (problems.size === 0) {
    setSendingMessage("問題を追加してください");
    alert("問題を追加してください");
    setIsSending(false);
    return;
  }
  const _problems = Array.from(problems.entries());
  const json = {
    description: description,
    problems: _problems
  }
  const mdAreaValue = JSON.stringify(json);
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
        pageType: "problems",
      });
      router.push(`/${params.userID}/problems/${params.pageID}`);
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
        pageType: "problems",
      });
      router.push(`/${params.userID}/problems/${params.pageID}`);
    } catch (e) {
      setSendingMessage("エラーが発生しました");
      setIsSending(false);
    }
  }
};

export default handleProblemUpload;