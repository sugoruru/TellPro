"use client";
import { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";

/*
DB:
id,user_id,problems[],created_at
problems,codeforces:atcoder:`site/cont/prob`
aizu-online,yukicoder:`site/prob`
*/
export default function MakeProblems({ params }: { params: { userID: string; pageID: string } }) {
  const [problems, setProblems] = useState<string[]>([]);
  return (
    <div>
      <h1 className="text-2xl text-center mt-3 font-bold">問題の作成</h1>
      <div className="flex justify-center">
        <button className="flex bg-green-500 transition hover:bg-green-600 text-white px-5 py-2 mt-2 rounded">
          <IoMdAddCircleOutline className="my-auto" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
