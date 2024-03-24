"use client";
import { handleUserNameChange } from "@/modules/handleUserNameChange";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { IoCloudUploadOutline } from "react-icons/io5";
import handleImageChange from "@/modules/handleImageChange";

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
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      setIsSignIn(true);
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/exist?user=${session.user?.email}`);
          if (!response.data.exist) {
            signOut();
          } else {
            setExistUser(true);
            setUser(response.data.data as User);
            setAreaValue(response.data.data.statusMessage);
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
                <input hidden={true} disabled={isSending} type="file" accept=".jpg, .jpeg, .png" id="button2" onChange={(e) => setSelectedImage(handleImageChange(e))} />
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
                  onClick={() => console.log("button")}
                  disabled={isSending}
                  className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
                >
                  Send
                </button>
                <p>{}</p>
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
