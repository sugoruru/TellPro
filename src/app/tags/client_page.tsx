"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import { DBTagsGet } from "@/types/axiosTypes";
import { Tag } from "@/types/DBTypes";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";

// タグページ.
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pageID, setPageID] = useState(1);

  useEffect(() => {
    document.title = "Tags｜TellPro";
  }, []);

  useEffect(() => {
    const fetcher = async () => {
      if (page === null) {
        const data = await axios.get<DBTagsGet>("/api/db/tags/get?page=1");
        if (data.data.ok) {
          setPageID(1);
          setTags(data.data.data);
        }
      } else if (isNaN(Number(page)) || Number(page) < 1) {
        router.replace("/tags");
        const data = await axios.get<DBTagsGet>("/api/db/tags/get?page=1");
        if (data.data.ok) {
          setPageID(1);
          setTags(data.data.data);
        }
      } else {
        const data = await axios.get<DBTagsGet>(`/api/db/tags/get?page=${page}`);
        if (data.data.ok) {
          setPageID(Number(page));
          setTags(data.data.data);
        }
      }
      setIsLoaded(true);
    };
    fetcher();
  }, [router, page]);

  return (
    <div className="h-full">
      {tags.length === 0 ? (
        isLoaded ? (
          <div className={`text-center my-5 text-black dark:text-white`}>タグが見つかりませんでした。</div>
        ) : (
          <div className={`text-center my-5 text-black dark:text-white`}>読み込み中...</div>
        )
      ) : (
        <>
          <div className="text-center my-5">
            <b className={`text-3xl text-black dark:text-white`}>タグ一覧</b>
          </div>
          <div className="flex flex-wrap justify-center">
            {tags.map((e: Tag) => (
              <Link key={returnRandomString(32)} href={`/tags/${e.name}`} className="w-48 bg-white rounded p-3 mx-5 mt-5 shadow-xl flex flex-col hover:shadow-2xl duration-300">
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
      )}
      {isLoaded && (
        <div className="flex flex-wrap justify-center mt-5">
          <Link href={pageID != 1 ? `tags?page=${pageID - 1}` : ""}>
            <button disabled={pageID === 1} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 transition text-white rounded mx-2 text-xl p-2 pr-3 flex">
              <GrFormPrevious className="my-auto" />
              prev
            </button>
          </Link>
          <Link href={tags.length === 30 ? `tags?page=${pageID + 1}` : ""}>
            <button disabled={tags.length !== 30} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 transition text-white rounded mx-2 text-xl p-2 pl-3 flex">
              next
              <GrFormNext className="my-auto" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
