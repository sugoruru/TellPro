import Link from "next/link";

const Heading = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="font-bold text-3xl pb-1 border-b mb-4">{children}</h1>;
};

const APIInfo = () => {
  return (
    <div className="font-semibold p-10 mx-auto my-10 max-w-3xl rounded-md bg-white space-y-8 terms">
      <section>
        <Heading>概要</Heading>
        <p>このページではTellProのAPIの仕様ついて説明します</p>
      </section>
      <section>
        <Heading>リクエスト制限</Heading>
        <p>TellProでは現状1分間に100リクエストのリクエスト制限を設けています。また</p>
      </section>
    </div>
  );
};

export default APIInfo;
