"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// 検索ページ.
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tags, setTags] = useState<TagData[]>([]);

  useEffect(() => {
    document.title = "Search｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {
      if (page === null) {
        const data = await axios.get("/api/db/tags/get?page=1");
        setTags(data.data.data);
      } else if (isNaN(Number(page)) || Number(page) < 1) {
        router.replace("/search");
        const data = await axios.get("/api/db/tags/get?page=1");
        setTags(data.data.data);
      } else {
        const data = await axios.get(`/api/db/tags/get?page=${page}`);
        setTags(data.data.data);
      }
    };
    fetcher();
  }, [page]);

  return (
    <>
      <div className="text-center my-5">
        <b className="text-3xl">タグ一覧</b>
      </div>
      <div className="flex flex-wrap justify-center">
        {tags.map((e: TagData) => (
          <Link key={returnRandomString(32)} href={`/search/${e.name}`} className="w-48 bg-white rounded p-3 mx-5 mt-5 shadow-xl flex flex-col hover:shadow-2xl duration-300">
            <div className="text-center">
              <b>{e.name}</b>
            </div>
            <hr />
            <div className="text-center my-2">
              <img src={e.image === "local" ? "/svg/tag.svg" : e.image} alt="" className="inline" width={100} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
