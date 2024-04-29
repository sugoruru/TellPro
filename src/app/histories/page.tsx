"use client";

import { useEffect } from "react";

// TODO: ログインしているかどうかで表示するページを変える
// TODO: ログインしている場合は個人の履歴を表示する
// TODO: していない場合はログインしてくださいと表示する
export default function Page() {
  useEffect(() => {
    document.title = "History｜TellPro";
  }, []);
  return <div>Hello, History</div>;
}
