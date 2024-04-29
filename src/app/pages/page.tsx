"use client";
import { useEffect } from "react";
import HomeNav from "../components/homeNav";

export default function Pages() {
  useEffect(() => {
    document.title = "Pages｜TellPro";
  }, []);
  return (
    <>
      <HomeNav pathName="/pages"></HomeNav>
      <div>P</div>
    </>
  );
}
