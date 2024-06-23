import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
export const UserContext = createContext<UserPublic | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
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
              setUser(userData);
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
  }, [status]);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
