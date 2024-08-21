import { useEffect, useState } from "react";

const BackGround = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col bg-slate-100 dark:bg-zinc-800 h-full">
      {children}
    </div>
  );
};

export default BackGround;
