"use client";
import TagsDialog from "@/app/components/pages/pages/tagsDialog";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import { FaTag } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useTagsContext } from "@/app/components/hooks/tagsContext";

export default function MakeProblems({ params }: { params: { userID: string; pageID: string } }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const router = useRouter();
  const { handleSetIsOpenTagEditor } = useTagsContext();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
  }, [router, params.pageID]);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
      <h1 className="text-2xl text-center mt-3 font-bold">問題集の作成</h1>
      <div className="mx-auto mb-8 max-w-screen-md">
        <label htmlFor="title" className="mb-2 font-bold inline-block text-sm text-gray-800 sm:text-base">
          Title(残り: {title.length}/50)
        </label>
        <input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          maxLength={50}
          id="title"
          className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
        />
      </div>
      <div className="mx-auto mb-8 max-w-screen-md">
        <label htmlFor="description" className="mb-2 font-bold inline-block text-sm text-gray-800 sm:text-base">
          Description(残り: {description.length}/1000)
        </label>
        <textarea
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          maxLength={1000}
          id="description"
          className={`resize-none w-full h-64 rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
        />
      </div>
      <div className="mx-auto mb-8 max-w-screen-md">
        <b>Tags</b>
        <button onClick={() => handleSetIsOpenTagEditor(true)} title="タグの設定" className="flex bg-gray-300 px-5 py-2 rounded-sm hover:bg-gray-400 transition">
          <FaTag className="inline-flex" />
          <b className="ml-2">Tags</b>
        </button>
      </div>
      <div className="mx-auto mb-8 max-w-screen-md">
        <b>Problems</b>
        <button className="flex bg-green-500 transition hover:bg-green-600 text-white px-5 py-2 mt-2 mb-5 rounded">
          <IoMdAddCircleOutline className="my-auto" />
          <span>Add</span>
        </button>
      </div>
      <TagsDialog />
    </div>
  );
}
