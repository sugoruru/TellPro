import { Page } from "@/types/page";
import { UserPublic } from "@/types/user";
import Link from "next/link";
import { MouseEventHandler } from "react";
import { FaBookmark, FaHeart, FaRegBookmark, FaRegHeart, FaSquareXTwitter, FaSquareTwitter } from "react-icons/fa6";
import { MdEditNote } from "react-icons/md";

const PageMenu = (props: {
  handleGoodButton: MouseEventHandler<HTMLButtonElement>;
  handleBookmark: MouseEventHandler<HTMLButtonElement>;
  isLikeSending: boolean;
  isLogin: boolean;
  isLike: boolean;
  isBookmarkSending: boolean;
  isBookmark: boolean;
  page: Page;
  userID: string;
  pageID: string;
  me: UserPublic;
  pageType: string;
}) => {
  return (
    <>
      <div className="fixed right-0 p-1 w-full lg:w-auto bottom-0 bg-slate-100 lg:right-2 lg:bottom-2 lg:bg-inherit">
        <div className="flex flex-row lg:flex-col justify-center lg:justify-normal h-10 lg:h-auto">
          <div className={`text-center lg:mr-2 flex lg:block mx-2`}>
            <button
              className={`cursor-pointer w-10 lg:w-16 flex flex-col items-center h-10 lg:h-16 justify-center bg-white rounded-full border-gray-300 border`}
              title="いいね"
              onClick={props.handleGoodButton}
              disabled={props.isLikeSending || !props.isLogin}
            >
              {props.isLike ? <FaHeart className="inline-flex text-sm lg:text-3xl text-red-500" /> : <FaRegHeart className="inline-flex text-sm lg:text-3xl text-red-500" />}
            </button>
            <b className={`ml-1 my-auto text-black dark:text-white`}>{Number(props.page.like_count)}</b>
          </div>
          <div className="text-center mb-2 lg:mr-2 mx-2">
            <button
              className={`cursor-pointer flex items-center justify-center w-10 lg:w-16 h-10 lg:h-16 bg-white rounded-full border-gray-300 border`}
              title="ブックマーク"
              onClick={props.handleBookmark}
              disabled={props.isBookmarkSending || !props.isLogin}
            >
              {props.isBookmark ? <FaBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" /> : <FaRegBookmark className="inline-flex text-sm lg:text-3xl text-blue-500" />}
            </button>
          </div>
          <div className="text-center mb-2 lg:mr-2 mx-2">
            <Link target="_blank" href={`https://x.com/share?text=おすすめのページを見つけたよ！%0A${process.env.NEXT_PUBLIC_TRUTH_URL}/${props.userID}/${props.pageType}/${props.pageID}%0A`}>
              <div
                className={`cursor-pointer flex items-center justify-center w-10 lg:w-16 h-10 lg:h-16 bg-white rounded-full border-gray-300 border`}
                title={localStorage.getItem("hateX") === "true" ? "Twitterへ共有" : "Xへ共有"}
              >
                {localStorage.getItem("hateX") === "true" ? (
                  <FaSquareTwitter className="inline-flex text-xl lg:text-4xl text-black-500" />
                ) : (
                  <FaSquareXTwitter className="inline-flex text-xl lg:text-4xl text-black-500" />
                )}
              </div>
            </Link>
          </div>
          {props.me.id === props.userID ? (
            <Link title="編集" className={`mx-2 cursor-pointer`} href={`/${props.userID}/${props.pageType}/${props.pageID}/edit`}>
              <div className="flex items-center justify-center w-10 h-10 lg:w-16 lg:h-16 bg-white rounded-full border-gray-300 border">
                <MdEditNote className="inline-flex text-base lg:text-4xl" />
              </div>
            </Link>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default PageMenu;
