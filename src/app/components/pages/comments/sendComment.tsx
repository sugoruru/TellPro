import returnRandomString from "@/modules/algo/returnRandomString";
import Lex from "@/modules/md/md";
import { Page } from "@/types/page";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Dispatch, Fragment, MouseEventHandler, SetStateAction, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";
import { MdDelete, MdEditNote } from "react-icons/md";
import { Comment } from "@/types/comment";
import { IoMdImages } from "react-icons/io";
import ImageUploader from "../main/imageUploader";
import { UserPublic } from "@/types/user";
import { HandleCommentGoodProps } from "@/modules/handle/handleCommentGood";

const SendComment = (props: {
  page: Page;
  isLogin: boolean;
  sendingMessage: string;
  mdAreaValue: string;
  isCommentSending: boolean;
  isLikeSending: boolean;
  isLoading: boolean;
  comments: Comment[];
  me: UserPublic;
  commentUserMap: { [key: string]: UserPublic };
  likeComments: { [key: string]: boolean };
  setUpdateMdAreaValue: Dispatch<SetStateAction<string>>;
  setUpdateCommentID: Dispatch<SetStateAction<string>>;
  setIsOpenUpdateCommentModal: Dispatch<SetStateAction<boolean>>;
  setDeleteCommentID: Dispatch<SetStateAction<string>>;
  setIsOpenDeleteCommentModal: Dispatch<SetStateAction<boolean>>;
  setMdAreaValue: Dispatch<SetStateAction<string>>;
  setComments: Dispatch<SetStateAction<Comment[]>>;
  setCommentLikeUserMap: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  setIsLikeSending: Dispatch<SetStateAction<boolean>>;
  handleCommentGood: (props: HandleCommentGoodProps) => Promise<void>;
  handleCommentUpload: MouseEventHandler<HTMLButtonElement>;
}) => {
  const [isCommentMarkdown, setIsCommentMarkdown] = useState(true);
  const [isOpenImageUpload, setIsOpenImageUpload] = useState(false);
  const [sendingImageMessage, setSendingImageMessage] = useState("");

  return (
    <div className="flex flex-col">
      <b>コメント({props.page.comment_count})</b>
      <hr />
      {props.isLoading ? (
        <></>
      ) : props.isLogin ? (
        <>
          <div className="bg-white">
            <button
              onClick={() => setIsCommentMarkdown(true)}
              className={`${isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
            >
              編集(Markdown)
            </button>
            <button
              onClick={() => setIsCommentMarkdown(false)}
              className={`${!isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
            >
              プレビュー
            </button>
          </div>
          {isCommentMarkdown ? (
            <textarea
              className={`border ${
                props.sendingMessage === "コメントを入力してください" && props.mdAreaValue === "" ? "border-red-500" : ""
              } outline-1 resize-none rounded h-72 mt-2 outline-sky-400 p-1 w-full`}
              placeholder="コメント(Markdown)"
              onChange={(e) => props.setMdAreaValue(e.target.value)}
              value={props.mdAreaValue}
            ></textarea>
          ) : (
            <div>
              <div className="overflow-y-scroll h-72 mt-2 border outline-1 outline-sky-400 p-1 w-full">{Lex({ text: props.mdAreaValue })}</div>
            </div>
          )}
          <div>
            <b className="ml-2 text-red-600">{props.sendingMessage}</b>
            <br />
            <button
              disabled={props.isCommentSending}
              onClick={props.handleCommentUpload}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 w-28 px-4 rounded my-3 border-r"
            >
              投稿する
            </button>
            <button
              onClick={() => {
                setIsOpenImageUpload(true);
                setSendingImageMessage("");
              }}
              title="画像をアップロード"
              className="bg-slate-400 leading-10 transition text-center hover:bg-slate-500 disabled:bg-slate-400 text-white font-bold text-2xl rounded-full mx-2 h-10 w-10"
            >
              <IoMdImages className="inline-flex" />
            </button>
          </div>
          <ImageUploader
            mdAreaValue={props.mdAreaValue}
            sendingImageMessage={sendingImageMessage}
            isOpenImageUpload={isOpenImageUpload}
            setSendingImageMessage={setSendingImageMessage}
            setMdAreaValue={props.setMdAreaValue}
            setIsOpenImageUpload={setIsOpenImageUpload}
          />
        </>
      ) : (
        <div className="h-32 mt-2 border outline-1 outline-sky-400 text-center w-full rounded bg-gray-200 p-10">
          <div>
            <b>ログインをしてコミュニティに参加しましょう！</b>
          </div>
          <div>
            <button
              className="mx-auto sm:block px-5 py-2"
              onClick={() => {
                const btn = document.getElementById("header_login_button");
                if (btn) {
                  btn.click();
                }
              }}
            >
              <span className="rounded-lg bg-indigo-500 px-5 py-2 text-center text-xs font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base">
                ログイン
              </span>
            </button>
          </div>
        </div>
      )}
      <hr />
      {props.isLoading ? (
        <></>
      ) : props.comments.length === 0 ? (
        <p>このページにコメントはありません</p>
      ) : (
        <div>
          {props.comments.map((e) => (
            <div key={returnRandomString(64)} id={e.id}>
              <div className="p-2">
                <div className="flex justify-between">
                  <Link href={`/${e.user_id}`}>
                    <img src={props.commentUserMap[e.user_id].icon} width={30} height={30} alt="" className="inline" />
                    <b className="ml-2">@{e.user_id}</b>
                  </Link>
                  {e.user_id === props.me.id ? (
                    <Menu as="div" className="relative inline-block">
                      <div>
                        <Menu.Button className="inline-flex justify-center rounded-m py-2 text-sm font-medium text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                          <IoChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          className={`absolute right-0 ${
                            e.user_id === props.me.id ? "mt-[-120px]" : "mt-[-80px]"
                          } w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none`}
                        >
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    props.setUpdateMdAreaValue(e.content);
                                    props.setUpdateCommentID(e.id);
                                    props.setIsOpenUpdateCommentModal(true);
                                  }}
                                  className={`${active ? "bg-red-100" : ""} text-gray-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  <MdEditNote className="mr-2 h-5 w-5 text-gray-600" aria-hidden="true" />
                                  編集
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    props.setDeleteCommentID(e.id);
                                    props.setIsOpenDeleteCommentModal(true);
                                  }}
                                  className={`${active ? "bg-red-100" : ""} text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  <MdDelete className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <></>
                  )}
                </div>
                <div>{Lex({ text: e.content })}</div>
                {
                  <div className={`text-center flex`}>
                    <button
                      className={`cursor-pointer w-10 flex flex-col items-center h-10 justify-center bg-white rounded-full border-gray-300 border`}
                      title="いいね"
                      onClick={() => {
                        props.handleCommentGood({
                          me: props.me,
                          comments: props.comments,
                          commentID: e.id,
                          commentLikeUserMap: props.likeComments,
                          setComments: props.setComments,
                          setCommentLikeUserMap: props.setCommentLikeUserMap,
                          setIsLikeSending: props.setIsLikeSending,
                        });
                      }}
                      disabled={props.isLikeSending || !props.isLogin}
                    >
                      {props.likeComments[e.id] ? <FaHeart className="inline-flex text-sm text-red-500" /> : <FaRegHeart className="inline-flex text-sm text-red-500" />}
                    </button>
                    <b className="ml-1 my-auto">{Number(e.like_count)}</b>
                  </div>
                }
              </div>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SendComment;
