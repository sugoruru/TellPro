import { UserPublic } from "@/types/user";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
export const UserContext = createContext<{
  user: { user: UserPublic | null; notificationCount: number };
  setUser: Dispatch<SetStateAction<{ user: UserPublic | null; notificationCount: number }>> | null;
}>({
  user: { user: null, notificationCount: 0 },
  setUser: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ user: UserPublic | null; notificationCount: number }>({ user: null, notificationCount: 0 });
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status == "authenticated") {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/users/existMe`);
          const userData = response.data.data as UserPublic;
          if (response.data.exist) {
            if (userData.is_banned) {
              alert("アカウントが停止されています。異議がある場合はお問い合わせください。");
              signOut();
            } else {
              const havingNotification = await axios.get(`/api/db/users/isHavingNotification?user_id=${userData.id}`);
              setUser({ user: userData, notificationCount: Number(havingNotification.data.data.count) });
            }
          } else {
            router.replace("/init");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [status, router]);
  return <UserContext.Provider value={{ user: user, setUser: setUser }}>{children}</UserContext.Provider>;
};
