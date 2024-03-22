"use client";
import { useSession } from "next-auth/react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { BsExclamationCircle } from "react-icons/bs";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Init() {
  const { data: session, status } = useSession();
  let [areaValue, setAreaValue] = useState("");
  let [existUser, setExistUser] = useState(true);
  let [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const router = useRouter();

  // ユーザーがDBに存在すればホームにリダイレクト.
  useEffect(() => {
    if (status == "authenticated") {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/exist?user=${session.user?.email}`);
          if (response.data.exist) {
            router.push("/");
          } else {
            if (session.user?.image) {
              setSelectedImage(await getImageBase64(session.user.image));
            }
            setExistUser(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [status]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.size ? file.size > 1024 * 1024 * 10 : false) {
      alert("10MB以下の画像を選択してください");
    } else if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function getImageBase64(url: string) {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    const arrayBuffer = await response.arrayBuffer();
    let base64String = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
    return `data:${contentType};base64,${base64String}`;
  }

  // アカウントの作成.
  async function sendDataToDB(dataURL: string) {
    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("image", dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
      const response = await axios.post("https://api.imgur.com/3/image", formData, {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
        },
        responseType: "json",
        onUploadProgress: function (progressEvent) {
          if (progressEvent.total) console.log("Upload Progress: " + Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%");
        },
      });
      const imgLink = response.data.data.link;
      await axios.post("/api/db/create", {
        userName: (document.getElementById("userName_tellPro") as HTMLInputElement).value,
        mail: session?.user?.email,
        icon: imgLink,
        statusMessage: areaValue,
      });
      setIsSending(false);
      router.push("/");
    } catch (err) {
      console.log("Error:", err);
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
              <Image src="/svg/logo.svg" className="mx-auto" width={60} height={60} alt={""} />
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
                  ユーザー名*(あとから変更できます)
                </label>
                <input
                  defaultValue={status == "authenticated" && session.user ? (session.user.name ? session.user.name : "") : ""}
                  id="userName_tellPro"
                  className="w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
                />
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
                <input hidden={true} type="file" accept="image/*" id="button2" onChange={handleImageChange} />
              </div>
              <Image src={selectedImage} className="border rounded-full object-cover" width={60} height={60} style={{ width: "60px", height: "60px" }} alt={""} />
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
                  maxLength={200}
                  className="h-64 w-full rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
                ></textarea>
              </div>
            </form>
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
