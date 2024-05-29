"use client";
import { useEffect } from "react";
import HomeNav from "../components/homeNav";

export default function Pages() {
  useEffect(() => {
    document.title = "Articles｜TellPro";
  }, []);
  return (
    <>
      <HomeNav pathName="/articles"></HomeNav>
      <div>P</div>
    </>
  );
}
