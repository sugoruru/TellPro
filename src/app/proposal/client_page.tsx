"use client";
import sleep from "@/modules/main/sleep";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ProposalPage = () => {
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const router = useRouter();

  const sendProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setMessage("");
    const title = (e.currentTarget.elements.namedItem("title") as HTMLInputElement).value.trim();
    const opinion = (e.currentTarget.elements.namedItem("opinion") as HTMLTextAreaElement).value.trim();
    if (title === "") {
      setMessage("タイトルを入力してください");
      (e.currentTarget.elements.namedItem("title") as HTMLInputElement).focus();
      setIsSending(false);
      return;
    }
    if (opinion === "") {
      setMessage("提案を入力してください");
      (e.currentTarget.elements.namedItem("opinion") as HTMLTextAreaElement).focus();
      setIsSending(false);
      return;
    }
    setMessage("送信中...");
    let res;
    try {
      res = await axios.post("/api/admin/send_proposal", {
        title,
        opinion,
      });
    } catch (error) {
      setMessage("エラーが発生しました");
      setIsSending(false);
      return;
    }
    if (res.data.ok === false) {
      if (res.data.type === 1) {
        setMessage(`5分間に1回しか提案できません。あと${Math.floor((5 * 60 * 1000 - res.data.time_ms) / 1000)}秒後に再度お試しください`);
      } else {
        setMessage("エラーが発生しました");
      }
      await sleep(10000);
      setIsSending(false);
      return;
    }
    setMessage("提案を送信しました。ホームに戻ります。");
    await sleep(500);
    router.replace("/");
    setIsSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">サイト案</h1>
      <form onSubmit={sendProposal}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            placeholder="タイトル"
            className="focus:ring transition duration-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="opinion">
            意見
          </label>
          <textarea
            id="opinion"
            placeholder="ご意見をお願いします"
            className="focus:ring transition duration-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
          ></textarea>
        </div>
        <div className="flex items-center">
          <button disabled={isSending} type="submit" className="bg-blue-500 transition hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            提出
          </button>
          <p className="text-zinc-800 text-2xl font-semibold ml-5">{message}</p>
        </div>
      </form>
    </div>
  );
};

export default ProposalPage;
