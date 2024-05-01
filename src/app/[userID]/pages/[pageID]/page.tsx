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
import { MdEditNote } from "react-icons/md";
import getImageBase64 from "@/modules/network/getImageBase64";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import sleep from "@/modules/sleep";

export default function Page({ params }: { params: { userID: string; pageID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element>(<></>);
  const [userIcon, setUserIcon] = useState<string>("");
  const [page, setPage] = useState<Page>({} as Page);
  const [isExist, setIsExist] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const [isLikeSending, setIsLikeSending] = useState(false);
  const [isBookmarkSending, setIsBookmarkSending] = useState(false);
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
        const [fetchUser, me, isLike, isBookmark] = await Promise.all([
          axios.get(`/api/db/users/exist?userID=${params.userID}`),
          axios.get(`/api/db/users/existMe`),
          axios.get(`/api/db/likes/exist?pageUserID=${params.userID}&pageID=${params.pageID}&URLType=pages`),
          axios.get(`/api/db/bookmarks/exist?pageUserID=${params.userID}&pageID=${params.pageID}&URLType=pages`),
        ]);
        if (!fetchUser.data.exist || !isLike.data.ok || !isBookmark.data.ok) {
          router.replace("/");
          return;
        }
        setIsLike(isLike.data.isLiked);
        setIsBookmark(isBookmark.data.isBookmark);
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
  }, [params.pageID, params.userID, router]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isExist) {
      if (myID === params.userID || page.isPublic) {
        document.title = `${page.title}｜TellPro`;
      } else {
        document.title = "ページが非公開です｜TellPro";
      }
    } else {
      document.title = "ページが存在しません｜TellPro";
    }
  }, [isLoading, isExist, myID, page.isPublic, params.userID, page.title]);

  const handleGoodButton = async () => {
    try {
      setIsLikeSending(true);
      if (!isLike) {
        setIsLike(true);
        setPage({ ...page, likeCount: Number(page.likeCount) + 1 });
        await axios.post("/api/db/likes/create", {
          myID: myID,
          pageUserID: params.userID,
          pageID: params.pageID,
          URLType: "pages",
        });
      } else {
        setIsLike(false);
        setPage({ ...page, likeCount: Number(page.likeCount) - 1 });
        await axios.post("/api/db/likes/delete", {
          myID: myID,
          pageUserID: params.userID,
          pageID: params.pageID,
          URLType: "pages",
        });
      }
      // 連打防止用に1秒待機.
      await sleep(1000);
      setIsLikeSending(false);
    } catch (e) {
      console.log(e);
      setIsLikeSending(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarkSending(true);
      if (!isBookmark) {
        setIsBookmark(true);
        await axios.post("/api/db/bookmarks/create", {
          myID: myID,
          pageUserID: params.userID,
          pageID: params.pageID,
          URLType: "pages",
        });
      } else {
        setIsBookmark(false);
        await axios.post("/api/db/bookmarks/delete", {
          myID: myID,
          pageUserID: params.userID,
          pageID: params.pageID,
          URLType: "pages",
        });
      }
      // 連打防止用に1秒待機.
      await sleep(1000);
      setIsBookmarkSending(false);
    } catch (e) {
      console.log(e);
      setIsLikeSending(false);
    }
  };

  // TODO:(UI) コメント機能を実装する.
  // TODO:(DEV) ページの目次(MDのheaderから)を作成する.
  // TODO:(DEV) 最終ログインと比較していいねのお知らせが来るようにする.
  return isLoading ? (
    <>
      <Loading title="読み込み中..." />
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
        <div className="fixed right-2 bottom-2">
          <div className="flex flex-col">
            <div className={`text-center w-16`}>
              <button
                className={`cursor-pointer flex flex-col items-center w-16 h-16 justify-center bg-slate-300 hover:bg-blue-200 transition rounded-full`}
                title="いいね"
                onClick={handleGoodButton}
                disabled={isLikeSending}
              >
                {isLike ? <FaHeart className="inline-flex text-3xl text-red-500" /> : <FaRegHeart className="inline-flex text-3xl text-red-500" />}
              </button>
              <b className="">{Number(page.likeCount)}</b>
            </div>
            <div className="text-center mb-2">
              <button
                className={`cursor-pointer flex items-center justify-center w-16 h-16 bg-slate-300 hover:bg-blue-200 transition rounded-full`}
                title="ブックマーク"
                onClick={handleBookmark}
                disabled={isBookmarkSending}
              >
                {isBookmark ? <FaBookmark className="inline-flex text-3xl text-blue-500" /> : <FaRegBookmark className="inline-flex text-3xl text-blue-500" />}
              </button>
            </div>
            <Link title="編集" className={`cursor-pointer ${myID === params.userID ? "" : "hidden"}`} href={`/${params.userID}/pages/${params.pageID}/edit`}>
              <div className="flex items-center justify-center w-16 h-16 bg-slate-300 hover:bg-blue-200 transition rounded-full">
                <MdEditNote className="inline-flex text-4xl" />
              </div>
            </Link>
          </div>
        </div>
      </>
    ) : (
      // ページが非公開の時.
      <>
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
      </>
    )
  ) : (
    // ページが存在しない時.
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
}
