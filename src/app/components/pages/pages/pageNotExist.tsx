import Link from "next/link";
import { BsExclamationCircle } from "react-icons/bs";

const PageNotExist = () => {
  return (
    <>
      <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p>ページが存在しません</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </>
  );
};

export default PageNotExist;
