"use client";
import { useEffect, useState } from "react";
import Loading from "../components/loading";

// TODO: ユーザーが存在するかを調べる
// TODO: もし本人であれば全てのページを表示する
// TODO: 他人であれば公開しているページのみ表示する
// TODO: タイトルの更新をする
export default function Page({ params }: { params: { userID: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  useEffect(() => {
    
  }, []);
  return isLoading ? <Loading /> : isExist ? <></> : <></>;
}
