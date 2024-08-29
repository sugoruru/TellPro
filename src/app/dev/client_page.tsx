"use client";
import Link from "next/link";
import { useGetWindowSize } from "../components/hooks/useGetWindowSize";
import { pageContentSize } from "@/modules/other/uiOptions";

const Dev = () => {
  const { width } = useGetWindowSize();
  return (
    <div className="mx-auto mt-10 mb-10 bg-white p-10 rounded terms h-full" style={{ width: `${width >= 640 ? Math.floor(width * pageContentSize) + "px" : (width * 4.8) / 5 + "px"}` }}>
      <h1 className="text-2xl font-bold">開発者</h1>
      <div className="flex">
        <img src="/svg/dev_ruku.png" alt="" width={100} height={100} />
        <p>
          名前:ruku
          <br />
          TellPro:
          <Link href="/ruku" className="myLink">
            ruku
          </Link>
        </p>
      </div>
      <br />
      <h1 className="text-2xl font-bold">discordサーバーについて</h1>
      <p>
        <a href="https://discord.gg/sT3SbsFx5f" className="myLink" target="_blank">
          こちら
        </a>
        をクリックしてdiscordに参加しましょう！
      </p>
      <p>サイト案を気軽に出せます！</p>
    </div>
  );
};

export default Dev;
