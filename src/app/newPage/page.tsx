"use client";
import { useEffect } from "react";
import Loading from "../components/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";

const MakeNewPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetcher = async () => {
      if (status === "authenticated") {
        try {
          const user = await axios.get("/api/db/users/existMe");
          if (user.data.exist) {
            router.replace(`/${user.data.data.ID}/pages/${returnRandomString(16)}/edit`);
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
  }, [status]);

  return <Loading />;
};

export default MakeNewPage;
