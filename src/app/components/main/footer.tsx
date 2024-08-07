import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../providers/userProvider";

const Footer = () => {
  const headerData = useContext(UserContext);

  return (
    <div className={`p-10 border-t border-gray-500 border-dashed ${headerData.user.isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-gray-700"}`}>
      <div className="md:flex flex-wrap gap-10 justify-center">
        <ul className="mb-5 md:mb-0">
          <li className="font-bold mb-3">About</li>
          <li>使い方</li>
          <li>開発</li>
        </ul>
        <ul className="mb-5 md:mb-0">
          <li className="font-bold mb-3">Legal</li>
          <li>
            <Link href="/termsOfService">利用規約</Link>
          </li>
          <li>
            <Link href="/privacyPolicy">プライバシーポリシー</Link>
          </li>
        </ul>
        <ul className="mb-5 md:mb-0">
          <li className="font-bold mb-3">Other</li>
          <li>
            <Link href="/proposal">サイト案</Link>
          </li>
          <li>
            <Link href="/inquiry">お問い合わせ</Link>
          </li>
        </ul>
      </div>
      <div className="text-center mt-4">Copyright Since 2024 (C) TellPro</div>
    </div>
  );
};

export default Footer;
