"use client";
import { useEffect } from "react";
import Loading from "../components/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import returnRandomString from "@/modules/algo/returnRandomString";

const MakeNewPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const user = localStorage.getItem("user");
      if (user) {
        const jsonUser: User = JSON.parse(user);
        router.replace(`/${jsonUser.ID}/pages/${returnRandomString(16)}/edit`);
      } else {
        router.replace("/");
      }
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  return <Loading />;
};

export default MakeNewPage;
