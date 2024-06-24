"use client";
import { useSession } from "next-auth/react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { BsExclamationCircle } from "react-icons/bs";
import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { quickSort } from "@/modules/algo/quickSort";
import { existTargetByBinarySearch } from "@/modules/algo/existTargetByBinarySearch";
import { handleUserNameChange } from "@/modules/handle/handleUserNameChange";
import handleImageChange from "@/modules/handle/handleImageChange";
import sendImage from "@/modules/network/sendImage";
import userNameKeyword from "@/modules/userNameKeyword";
import TermsOfService from "../termsOfService/page";
import PrivacyPolicy from "../privacyPolicy/page";

export default function Init() {
  const { data: session, status } = useSession();
  const [areaValue, setAreaValue] = useState("");
  const [existUser, setExistUser] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUserNameError, setIsUserNameError] = useState(false);
  const [userNameErrorMessage, setUserNameErrorMessage] = useState("");
  const [isPageNameError, setIsPageNameError] = useState(true);
  const [pageNameErrorMessage, setPageNameErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [stateMessage, setStateMessage] = useState("");
  const [usersID, setUsersID] = useState([] as string[]);
  const router = useRouter();

  // ユーザーがDBに存在すればホームにリダイレクト.
  useEffect(() => {
    if (status == "authenticated") {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/users/existMe`);
          const response2 = await axios.get(`/api/db/users/getAllUserID`);
          if (response2.data.ok) {
            setUsersID(quickSort(response2.data.data, 0, response2.data.data.length - 1));
          }
          if (response.data.exist) {
            router.replace("/");
          } else {
            if (session.user?.image) {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const img = new Image();
              img.src = session.user.image;
              img.crossOrigin = "anonymous";
              img.onload = () => {
                if (!ctx) return;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                setSelectedImage(canvas.toDataURL("image/png"));
              };
            }
            setExistUser(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [status, router, session?.user?.image]);

  useEffect(() => {
    if (status == "loading" || (existUser && status != "unauthenticated")) {
      document.title = "Loading...｜TellPro";
    } else if (status == "unauthenticated") {
      document.title = "Error｜TellPro";
    } else {
      document.title = "Init｜TellPro";
    }
  }, [status, existUser]);

  // ページ名の変更.
  const handlePageNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 20 || e.target.value.length < 1) {
      // 1文字以上20文字以下.
      setIsPageNameError(true);
      setPageNameErrorMessage("ページ名は1文字以上20文字以下で入力してください");
    } else if (!/^[a-zA-Z0-9-]+$/.test(e.target.value)) {
      // 大英文字、小英文字、数字、ハイフンのみ入力可能.
      setIsPageNameError(true);
      setPageNameErrorMessage("ページ名は大英文字、小英文字、数字、ハイフンのみ入力してください");
    } else if (existTargetByBinarySearch(usersID, e.target.value)) {
      // 二分探索でページ名が存在するか確認.
      setIsPageNameError(true);
      setPageNameErrorMessage("このページ名は既に使われています");
    } else if (e.target.value in userNameKeyword) {
      // ユーザー名とページ名が一致する場合.
      setIsPageNameError(true);
      setPageNameErrorMessage("このページ名は使用できません");
    } else {
      setIsPageNameError(false);
      setPageNameErrorMessage("");
    }
  };

  // アカウントの作成.
  async function sendDataToDB(dataURL: string) {
    {
      if (isUserNameError) {
        setStateMessage("ユーザー名が正しく入力されていません");
        const input = document.getElementById("userName_tellPro") as HTMLInputElement;
        input.focus();
        setIsSending(false);
        return;
      }
    }
    {
      if (isPageNameError) {
        setStateMessage("ページ名が正しく入力されていません");
        const input = document.getElementById("pageName_tellPro") as HTMLInputElement;
        input.focus();
        setIsSending(false);
        return;
      }
    }
    {
      const input = document.getElementById("termsOfService-checkbox") as HTMLInputElement;
      if (!input.checked) {
        setStateMessage("利用規約・プライバシーポリシーに同意してください");
        return;
      }
    }
    setIsSending(true);
    try {
      if (session) {
        setStateMessage("ユーザーが存在するかを確認中...");
        const existUser = await axios.get(`/api/db/users/existMe`);
        if (existUser.data.exist) {
          router.replace("/");
          setIsSending(false);
          return;
        }
        setStateMessage("画像データをアップロード中...");
        let imgLink = "";
        if (dataURL == "") {
          if (session.user?.image) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = session.user.image;
            img.crossOrigin = "anonymous";
            img.onload = () => {
              if (!ctx) return;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              imgLink = canvas.toDataURL("image/png");
            };
          } else {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = "/svg/userIcon.svg";
            img.crossOrigin = "anonymous";
            img.onload = () => {
              if (!ctx) return;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              imgLink = canvas.toDataURL("image/png");
            };
          }
        } else {
          imgLink = await sendImage(dataURL);
          if (imgLink == "") {
            setStateMessage("画像のアップロードに失敗しました");
            setIsSending(false);
            return;
          }
        }
        setStateMessage("ページ名が使用されているかを確認中...");
        const response2 = await axios.get(`/api/db/users/getAllUserID`);
        if (response2.data.ok) {
          const x = quickSort(response2.data.data, 0, response2.data.data.length - 1);
          if (existTargetByBinarySearch(x, (document.getElementById("pageName_tellPro") as HTMLInputElement).value)) {
            setIsSending(false);
            setStateMessage("このページ名は既に使われています");
            return;
          } else if ((document.getElementById("pageName_tellPro") as HTMLInputElement).value in userNameKeyword) {
            setIsSending(false);
            setStateMessage("このページ名は使用できません");
            return;
          }
        }
        setStateMessage("データベースにデータを送信中...");
        await axios.post("/api/db/users/create", {
          ID: (document.getElementById("pageName_tellPro") as HTMLInputElement).value,
          userName: (document.getElementById("userName_tellPro") as HTMLInputElement).value,
          mail: session?.user?.email,
          icon: imgLink,
          status_message: areaValue,
        });
        setIsSending(false);
        router.replace("/");
      } else {
        setStateMessage("エラーが発生しました");
        setIsSending(false);
      }
    } catch (err) {
      setStateMessage("エラーが発生しました");
      setIsSending(false);
    }
  }

  // ロード中は何も表示しない.
  if (status == "loading" || (existUser && status != "unauthenticated")) {
    return <></>;
  } else if (status == "unauthenticated") {
    return (
      <>
        <div className="min-h-screen bg-white text-center text-2xl font-black text-gray-600 py-10">
          <div className="flex justify-center">
            <BsExclamationCircle className="text-green-500 text-6xl" />
          </div>
          <p>ログインに失敗しました</p>
          <p>再度ログインしてください</p>
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
  } else {
    return (
      <>
        <div className="bg-white py-6 sm:py-8 lg:py-12">
          {/*ヘッダー*/}
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
            <div className="mb-10 md:mb-16">
              <img src="/svg/logo.svg" className="mx-auto" width={60} height={60} alt={""} />
              <h2 className="text-center text-2xl font-bold text-gray-800 lg:text-3xl">Welcome to TellPro!</h2>
              <p className="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">アカウントを作成しましょう！</p>
            </div>

            <form className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2">
              {/*メールアドレスの表示*/}
              <div className="sm:col-span-2">
                <p>メールアドレス</p>
                <input
                  defaultValue={status == "authenticated" && session.user ? (session.user.email ? session.user.email : "") : ""}
                  className="w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
                  readOnly
                  disabled
                />
              </div>
              {/*ユーザー名*/}
              <div className="sm:col-span-2">
                <label htmlFor="userName_tellPro" className="mb-2 inline-block text-sm text-gray-800 sm:text-base">
                  ユーザー名<span className="text-gray-500 pl-1">あとから変更できます</span>
                  <p className="text-red-500">{userNameErrorMessage}</p>
                </label>
                <input
                  onChange={(e) => {
                    const x = handleUserNameChange(e);
                    setIsUserNameError(x.isUserNameError);
                    setUserNameErrorMessage(x.userNameErrorMessage);
                  }}
                  defaultValue={status == "authenticated" && session.user ? (session.user.name ? session.user.name : "") : ""}
                  id="userName_tellPro"
                  disabled={isSending}
                  className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ${isUserNameError ? "ring-pink-600" : "ring-indigo-300"} transition duration-100 focus:ring`}
                />
              </div>
              {/*ページ名*/}
              <div className="sm:col-span-2">
                <label htmlFor="pageName_tellPro" className="mb-2 inline-block text-sm text-gray-800 sm:text-base">
                  ページ名<span className="text-gray-500 pl-1">あとから変更できません</span>
                  <p className="text-red-500">{pageNameErrorMessage}</p>
                </label>
                <div className="flex justify-items-center">
                  <label htmlFor="pageName_tellPro" className="py-2 pr-2 text-lg text-gray-600">
                    {window.location.origin}/
                  </label>
                  <input
                    onChange={handlePageNameChange}
                    id="pageName_tellPro"
                    disabled={isSending}
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ${isPageNameError ? "ring-pink-600" : "ring-indigo-300"} transition duration-100 focus:ring`}
                  />
                </div>
              </div>
              {/*アイコン画像*/}
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
                <input
                  hidden={true}
                  disabled={isSending}
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  id="button2"
                  onChange={async (e) => {
                    // 1MB以下の画像のみ許可.
                    if (e.target.files && e.target.files[0].size > 1024 * 1024) {
                      alert("1MB以下の画像のみアップロード可能です");
                      return;
                    }
                    setSelectedImage(await handleImageChange(e));
                  }}
                />
              </div>
              <img src={selectedImage} className="border rounded-full object-cover" width={60} height={60} style={{ width: "60px", height: "60px" }} alt={""} />
              {/*ステータスメッセージ*/}
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
            </form>
            <div className="mb-8 mt-4">
              <div className="overflow-y-scroll h-64 w-max mx-auto mb-4">
                <TermsOfService />
              </div>
              <div className="overflow-y-scroll h-64 w-max mx-auto mt-4">
                <PrivacyPolicy />
              </div>
              <div className="flex justify-center mt-4">
                <input
                  id="termsOfService-checkbox"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="termsOfService-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  利用規約・プライバシーポリシーに同意します
                </label>
              </div>
            </div>
            {/*送信ボタン*/}
            <div className="mx-auto grid max-w-screen-md gap-10 sm:grid-cols-2">
              <div className="flex items-center justify-between sm:col-span-2">
                <button
                  onClick={() => sendDataToDB(selectedImage)}
                  disabled={isSending}
                  className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
                >
                  Send
                </button>
                <p className="font-semibold text-red-500 text-xl">{stateMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
