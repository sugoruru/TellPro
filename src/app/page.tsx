"use client";
import { useEffect } from "react";
import HomeNav from "./components/homeNav";

// TODO:ユーザーのお知らせ
// TODO:公式からのお知らせ
// TODO:トレンドページ([いいね数/時間]でトレンド指数を導出して、高いものを10件表示)
export default function Home() {
  useEffect(() => {
    document.title = "Home｜TellPro";
  }, []);
  return (
    <>
      <HomeNav pathName="/"></HomeNav>
      <div>H</div>
    </>
  );
}
