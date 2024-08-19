import { UserPublic } from "@/types/user";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

interface UserProviderProps {
  user: UserPublic | null;
  notificationCount: number;
  isDarkMode: boolean;
  hateX: boolean;
}

export const UserContext = createContext<{
  user: UserProviderProps;
  setUser: Dispatch<SetStateAction<UserProviderProps>> | null;
}>({
  user: { user: null, notificationCount: 0, isDarkMode: false, hateX: false },
  setUser: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProviderProps>({
    user: null,
    notificationCount: 0,
    isDarkMode: false,
    hateX: false,
  });
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
              if (localStorage.getItem("isDarkMode") === null) {
                localStorage.setItem("isDarkMode", "false");
              }
              if (localStorage.getItem("hateX") === null) {
                localStorage.setItem("hateX", "false");
              }
              const isDarkMode = localStorage.getItem("isDarkMode") === "true";
              const hateX = localStorage.getItem("hateX") === "true";
              setUser({ user: userData, notificationCount: Number(havingNotification.data.data.count), isDarkMode: isDarkMode, hateX: hateX });
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
  useEffect(() => {
    setUser((prev) => ({ ...prev, isDarkMode: localStorage.getItem("isDarkMode") === "true", hateX: localStorage.getItem("hateX") === "true" }));
  }, []);
  useEffect(() => {
    if (localStorage.getItem("isDarkMode") === "true") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [user.isDarkMode]);
  return <UserContext.Provider value={{ user: user, setUser: setUser }}>{children}</UserContext.Provider>;
};
