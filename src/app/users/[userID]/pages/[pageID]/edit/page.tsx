"use client";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Menu, Transition } from "@headlessui/react";
import Lex from "@/modules/md/md";
import Prism from "prismjs";

export default function MakeNewPage({ params }: { params: { userID: string; pageID: string } }) {
  const { status } = useSession();
  const [existUser, setExistUser] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [mdAreaValue, setMdAreaValue] = useState("");
  const [title, setTitle] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();
  const [content, setContent] = useState<JSX.Element>(<></>);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const fetchUser = await axios.get(`/api/db/users/exist`);
          const fetchPage = await axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}`);
          if (!fetchUser.data.exist || !fetchUser.data.data) {
            signOut();
            router.push("/");
          } else {
            setExistUser(true);
            const tempUser = fetchUser.data.data as User;
            if (tempUser) {
              if (params.userID === tempUser.ID) {
                setCanEdit(true);
                if (fetchPage.data.exist) {
                  const tempPage = fetchPage.data.data as Page;
                  setMdAreaValue(tempPage.content);
                  setTitle(tempPage.title);
                  setTags(tempPage.tags);
                  setIsPublic(tempPage.isPublic);
                }
              }
            } else {
              router.push("/");
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          router.push("/");
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  useEffect(() => {
    if (!isMarkdown) {
      setContent(Lex({ text: mdAreaValue }));
    }
  }, [isMarkdown]);

  // TODO: 編集権限の無いページのレイアウトを作成する
  // TODO: タイトルバーの設定を作成する
  return status == "loading" || !existUser ? (
    // ロード中またはユーザーが存在しない場合.
    <>
      <title>TellPro｜ロード中...</title>
      <Loading />
    </>
  ) : canEdit ? (
    // 編集権限がある場合.
    <div className={`grow ${isMarkdown ? "bg-white" : "bg-slate-100"} flex-col flex h-full`}>
      <title>{title === "" ? "untitled" : title}</title>
      <div className="bg-white">
        <button onClick={() => setIsMarkdown(true)} className={`${isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}>
          編集(Markdown)
        </button>
        <button onClick={() => setIsMarkdown(false)} className={`${!isMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}>
          プレビュー
        </button>
      </div>
      {isMarkdown ? (
        // マークダウンタブの場合.
        <>
          <div className="border-b w-full p-3">
            <input type="text" className="border outline-1 outline-sky-400 rounded p-1 h-10 text-xl w-full" placeholder="タイトル" onChange={(e) => setTitle(e.target.value)} value={title} />
          </div>
          <div className="grow w-full p-3">
            <textarea
              className="border outline-1 resize-none rounded h-5/6 outline-sky-400 p-1 w-full"
              placeholder="本文(Markdown)"
              onChange={(e) => setMdAreaValue(e.target.value)}
              value={mdAreaValue}
            ></textarea>
            <div className="justify-end flex mt-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded-l border-r">{isPublic ? "公開する" : "下書き保存"}</button>
              <Menu as="div" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-r border-l">
                <Menu.Button>
                  <MdKeyboardArrowDown className="text-xl" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="transform -translate-y-36 -translate-x-3 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active || isPublic ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setIsPublic(true)}
                          >
                            公開する
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active || !isPublic ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setIsPublic(false)}
                          >
                            下書き保存
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </>
      ) : (
        // プレビュータブの場合.
        <>
          <div className="text-center text-4xl font-bold text-gray-700 my-5">{title === "" ? "untitled" : title}</div>
          <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5">{content}</div>
        </>
      )}
    </div>
  ) : (
    // 編集権限が無い場合.
    <div>編集権限がありません</div>
  );
}
