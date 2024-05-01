"use client";

import { useEffect } from "react";

//TODO:(DEV) Bookmarkと同じように作成する.
export default function Page() {
  useEffect(() => {
    document.title = "History｜TellPro";
  }, []);
  return <div>Hello, History</div>;
}
