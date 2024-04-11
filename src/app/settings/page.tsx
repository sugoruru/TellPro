"use client";
import { handleUserNameChange } from "@/modules/handle/handleUserNameChange";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import handleImageChange from "@/modules/handle/handleImageChange";
import getImageBase64 from "@/modules/network/getImageBase64";
import imageSendToImgur from "@/modules/network/imageSendToImgur";
import Loading from "../components/loading";

export default function Settings() {
  const { data: session, status } = useSession();
  let [isSignIn, setIsSignIn] = useState(false);
  let [existUser, setExistUser] = useState(false);
  let [user, setUser] = useState<User | null>(null);
  let [isSending, setIsSending] = useState(false);
  let [isUserNameError, setIsUserNameError] = useState(false);
  let [userNameErrorMessage, setUserNameErrorMessage] = useState("");
  let [areaValue, setAreaValue] = useState("");
  let [selectedImage, setSelectedImage] = useState("");
  let [stateMessage, setStateMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      setIsSignIn(true);
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/users/existMe`);
          if (!response.data.exist || !response.data.data) {
            signOut();
          } else {
            setExistUser(true);
            setUser(response.data.data as User);
            setAreaValue(response.data.data.statusMessage);
            setSelectedImage(await getImageBase64(response.data.data.icon));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  const handleSendButton = async (dataURL: string) => {
    setIsSending(true);
    if (isUserNameError) {
      setStateMessage("ユーザー名が正しく入力されていません");
      setIsSending(false);
      return;
    }
    try {
      if (session && user && existUser && session.user) {
        setStateMessage("ユーザーが存在するかを確認中...");
        const existUser = await axios.get(`/api/db/users/existMe`);
        if (!existUser.data.exist) {
          router.push("/");
          setIsSending(false);
          return;
        }
        setStateMessage("画像データをimgurにアップロード中...");
        const imgLink = await imageSendToImgur(dataURL, setStateMessage);
        setStateMessage("データベースにデータを送信中...");
        await axios.post("/api/db/users/update", {
          ID: user.ID,
          userName: (document.getElementById("userName_tellPro") as HTMLInputElement).value,
          mail: session.user.email,
          icon: imgLink,
          statusMessage: areaValue,
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

  return (
    <>
      {isSignIn && existUser ? (
        <div className="bg-white py-6">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
            <div className="mb-10 md:mb-16">
              <h2 className="text-center text-2xl font-bold text-gray-800 lg:text-3xl">Settings</h2>
              <h4 className="text-center font-bold text-gray-800">(ヘッダーロゴを押すとホームに戻れます)</h4>
            </div>
            <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="userName_tellPro" className="mb-2 inline-block text-sm text-gray-800 sm:text-base">
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
                  defaultValue={user?.username}
                  id="userName_tellPro"
                  className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ${isUserNameError ? "ring-pink-600" : "ring-indigo-300"} transition duration-100 focus:ring`}
                />
              </div>
              <div className="flex">
                <div className="rounded-md border border-indigo-500 bg-gray-50 p-4 shadow-md w-36">
                  <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-600 font-medium">Upload file</span>
                  </label>
                  <input id="upload" type="file" className="hidden" disabled={isSending} accept=".jpg, .jpeg, .png" onChange={async (e) => setSelectedImage(await handleImageChange(e))} />
                </div>
                <div className="my-auto mx-5 text-center">
                  <span>preview</span>
                  <Image
                    src={selectedImage == "" ? user!.icon : selectedImage}
                    className="border rounded-full object-cover"
                    width={60}
                    height={60}
                    style={{ width: "80px", height: "80px" }}
                    alt={""}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-2 inline-block text-sm text-gray-800 sm:text-base">
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
            <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2">
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
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
