"use client";
import { useGetWindowSize } from "../components/hooks/useGetWindowSize";
import { pageContentSize } from "@/modules/other/uiOptions";
import Link from "next/link";

const HowToUse = () => {
  const { width } = useGetWindowSize();
  return (
    <div className="mx-auto mt-10 mb-10 bg-white p-10 rounded terms h-full" style={{ width: `${width >= 640 ? Math.floor(width * pageContentSize) + "px" : (width * 4.8) / 5 + "px"}` }}>
      使い方ページ一覧
      <br />・
      <Link href="https://www.tellpro.net/ruku/articles/bNbCbNIkINQzMJOlzNWGvKjRAXqHaiYB" className="myLink">
        TellProとは?
      </Link>
      <br />・
      <Link href="https://www.tellpro.net/ruku/articles/mNfLJRzAMSeMVmVsxzweasEZFNtAbast" className="myLink">
        TellProのマークダウン記法！
      </Link>
    </div>
  );
};

export default HowToUse;
