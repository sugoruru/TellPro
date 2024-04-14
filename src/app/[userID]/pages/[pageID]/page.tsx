"use client";
import Loading from "@/app/components/loading";
import returnRandomString from "@/modules/algo/returnRandomString";
import Lex from "@/modules/md/md";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Prism from "prismjs";
import { useEffect, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { FaTag } from "react-icons/fa6";
import data from "@/modules/tags.json";
import Image from "next/image";

export default function Page({ params }: { params: { userID: string; pageID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element>(<></>);
  const [userIcon, setUserIcon] = useState<string>("");
  const [page, setPage] = useState<Page>({} as Page);
  const [isExist, setIsExist] = useState(false);
  const router = useRouter();
  const tagJSON: { [key: string]: any } = data;

  useEffect(() => {
    Prism.highlightAll();
    try {
      const fetch = async () => {
        const fetchUser = await axios.get(`/api/db/users/exist?userID=${params.userID}`);
        if (!fetchUser.data.exist) {
          router.replace("/");
          return;
        }
        setUserIcon(fetchUser.data.data.icon);
        const res = await axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}`);
        if (!res.data.exist) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setPage(res.data.data as Page);
          setContent(Lex({ text: res.data.data.content }));
        }
        setIsLoading(false);
      };
      fetch();
    } catch (e) {
      router.replace("/");
    }
  }, []);

  // TODO: ブックマークを追加する機能を実装する.
  return isLoading ? (
    <>
      <title>TellPro｜ロード中...</title>
      <Loading />
    </>
  ) : isExist ? (
    <>
      <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
      <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
      <div className="mx-auto">
        <div className="flex mt-2 px-1 flex-wrap">
          {page.tags.map((e) => (
            <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
              <FaTag className="inline-flex my-auto mr-1" />
              {tagJSON[String(e)]}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto text-base font-bold text-gray-700">
        <div
          className="flex cursor-pointer"
          onClick={() => {
            router.push(`/${params.userID}`);
          }}
        >
          <Image src={userIcon} alt="" width={24} height={24} className="mr-1" priority />
          <u>@{params.userID}</u>
        </div>
      </div>
      <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5">{content}</div>
    </>
  ) : (
    // ページが存在しない時.
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
  );
}
