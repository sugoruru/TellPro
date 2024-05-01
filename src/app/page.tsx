"use client";
import { useEffect } from "react";
import HomeNav from "./components/homeNav";

// TODO:(UI) 公式からのお知らせ
// TODO:(UI) トレンドページを5つ表示する([いいね数/時間]でトレンド指数を導出して、高いものを10件表示)→PageList(types/page.d.ts)型があるからそれベースで
// TODO:(UI) おすすめユーザーを10件表示する(いいね数が多いユーザー)→UserList(types/user.d.ts)型があるからそれベース
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
