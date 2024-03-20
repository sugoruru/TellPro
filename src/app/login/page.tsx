"use client";
import { useSession } from "next-auth/react";
import Login from "../components/login";
import Logout from "../components/logout";

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <div>
      {status === "authenticated" ? (
        <div>
          <p>セッションの期限：{session.expires}</p>
          <p>ようこそ、{session.user?.name}さん</p>
          <img src={session.user?.image ?? ``} alt="" style={{ borderRadius: "50px" }} />
          <div>
            <Logout />
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}
