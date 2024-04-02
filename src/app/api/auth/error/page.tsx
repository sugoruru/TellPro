import Link from "next/link";
import { BsExclamationCircle } from "react-icons/bs";

export default function ErrorPage() {
  return (
    <>
      <div className="min-h-screen bg-white text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p>ログインに失敗しました</p>
        <p>再度ログインしてください</p>
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
}
