"use client";
import { useEffect, useState } from "react";
import Loading from "../components/loading";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

// TODO: もし本人であれば全てのページを表示する
// TODO: 他人であれば公開しているページのみ表示する
export default function Page({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const [navPlace, setNavPlace] = useState("pages");
  const router = useRouter();
  useEffect(() => {
    try {
      const fetcher = async () => {
        const res = await axios.get(`/api/db/users/exist?userID=${params.userID}`);
        if (res.data.exist) {
          setIsExist(true);
          setUser(res.data.data);
          document.title = `${res.data.data.username}｜TellPro`;
        }
        setIsLoading(false);
      };
      fetcher();
    } catch (e) {
      router.replace("/");
    }
  }, []);
  return isLoading ? (
    <>
      <title>Loading...｜TellPro</title>
      <Loading />
    </>
  ) : isExist ? (
    <>
      <div className="bg-white">
        <div className="m-5 md:flex sm:block">
          <Image alt={user.username} src={user.icon} width={100} height={100} priority className="md:mx-5" />
          <div>
            <div>
              <b>{user.username}</b>
            </div>
            <div>{user.statusMessage}</div>
            <div>
              <span>
                <b>{Number(user.answerScore) + Number(user.pageScore)}</b> Scores
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <nav className="pl-5 cursor-pointer pb-1">
            <span className={`px-2 ${navPlace === "pages" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("pages")}>
              Pages
            </span>
            <span className={`px-2 ${navPlace === "questions" ? "location" : "nonLocation"}`} onClick={() => setNavPlace("questions")}>
              Questions
            </span>
          </nav>
        </div>
      </div>
    </>
  ) : (
    <>
      <title>Not found User｜TellPro</title>
      <p>⚠ユーザーが存在しませんでした</p>
    </>
  );
}
