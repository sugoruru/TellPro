"use client";
import { useEffect } from "react";
import Loading from "../components/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import returnRandomString from "@/modules/algo/returnRandomString";

export default function makeNewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const user = localStorage.getItem("user");
      if (user) {
        const jsonUser: User = JSON.parse(user);
        router.push(`/${jsonUser.ID}/pages/${returnRandomString(16)}/edit`);
      } else {
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  return <Loading />;
}
