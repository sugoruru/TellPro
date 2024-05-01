import axios from "axios";
import { useSession } from "next-auth/react";
import { createContext, useEffect, useState } from "react";
export const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { status } = useSession();
  useEffect(() => {
    if (status == "authenticated") {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/db/users/existMe`);
          if (response.data.exist) {
            setUser(response.data.data as User);
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
