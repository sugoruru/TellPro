import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { siteRegex } from "../other/compSitesConstants";

const handleProblemUpload = async (props: {
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  setSendingMessage: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  description: string;
  problems: Map<string, Problem>;
  problemTitleData: [string, { title: string; err: boolean }][];
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
    problemTitleData,
    tagSearchValue,
    isPublic,
    isPageExist,
    params,
    router
  } = props;
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
  const problemsArray = Array.from(problems.entries());
  let isInvalid = true;
  for (const [_site, value] of problemsArray) {
    if (!siteRegex[value.site].test(value.value) || !value.isInputValid) {
      isInvalid = false;
      break;
    }
  }
  if (!isInvalid) {
    setSendingMessage("問題が正しく入力されていません");
    alert("問題が正しく入力されていません");
    setIsSending(false);
    return;
  }
  const json = {
    description: description,
    problems: problemsArray,
    titleData: problemTitleData,
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