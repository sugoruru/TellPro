import returnRandomString from "@/modules/algo/returnRandomString";
import { useContext } from "react";
import { UserContext } from "../providers/userProvider";

const NoticeBlock = (props: { title: string; content: string; created_at: string }) => {
  const headerData = useContext(UserContext);

  return (
    <div className={`my-5 border-b-2 border-dotted border-gray-600 ${headerData.user.isDarkMode ? "text-white bg-slate-700" : "text-black bg-white"}`}>
      <div className="flex justify-between">
        <div className="text-xl font-extrabold">{props.title}</div>
        <div className={`${headerData.user.isDarkMode ? "text-gray-300" : "text-gray-600"}`}>(公開:{props.created_at.split("T")[0]})</div>
      </div>
      <div>
        {props.content.split("\n").map((e) => (
          <p key={returnRandomString(32)}>{e}</p>
        ))}
      </div>
    </div>
  );
};
export default NoticeBlock;
