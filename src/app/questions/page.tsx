"use client";
import { useEffect } from "react";
import HomeNav from "../components/homeNav";

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
