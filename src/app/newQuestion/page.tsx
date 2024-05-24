"use client";
import { useEffect } from "react";
import Loading from "../components/main/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import returnRandomString from "@/modules/algo/returnRandomString";

export default function MakeNewQuestion() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "新規質問作成｜TellPro";
    const fetcher = async () => {
      if (status === "authenticated") {
        try {
          const user = await axios.get("/api/db/users/existMe");
          if (user.data.exist) {
            router.replace(`/${user.data.data.ID}/questions/${returnRandomString(16)}/edit`);
          } else {
            router.replace("/");
          }
        } catch (e) {
          console.error(e);
          router.replace("/");
        }
      } else if (status === "unauthenticated") {
        router.replace("/");
      }
    };
    fetcher();
  }, [status, router]);

  return <Loading title="読み込み中..." />;
}
