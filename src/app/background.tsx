import { useContext, useEffect, useState } from "react";
import { UserContext } from "./components/providers/userProvider";

const BackGround = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const headerData = useContext(UserContext);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  return isLoaded ? <div className={`bg-slate-100 flex-col flex ${headerData.user.isDarkMode ? "bg-zinc-800" : "bg-slate-100"} h-full`}>{children}</div> : <></>;
};
export default BackGround;
