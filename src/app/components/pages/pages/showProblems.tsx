"use client";
import { siteImg, siteURL } from "@/modules/other/compSitesConstants";
import Link from "next/link";

const ShowProblems = (props: { data: ProblemJSON }) => {
  const { data } = props;
  const titleData = new Map<string, string>();
  for (const [key, value] of data.titleData) {
    titleData.set(key, value.title);
  }
  return (
    <div className="text-gray-800 mb-5">
      <div className="mb-5">
        <p className="text-2xl font-semibold"># 説明</p>
        <p className="text-lg">{data.description}</p>
      </div>
      <div>
        <p className="text-2xl font-semibold"># 問題集</p>
        {data.problems.map((e) => (
          <div key={e[0]} className="flex my-1">
            <img src={siteImg[e[1].site]} alt="" width={30} className="mr-3" />
            <Link href={siteURL(e[1].site, e[1].value)} target="_blank" className="myLink my-auto">
              {titleData.get(e[0]) ?? ""}
            </Link>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowProblems;
