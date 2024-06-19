import Link from "next/link";

const InquiryPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">お問い合わせ</h1>
      <p className="text-xl">以下のメールアドレスにてタイトルと本文を添付してお願いします</p>
      <p className="text-xl">
        メール:
        <Link href="mailto:support@tellpro.net" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
          support@tellpro.net
        </Link>
      </p>
    </div>
  );
};

export default InquiryPage;
