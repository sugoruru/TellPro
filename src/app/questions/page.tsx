"use client";
import { useEffect } from "react";
import HomeNav from "../components/homeNav";

// TODO:(UI) 未解決(昇順)・未解決(降順)・解決済み(昇順)・解決済み(降順)・いいね数でソートするボタンを追加
export default function Questions() {
  useEffect(() => {
    document.title = "Questions｜TellPro";
  }, []);
  return (
    <>
      <HomeNav pathName="/questions"></HomeNav>
      <div>Q</div>
    </>
  );
}
