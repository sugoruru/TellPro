"use client";

import { useEffect } from "react";

// 検索ページ.
export default function SearchPage() {
  useEffect(() => {
    document.title = "Search｜TellPro";
  }, []);
  return <div>Hello, search</div>;
}
