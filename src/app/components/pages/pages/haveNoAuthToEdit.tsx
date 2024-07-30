"use client";

import Link from "next/link";
import { BsExclamationCircle } from "react-icons/bs";

const HaveNoAuthToEdit = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
      <div className="flex justify-center">
        <BsExclamationCircle className="text-green-500 text-6xl" />
      </div>
      <p>編集権限がありません</p>
      <p className="text-sm pt-5">
        <span>(</span>
        <Link href="/" className="text-blue-300">
          こちら
        </Link>
        <span>からホームに戻ることが出来ます)</span>
      </p>
    </div>
  );
};

export default HaveNoAuthToEdit;
