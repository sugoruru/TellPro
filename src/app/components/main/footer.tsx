import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-white text-black p-10 border-t border-gray-500 border-dashed">
      <div className="flex flex-wrap gap-10 justify-center">
        <ul>
          <li className="font-bold mb-3">About</li>
          <li className="text-gray-700">使い方</li>
          <li className="text-gray-700">開発</li>
        </ul>
        <ul>
          <li className="font-bold mb-3">Legal</li>
          <li className="text-gray-700">
            <Link href="/termsOfService">利用規約</Link>
          </li>
          <li className="text-gray-700">
            <Link href="/privacyPolicy">プライバシーポリシー</Link>
          </li>
        </ul>
      </div>
      <div className="text-center mt-4">©2024~ TellPro</div>
    </div>
  );
};

export default Footer;
