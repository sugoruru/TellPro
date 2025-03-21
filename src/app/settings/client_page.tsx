"use client";
import { handleUserNameChange } from "@/modules/handle/handleUserNameChange";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import handleImageChange from "@/modules/handle/handleImageChange";
import sendImage from "@/modules/network/sendImage";
import { User } from "@/types/DBTypes";
import { UserContext } from "../components/providers/userProvider";
import React from "react";
import { DBUsersExistMe } from "@/types/axiosTypes";

export default function Settings() {
  const { data: session, status } = useSession();
  const [isSignIn, setIsSignIn] = useState(false);
  const [existUser, setExistUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUserNameError, setIsUserNameError] = useState(false);
  const [isChangeImage, setIsChangeImage] = useState(false);
  const [userNameErrorMessage, setUserNameErrorMessage] = useState("");
  const [areaValue, setAreaValue] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [stateMessage, setStateMessage] = useState("");
  const [deleteAccountStateMessage, setDeleteAccountStateMessage] = useState("");
  const [atCoderID, setAtCoderID] = useState("");
  const [codeForcesID, setCodeForcesID] = useState("");
  const [xID, setXID] = useState("");
  const router = useRouter();
  const headerData = useContext(UserContext);

  useEffect(() => {
    if (status === "authenticated") {
      setIsSignIn(true);
      const fetchData = async () => {
        try {
          const response = await axios.get<DBUsersExistMe>(`/api/db/users/existMe`);
          if (response.data.ok) {
            if (!response.data.exist || !response.data.data) {
              signOut();
            } else {
              setUser(response.data.data as User);
              setAreaValue(response.data.data.status_message);
              setSelectedImage(response.data.data.icon);
              setAtCoderID(response.data.data.atcoder_id);
              setCodeForcesID(response.data.data.codeforces_id);
              setXID(response.data.data.x_id);
              setExistUser(true);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (isSignIn && existUser) {
      document.title = "Settings｜TellPro";
    } else {
      document.title = "Loading...｜TellPro";
    }
  }, [isSignIn, existUser]);

  const handleSendButton = async (dataURL: string) => {
    setIsSending(true);
    if (isUserNameError) {
      setStateMessage("ユーザー名が正しく入力されていません");
      setIsSending(false);
      return;
    }
    if (atCoderID !== "") {
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(atCoderID)) {
        setStateMessage("AtCoderIDが正しく入力されていません");
        setIsSending(false);
        return;
      }
    }
    if (codeForcesID !== "") {
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(codeForcesID)) {
        setStateMessage("CodeForcesIDが正しく入力されていません");
        setIsSending(false);
        return;
      }
    }
    if (xID !== "") {
      if (!/^[a-zA-Z0-9_]{1,15}$/.test(xID)) {
        setStateMessage("X(旧Twitter)IDが正しく入力されていません");
        setIsSending(false);
        return;
      }
    }
    try {
      if (session && user && existUser && session.user) {
        setStateMessage("ユーザーが存在するかを確認中...");
        const existUser = await axios.get<DBUsersExistMe>(`/api/db/users/existMe`);
        if (existUser.data.ok && !existUser.data.exist) {
          router.replace("/");
          setIsSending(false);
          return;
        }
        let imgLink = selectedImage;
        if (isChangeImage) {
          setStateMessage("画像データをアップロード中...");
          imgLink = await sendImage(dataURL, setStateMessage);
        }
        setStateMessage("データベースにデータを送信中...");
        await axios.post("/api/db/users/update", {
          ID: user.id,
          userName: (document.getElementById("userName_tellPro") as HTMLInputElement).value,
          mail: session.user.email,
          icon: imgLink,
          status_message: areaValue,
          atcoder_id: atCoderID,
          codeforces_id: codeForcesID,
          x_id: xID,
        });
        setIsSending(false);
        setStateMessage("完了しました");
        if (process.env.NEXT_PUBLIC_TRUTH_URL) location.href = process.env.NEXT_PUBLIC_TRUTH_URL;
      } else {
        setStateMessage("エラーが発生しました");
        setIsSending(false);
        return;
      }
    } catch (err) {
      setStateMessage("エラーが発生しました");
      setIsSending(false);
      return;
    }
  };

  const handleDeleteAccountButton = async () => {
    setIsSending(true);
    try {
      if (session && user && existUser && session.user) {
        setDeleteAccountStateMessage("ユーザーが存在するかを確認中...");
        const existUser = await axios.get<DBUsersExistMe>(`/api/db/users/existMe`);
        if (existUser.data.ok && !existUser.data.exist) {
          router.replace("/");
          setIsSending(false);
          return;
        }
        const confirmMessage = confirm("アカウントを削除しますか？");
        if (confirmMessage === true) {
          setDeleteAccountStateMessage("アカウントを削除中...");
        } else {
          setDeleteAccountStateMessage("");
          setIsSending(false);
          return;
        }
        await axios.post("/api/db/users/delete", {
          userID: user.id,
        });
        signOut();
        setIsSending(false);
        router.replace("/");
      } else {
        setIsSending(false);
        return;
      }
    } catch (err) {
      setIsSending(false);
      return;
    }
  };

  return (
    <>
      {isSignIn && existUser ? (
        <div className={`py-6 bg-white dark:bg-zinc-800`}>
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
            <div className="mb-10 md:mb-16">
              <h2 className={`text-center text-2xl font-bold lg:text-3xl text-gray-800 dark:text-white`}>Settings</h2>
              <h4 className={`text-center font-bold text-gray-800 dark:text-white`}>(ヘッダーロゴを押すとホームに戻れます)</h4>
            </div>
            <div className={`mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2 font-bold text-2xl text-black dark:text-white`}>アカウント設定</div>
            <div className="mx-auto mb-8 grid max-w-screen-md gap-10 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="userName_tellPro" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-800 dark:text-white`}>
                  ユーザー名
                  <p className="text-red-500">{userNameErrorMessage}</p>
                </label>
                <input
                  onChange={(e) => {
                    const x = handleUserNameChange(e);
                    setIsUserNameError(x.isUserNameError);
                    setUserNameErrorMessage(x.userNameErrorMessage);
                  }}
                  disabled={isSending}
                  defaultValue={user ? user.username : ""}
                  id="userName_tellPro"
                  className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ${isUserNameError ? "ring-pink-600" : "ring-indigo-300"} transition duration-100 focus:ring`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="AtCoder_ID" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-800 dark:text-white`}>
                  AtCoderID
                </label>
                <input
                  onChange={(e) => {
                    setAtCoderID(e.target.value);
                  }}
                  disabled={isSending}
                  defaultValue={user ? user.atcoder_id : ""}
                  id="AtCoder_ID"
                  placeholder="AtCoderID"
                  className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="CodeForces_ID" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-800 dark:text-white`}>
                  CodeForcesID
                </label>
                <input
                  onChange={(e) => {
                    setCodeForcesID(e.target.value);
                  }}
                  disabled={isSending}
                  defaultValue={user ? user.codeforces_id : ""}
                  id="CodeForces_ID"
                  placeholder="CodeForcesID"
                  className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="X_ID" className={`mb-2 font-bold inline-block text-sm sm:text-base text-gray-800 dark:text-white`}>
                  {headerData.user.hateX ? "Twitter" : "X"}({headerData.user.hateX ? "現X" : "旧Twitter"})ID
                </label>
                <div className="flex">
                  <span className="bg-gray-200 border p-3 rounded-tl rounded-bl">@</span>
                  <input
                    onChange={(e) => {
                      setXID(e.target.value);
                    }}
                    disabled={isSending}
                    defaultValue={user ? user.x_id : ""}
                    id="X_ID"
                    placeholder={`${headerData.user.hateX ? "Twitter" : "X"}(${headerData.user.hateX ? "現X" : "旧Twitter"})ID`}
                    className={`w-full rounded-br rounded-tr border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring`}
                  />
                </div>
              </div>
              <div className="flex">
                <span className={`text-black dark:text-white`}>Twitter過激派ボタン:</span>
                <label className="inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={headerData.user.hateX}
                    onChange={() => {
                      localStorage.setItem("hateX", headerData.user.hateX ? "false" : "true");
                      headerData.setUser!((prev) => ({ ...prev, hateX: !prev.hateX }));
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                </label>
              </div>
              <br />
              <div className="flex">
                <div className="rounded-md border border-indigo-500 bg-gray-50 p-4 shadow-md w-36">
                  <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-600 font-medium">Upload file</span>
                  </label>
                  <input
                    id="upload"
                    type="file"
                    className="hidden"
                    disabled={isSending}
                    accept=".jpg, .jpeg, .png"
                    onChange={async (e) => {
                      setSelectedImage(await handleImageChange(e));
                      setIsChangeImage(true);
                    }}
                  />
                </div>
                <div className="my-auto mx-5 text-center">
                  <span className={`text-gray-800 dark:text-white`}>preview</span>
                  <img src={selectedImage == "" ? user!.icon : selectedImage} className="border rounded-full object-cover" width={60} height={60} style={{ width: "80px", height: "80px" }} alt={""} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="inline-block text-sm text-gray-800 sm:text-base">
                  ステータスメッセージ(残り{200 - areaValue.length}字)
                </label>
                <textarea
                  id="message"
                  onChange={(e) => {
                    if (e.target.value.length <= 200) setAreaValue(e.target.value);
                  }}
                  value={areaValue}
                  disabled={isSending}
                  maxLength={200}
                  className="h-64 w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
                ></textarea>
              </div>
            </div>
            {/*送信ボタン*/}
            <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2 mb-5">
              <div className="flex items-center justify-between sm:col-span-2">
                <button
                  onClick={() => handleSendButton(selectedImage)}
                  disabled={isSending}
                  className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
                >
                  Send
                </button>
                <p>{stateMessage}</p>
              </div>
            </div>
            <hr />
            <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2 mt-5 font-bold text-2xl text-red-600">アカウント削除設定</div>
            <div className="mx-auto max-w-screen-md gap-10 sm:grid-cols-2 w-full">
              <div className="h-64 w-full">
                <p className={`text-xl my-2 font-bold text-gray-800 dark:text-white`}>削除したアカウントはもとに戻すことができません！！</p>
                <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2 mb-5">
                  <div className="flex items-center justify-between sm:col-span-2">
                    <button
                      onClick={() => handleDeleteAccountButton()}
                      disabled={isSending}
                      className="inline-block rounded-lg bg-red-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-red-300 transition duration-100 hover:bg-red-600 focus-visible:ring active:bg-red-700 md:text-base"
                    >
                      アカウントを削除する
                    </button>
                    <p className={`text-gray-800 dark:text-white`}>{deleteAccountStateMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full"></div>
      )}
    </>
  );
}
