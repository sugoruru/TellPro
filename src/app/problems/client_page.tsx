"use client";
import { useEffect, useState } from "react";
import HomeNav from "../components/main/homeNav";

const Problems = () => {
  useEffect(() => {
    document.title = "Problems｜TellPro";
  }, []);
  return (
    <>
      <HomeNav pathName="/problems" />
      <div className="m-4"></div>
    </>
  );
};

export default Problems;
