"use client";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

// 検索ページ.
export default function SearchPage() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  useEffect(() => {
    document.title = "Search｜TellPro";
  }, []);

  return (
    <div className="h-full">
      <h1 className="font-bold text-2xl text-center mt-5">キーワード検索</h1>
      <div className="flex justify-center text-xl items-center">
        <div className={`bg-white w-4/5 lg:w-3/5 flex items-center mt-5 px-4 transition-all border-2 rounded-lg ${isInputFocused ? "border-sky-400 shadow-xl" : "border-gray-200"}`}>
          <label htmlFor="tellpro_search">
            <IoSearch className={`${isInputFocused ? "text-sky-400" : "text-gray-400"}`} />
          </label>
          <input
            onBlur={() => setIsInputFocused(false)}
            onFocus={() => setIsInputFocused(true)}
            type="text"
            className="h-12 w-full outline-none ml-3"
            placeholder="キーワードを入力"
            id="tellpro_search"
          />
        </div>
      </div>
    </div>
  );
}
