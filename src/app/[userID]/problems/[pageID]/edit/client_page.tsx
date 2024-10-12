"use client";
import React, { useEffect, useState, useCallback, memo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useTagsContext } from "@/app/components/hooks/tagsContext";
import { signOut, useSession } from "next-auth/react";
import { FaTag } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import CompSitesListbox from "@/app/components/pages/pages/CompSitesListbox";
import TagsDialog from "@/app/components/pages/pages/tagsDialog";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import { ProblemObject, SiteNameType, User } from "@/types/DBTypes";
import { Page } from "@/types/DBTypes";
import { Menu, Transition } from "@headlessui/react";
import { MdKeyboardArrowDown } from "react-icons/md";
import handleProblemUpload from "@/modules/handle/handleProblemUpload";
import HaveNoAuthToEdit from "@/app/components/pages/pages/haveNoAuthToEdit";
import { CompSitesListboxProps, gotTitle } from "@/types/compSitesListboxProps";

interface MakeProblemsProps {
  params: {
    userID: string;
    pageID: string;
  };
}

const CompSitesListboxMemo = memo(function CompSitesListboxDisplayName(props: CompSitesListboxProps) {
  return <CompSitesListbox {...props} />;
});

const MakeProblems: React.FC<MakeProblemsProps> = ({ params }) => {
  const { status } = useSession();
  const [existUser, setExistUser] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPageExist, setIsPageExist] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<string>("");
  const [problems, setProblems] = useState<Map<string, ProblemObject>>(new Map());
  const [gotTitle, setGotTitle] = useState<Map<string, gotTitle>>(new Map());
  const [defaultProblems, setDefaultProblems] = useState<Map<string, ProblemObject>>(new Map());
  const router = useRouter();
  const { handleSetIsOpenTagEditor, tagSearchValue, setTagSearchValue } = useTagsContext();

  useEffect(() => {
    if (!/^[a-zA-Z]+$/.test(params.pageID)) {
      router.replace("/");
      return;
    }
    setTagSearchValue("");
    window.addEventListener("beforeunload", onBeforeunloadHandler);
    return () => {
      window.removeEventListener("beforeunload", onBeforeunloadHandler);
    };
  }, [router, params.pageID, setTagSearchValue]);

  const handleProblemButtonClick = async () => {
    setIsSending(true);
    const res = await axios.post("/api/problems/getTitle", { data: Array.from(problems.entries()) });
    const problemTitleData = res.data.data as [string, { title: string; err: boolean }][];
    let allCorrect = true;
    // errがtrueの場合は、その問題のタイトルが取得できなかったことを示す.
    for (const [id, { err }] of problemTitleData) {
      if (err) {
        allCorrect = false;
        setGotTitle((prev) => {
          const newGotTitle = new Map(prev);
          newGotTitle.set(id, "notGot");
          return newGotTitle;
        });
      } else {
        setGotTitle((prev) => {
          const newGotTitle = new Map(prev);
          newGotTitle.set(id, "got");
          return newGotTitle;
        });
      }
    }
    if (!allCorrect) {
      setIsSending(false);
      setSendingMessage("すべての問題のタイトルを取得できませんでした");
      return;
    }
    handleProblemUpload({
      setIsSending,
      setSendingMessage,
      title,
      description,
      problems,
      problemTitleData,
      tagSearchValue,
      isPublic,
      isPageExist,
      params,
      router,
    });
  };

  const onBeforeunloadHandler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const [fetchMe, fetchProblem] = await Promise.all([axios.get(`/api/db/users/existMe`), axios.get(`/api/db/pages/exist?userID=${params.userID}&pageID=${params.pageID}&pageType=problems`)]);
          if (!fetchMe.data.exist || !fetchMe.data.data) {
            signOut();
            router.replace("/");
          } else {
            const tempUser = fetchMe.data.data as User;
            if (tempUser) {
              if (params.userID === tempUser.id) {
                setCanEdit(true);
                setIsPageExist(fetchProblem.data.exist);
                if (fetchProblem.data.exist) {
                  const tempProblem = fetchProblem.data.data as Page;
                  setTitle(tempProblem.title);
                  const content = JSON.parse(tempProblem.content) as { description: string; problems: [string, { site: SiteNameType; value: string }][] };
                  setDescription(content.description);
                  const nwMap = new Map<string, ProblemObject>();
                  content.problems.forEach((e) => {
                    nwMap.set(e[0], { site: e[1].site, value: e[1].value, isInputValid: true });
                  });
                  setDefaultProblems(nwMap);
                  setProblems(nwMap);
                  setTagSearchValue(tempProblem.tags.join(" "));
                  setIsPublic(tempProblem.is_public);
                }
              }
            } else {
              router.replace("/");
            }
            setExistUser(true);
          }
        } catch (e) {
          router.replace("/");
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [params.pageID, params.userID, router, setTagSearchValue, status]);

  useEffect(() => {
    if (status === "loading" || !existUser) {
      document.title = "Loading...｜TellPro";
    } else if (canEdit) {
      document.title = title === "" ? "untitled" : title;
    } else {
      document.title = "編集権限がありません｜TellPro";
    }
  }, [existUser, canEdit, title, status]);

  const handleSetProblem = useCallback((id: string, site: SiteNameType, value: string, isInputValid: boolean) => {
    setProblems((prev) => {
      const newProblems = new Map(prev);
      newProblems.set(id, { site, value, isInputValid });
      return newProblems;
    });
  }, []);

  const handleDeleteInput = useCallback((id: string) => {
    setProblems((prev) => {
      const newProblems = new Map(prev);
      newProblems.delete(id);
      return newProblems;
    });
  }, []);

  return status == "loading" || !existUser ? (
    // ロード中またはユーザーが存在しない場合.
    <div className="h-full"></div>
  ) : canEdit ? (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
      <h1 className={`text-2xl text-center mt-3 font-bold text-black dark:text-white`}>問題集の編集</h1>
      {/* Title input */}
      <div className="mx-auto mb-8 max-w-screen-md">
        <label htmlFor="title" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-700 dark:text-white`}>
          タイトル(残り: {title.length}/50)
        </label>
        <input
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          defaultValue={title}
          id="title"
          className={`w-full ${
            sendingMessage === "タイトルを入力してください" && title === "" ? "border-red-500" : ""
          } rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
        />
      </div>
      {/* Description input */}
      <div className="mx-auto mb-8 max-w-screen-md">
        <label htmlFor="description" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-700 dark:text-white`}>
          説明(残り: {description.length}/1000)
        </label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          id="description"
          defaultValue={description}
          className={`resize-none w-full h-64 rounded border bg-gray-50 px-3 py-2 outline-none ring-indigo-300 transition duration-100 focus:ring `}
        />
      </div>
      {/* Tag settings */}
      <div className="mx-auto mb-8 max-w-screen-md">
        <b className={`text-gray-700 dark:text-white`}>タグ(残り: {tagSearchValue === "" ? 5 : 5 - tagSearchValue.trim().split(" ").length}/5)</b>
        <div className="flex">
          <button onClick={() => handleSetIsOpenTagEditor(true)} title="タグの設定" className="flex bg-green-500 px-5 py-2 rounded hover:bg-green-600 text-white transition">
            <FaTag className="inline-flex my-auto" />
            <b className="ml-2">タグ</b>
          </button>
          <div className="my-auto ml-3 flex">
            {tagSearchValue === ""
              ? null
              : tagSearchValue
                  .trim()
                  .split(" ")
                  .map((tag) => (
                    <div key={returnRandomString(64)} className="flex bg-gray-300 py-1 px-3 mx-1">
                      <FaTag className="inline-flex my-auto" />
                      <span>{tag}</span>
                    </div>
                  ))}
          </div>
        </div>
      </div>
      {/* Problems */}
      <div className="mx-auto mb-8 max-w-screen-md">
        <b className={`text-gray-700 dark:text-white`}>問題(残り: {10 - problems.size}/10)</b>
        <div>
          {Array.from(problems.keys()).map((id) => (
            <div key={id} className="flex">
              <CompSitesListboxMemo
                id={id}
                defaultProblem={[defaultProblems.get(id)?.site ?? "AtCoder", defaultProblems.get(id)?.value ?? ""]}
                gotTitle={gotTitle.get(id) ?? "notYet"}
                handleDeleteInput={handleDeleteInput}
                handleSetProblem={handleSetProblem}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setProblems((prev) => {
              const newProblems = new Map(prev);
              newProblems.set(returnRandomString(64), { site: "AtCoder", value: "", isInputValid: false });
              return newProblems;
            });
          }}
          disabled={problems.size >= 10}
          className="flex bg-green-500 transition hover:bg-green-600 text-white px-5 py-2 mt-2 mb-5 rounded disabled:hidden"
        >
          <IoMdAddCircleOutline className="my-auto" />
          <b className="ml-2">追加</b>
        </button>
      </div>
      {/* save button */}
      <div className="flex mx-auto mb-8 max-w-screen-md">
        <button
          disabled={isSending}
          onClick={() => {
            handleProblemButtonClick();
          }}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white font-bold py-1 px-4 rounded-l border-r"
        >
          {isPublic ? "公開する" : "下書き"}
        </button>
        <Menu as="div" className="font-bold flex align-middle">
          <Menu.Button disabled={isSending} className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 text-white rounded-r border-l">
            <div className="py-1 px-2">
              <MdKeyboardArrowDown className="text-xl" />
            </div>
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
            <Menu.Items className="absolute mt-10 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
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
                      下書き
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <span className={`text-gray-700 dark:text-white`}>{isSending ? `Too Many Requestsを防止するため${problems.size}秒+αかかります。少しお待ちください` : ""}</span>
      </div>
      <TagsDialog />
    </div>
  ) : (
    // 編集権限が無い場合.
    <HaveNoAuthToEdit />
  );
};

export default MakeProblems;
