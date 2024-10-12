"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Notification } from "@/types/DBTypes";
import { useRouter } from "next/navigation";
import { Comment } from "@/types/DBTypes";
import { User } from "@/types/DBTypes";
import Link from "next/link";
import React from "react";
import HomeNav from "../components/main/homeNav";

const Notifications = () => {
  interface NotificationData {
    notifications: Notification[];
    comments: { [key: string]: Comment };
    users: { [key: string]: User };
    page_titles: { [key: string]: string };
    last_seeing_notifications_at: string;
  }
  const [notifications, setNotifications] = useState({} as NotificationData);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetcher = async () => {
      const res = await axios.get("/api/pages/notifications");
      if (!res.data.ok) router.replace("/");
      if (!res.data.isLogin) {
        alert("ログインしてください");
        router.replace("/");
      }
      const tmpComments = {} as { [key: string]: Comment };
      if (res.data.notifications.comments)
        for (const c of res.data.notifications.comments as Comment[]) {
          tmpComments[`${c.page_type} ${c.page_id} ${c.id}`] = c;
        }
      const tmpUsers = {} as { [key: string]: User };
      if (res.data.notifications.users)
        for (const u of res.data.notifications.users as User[]) {
          tmpUsers[u.id] = u;
        }
      const tmpPageTitles = {} as { [key: string]: string };
      if (res.data.notifications.page_titles)
        for (const p of res.data.notifications.page_titles as { id: string; title: string }[]) {
          tmpPageTitles[p.id] = p.title;
        }
      setNotifications((prev) => ({
        ...prev,
        notifications: res.data.notifications.notifications || [],
        comments: tmpComments,
        users: tmpUsers,
        page_titles: tmpPageTitles,
        last_seeing_notifications_at: res.data.notifications.last_seeing_notifications_at,
      }));
      setIsLoading(false);
    };
    try {
      fetcher();
    } catch (e) {
      router.replace("/");
    }
  }, [router]);
  return (
    <>
      <HomeNav path={""} />
      <div className="lg:w-3/5 w-full bg-white mx-auto my-3 p-5 rounded h-full">
        <p className="text-gray-500">(通知は15日以上立つと消去されます)</p>
        <hr />
        {isLoading ? (
          <></>
        ) : notifications.notifications.length === 0 ? (
          <>通知はまだ存在しません</>
        ) : (
          <>
            {notifications.notifications.map((e) => {
              return (
                <div key={e.id}>
                  {e.notification_type === "comment" ? (
                    <div className={`flex my-5 p-2 ${new Date(e.created_at).getTime() > new Date(notifications.last_seeing_notifications_at).getTime() ? "bg-sky-100" : ""}`}>
                      <Link className="font-semibold" href={`/${notifications.comments[e.notification_value]?.user_id}`}>
                        <img className="h-10 mr-2 my-auto" src={notifications.users[notifications.comments[e.notification_value]?.user_id]?.icon} alt="" />
                      </Link>
                      <div className="block">
                        <p>
                          <Link className="font-semibold" href={`/${notifications.comments[e.notification_value]?.user_id}`}>
                            {notifications.users[notifications.comments[e.notification_value]?.user_id]?.username}
                          </Link>
                          があなたの投稿「
                          <Link
                            className="font-semibold"
                            href={`/${e.user_id}/${e.notification_value.split(" ")[0]}/${e.notification_value.split(" ")[1]}?toComment=${notifications.comments[e.notification_value]?.id}`}
                          >
                            {notifications.page_titles[notifications.comments[e.notification_value]?.page_id]}
                          </Link>
                          」にコメントしました
                        </p>
                        <p className="text-gray-600">
                          {e.created_at.split("T")[0]} {e.created_at.split("T")[1].slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  ) : e.notification_type === "achievement" ? (
                    <>{e.notification_value}</>
                  ) : e.notification_type === "pomosk_one_time" ? (
                    <div className={`flex my-5 p-2 ${new Date(e.created_at).getTime() > new Date(notifications.last_seeing_notifications_at).getTime() ? "bg-sky-100" : ""}`}>
                      <img className="h-10 mr-2 my-auto" src="/svg/Pomosk.png" alt="" />
                      <div className="block">
                        <p>Pomoskからワンタイムパスワードが生成されました。ワンタイムパスワードは「{e.notification_value}」です。</p>
                        <p className="text-gray-600">
                          {e.created_at.split("T")[0]} {e.created_at.split("T")[1].slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export default Notifications;
