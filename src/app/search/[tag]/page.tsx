"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// 検索ページ.
export default function SearchPage({ params }: { params: { tag: string } }) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tag, setTag] = useState<TagData | null>(null);

  useEffect(() => {
    document.title = "Tag｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {};
    fetcher();
  }, [page]);

  return <>{params.tag}</>;
}
