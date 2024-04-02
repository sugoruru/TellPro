"use client";
import { handleUserNameChange } from "@/modules/handleUserNameChange";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { IoCloudUploadOutline } from "react-icons/io5";
import handleImageChange from "@/modules/handleImageChange";
import getImageBase64 from "@/modules/getImageBase64";

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
          const response = await axios.get(`/api/db/exist?user=${session.user?.email}`);
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
      if (session) {
        setStateMessage("ユーザーが存在するかを確認中...");
        const existUser = await axios.get(`/api/db/exist?user=${session.user?.email}`);
        if (!existUser.data.exist) {
          router.push("/");
          setIsSending(false);
          return;
        }
        setStateMessage("画像データをimgurにアップロード中...");
        const formData = new FormData();
        formData.append("image", dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
        const response = await axios.post("https://api.imgur.com/3/image", formData, {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
          },
          responseType: "json",
          onUploadProgress: function (progressEvent) {
            if (progressEvent.total) {
              setStateMessage("画像データをimgurにアップロード中..." + Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%");
            }
          },
        });
        const imgLink = response.data.data.link;
        setStateMessage("データベースにデータを送信中...");
        await axios.post("/api/db/update", {
          ID: user?.ID,
          userName: (document.getElementById("userName_tellPro") as HTMLInputElement).value,
          mail: session?.user?.email,
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
        <div className="bg-white py-6 sm:py-8 lg:py-12">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
            <div className="mb-10 md:mb-16">
              <h2 className="text-center text-2xl font-bold text-gray-800 lg:text-3xl">Settings</h2>
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
              <div className="relative">
                <label
                  title="Click to upload"
                  htmlFor="button2"
                  className="cursor-pointer flex items-center gap-4 px-6 py-4 before:border-gray-400/60 hover:before:border-gray-300 group before:bg-gray-100 before:absolute before:inset-0 before:rounded-3xl before:border before:border-dashed before:transition-transform before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95"
                >
                  <div className="w-max relative">
                    <IoCloudUploadOutline className="w-12 text-3xl" />
                  </div>
                  <div className="relative">
                    <span className="block text-base font-semibold relative text-blue-900 group-hover:text-blue-500">アイコン画像をアップロード</span>
                  </div>
                </label>
                <input hidden={true} disabled={isSending} type="file" accept=".jpg, .jpeg, .png" id="button2" onChange={async (e) => setSelectedImage(await handleImageChange(e))} />
              </div>
              <Image src={selectedImage == "" ? user!.icon : selectedImage} className="border rounded-full object-cover" width={60} height={60} style={{ width: "60px", height: "60px" }} alt={""} />
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
        ""
      )}
    </>
  );
}
