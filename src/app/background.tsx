import { useEffect, useState } from "react";

const BackGround = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  return isLoaded ? <div className={`bg-slate-100 flex-col flex dark:bg-zinc-800 h-full`}>{children}</div> : <></>;
};
export default BackGround;
