import { useEffect } from "react";
import Loading from "../components/loading";

export default function makeNewQuestion() {
  useEffect(() => {
    document.title = "新規質問作成｜TellPro";
  }, []);
  return <Loading title="読み込み中..." />;
}
