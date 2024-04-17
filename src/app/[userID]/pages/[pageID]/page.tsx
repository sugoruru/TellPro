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
import { FaBook, FaTag } from "react-icons/fa6";
import data from "@/modules/tags.json";
import Image from "next/image";
import { MdEditNote } from "react-icons/md";
import getImageBase64 from "@/modules/network/getImageBase64";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

export default function Page({ params }: { params: { userID: string; pageID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element>(<></>);
  const [userIcon, setUserIcon] = useState<string>("");
  const [page, setPage] = useState<Page>({} as Page);
  const [isExist, setIsExist] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const [myID, setMyID] = useState("");
  const router = useRouter();
  const tagJSON: Tags = data;

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    Prism.highlightAll();
    try {
      const fetch = async () => {
        const [fetchUser, me, isLike] = await Promise.all([
          axios.get(`/api/db/users/exist?userID=${params.userID}`),
          axios.get(`/api/db/users/existMe`),
          axios.get(`/api/db/likes/getLiked?userID=${params.userID}&pageID=${params.pageID}`),
        ]);
        if (!fetchUser.data.exist || !isLike.data.ok) {
          router.replace("/");
          return;
        }
        setIsLike(isLike.data.isLiked);
        setUserIcon(await getImageBase64(fetchUser.data.data.icon));
        const res = await axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}`);
        if (!res.data.exist) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setPage(res.data.data as Page);
          setContent(Lex({ text: res.data.data.content }));
          if (me.data.ok && me.data.exist) {
            setMyID(me.data.data.ID);
          }
        }
        setIsLoading(false);
      };
      fetch();
    } catch (e) {
      router.replace("/");
    }
  }, []);

  const handleGoodButton = async () => {
    setIsLike(!isLike);
  };

  const handleBookmark = async () => {
    setIsBookmark(!isBookmark);
  };

  // TODO: ブックマークを追加する機能を実装する.
  // TODO: いいね機能を実装する→Like DBとuser DBを上書きする.
  // TODO: コメント機能を実装する.
  // TODO: ページの目次(MDのheaderから)を作成する.
  // TODO: 最終ログインをUser DBに記録していいねのお知らせが来るようにする.
  // TODO: ページの削除を作成.
  return isLoading ? (
    <>
      <title>TellPro｜ロード中...</title>
      <Loading />
    </>
  ) : isExist ? (
    myID === params.userID || page.isPublic ? (
      <>
        <div className="text-center text-4xl font-bold text-gray-700 my-5">{page.title === "" ? "untitled" : page.title}</div>
        <div className="text-center text-base font-bold text-gray-700">公開日時:{page.date.split("T")[0]}</div>
        <div className="mx-auto">
          <div className="flex mt-2 px-1 flex-wrap">
            {page.tags.map((e) => (
              <div className="select-none m-2 px-2 cursor-pointer flex rounded-sm h-6 bg-slate-300" key={returnRandomString(32)}>
                <FaTag className="inline-flex my-auto mr-1" />
                {tagJSON.tags[Number(e)].name}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto text-base font-bold text-gray-700">
          <Link href={`/${params.userID}`} className="flex cursor-pointer">
            <Image src={userIcon} alt="" width={24} height={24} className="mr-1" priority />
            <u>@{params.userID}</u>
          </Link>
        </div>
        <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5">{content}</div>
        <Link title="編集" className={`cursor-pointer ${myID === params.userID ? "" : "hidden"}`} href={`/${params.userID}/pages/${params.pageID}/edit`}>
          <div className="flex items-center justify-center w-16 h-16 bg-slate-300 hover:bg-blue-200 transition rounded-full fixed bottom-[30px] right-[30px]">
            <MdEditNote className="inline-flex text-4xl" />
          </div>
        </Link>
        <div
          className={`cursor-pointer flex items-center justify-center w-16 h-16 bg-slate-300 hover:bg-blue-200 transition rounded-full fixed ${
            myID === params.userID ? "bottom-[120px]" : "bottom-[30px]"
          } right-[30px]`}
          title="いいね"
          onClick={handleGoodButton}
        >
          {isLike ? <FaHeart className="inline-flex text-3xl text-red-500" /> : <FaRegHeart className="inline-flex text-3xl text-red-500" />}
        </div>
        <div
          className={`cursor-pointer flex items-center justify-center w-16 h-16 bg-slate-300 hover:bg-blue-200 transition rounded-full fixed ${
            myID === params.userID ? "bottom-[210px]" : "bottom-[120px]"
          } right-[30px]`}
          title="ブックマーク"
          onClick={handleBookmark}
        >
          {isBookmark ? <FaBookmark className="inline-flex text-3xl text-blue-500" /> : <FaRegBookmark className="inline-flex text-3xl text-blue-500" />}
        </div>
      </>
    ) : (
      // ページが非公開の時.
      <div className="h-full bg-slate-100 text-center text-2xl font-black text-gray-600 py-10">
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p>ページが非公開です</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    )
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
