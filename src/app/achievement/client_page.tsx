"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { UserPublic } from "@/types/user";
import { UserContext } from "../components/providers/userProvider";
import { achievements } from "@/modules/other/Achievements";
import { GrAchievement, GrTrophy } from "react-icons/gr";

export default function AchievementPage() {
  const { status } = useSession();
  const [me, setMe] = useState<UserPublic | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gotAchievements, setGotAchievements] = useState<Set<string>>(new Set<string>());
  const headerData = useContext(UserContext);
  const isFetched = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoading(false);
    } else if (status === "authenticated") {
      setIsLoading(false);
      setIsLogin(true);
    }
    const fetcher = async () => {
      try {
        const me = await axios.get("/api/db/users/existMe");
        setMe(me.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetcher();
  }, [status]);

  // ユーザー情報が取得できているか確認.
  useEffect(() => {
    if (me) {
      const fetcher = async () => {
        try {
          if (isFetched.current) return;
          isFetched.current = true;
          const achievements = (await axios.get(`/api/pages/achievements`)).data;
          if (achievements.ok === false) {
            console.error("Error");
            return;
          }
          const set = new Set<string>();
          for (const achievement of achievements.achievements) {
            set.add(achievement.achievement_name);
          }
          setGotAchievements(set);
        } catch (e) {
          console.error(e);
        }
      };
      fetcher();
    }
  }, [me]);

  useEffect(() => {
    if (isLoading) {
      document.title = "Loading...｜TellPro";
    } else if (isLogin) {
      document.title = "Achievement｜TellPro";
    } else {
      document.title = "Not found User｜TellPro";
    }
  }, [isLoading, isLogin]);

  return isLoading ? (
    <div className="h-full"></div>
  ) : isLogin ? (
    <div className="h-full">
      <div className={`mx-4 mt-1 font-bold ${headerData.user.isDarkMode ? "text-white" : "text-black"}`}>
        実績:({gotAchievements.size}/{Object.keys(achievements).length})
      </div>
      {Object.keys(achievements).map((key) => {
        return (
          <div key={key} className={`shadow-lg rounded-lg p-4 m-4 ${headerData.user.isDarkMode ? "bg-slate-700 text-white" : "bg-white text-black"}`}>
            <div className="flex">
              {gotAchievements.has(key) ? (
                <GrAchievement className="text-4xl text-yellow-500 my-auto mr-3" />
              ) : (
                <GrTrophy className={`text-4xl my-auto mr-3 ${headerData.user.isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
              )}
              <div>
                <p className="text-xl font-bold">{key}</p>
                <p className={`${headerData.user.isDarkMode ? "text-gray-200" : "text-gray-600"}`}>{gotAchievements.has(key) ? achievements[key] : "???"}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="h-full">
      <div className={`h-full bg-slate-100 text-center text-2xl font-black py-10 ${headerData.user.isDarkMode ? "text-gray-200" : "text-gray-600"}`}>
        <div className="flex justify-center">
          <BsExclamationCircle className="text-green-500 text-6xl" />
        </div>
        <p className={`${headerData.user.isDarkMode ? "text-white" : "text-black"}`}>ログインしてください</p>
        <p className="text-sm pt-5">
          <span>(</span>
          <Link href="/" className="text-blue-300">
            こちら
          </Link>
          <span>からホームに戻ることが出来ます)</span>
        </p>
      </div>
    </div>
  );
}
