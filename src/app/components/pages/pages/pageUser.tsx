import Link from "next/link";
import { UserContext } from "../../providers/userProvider";
import { useContext } from "react";

const PageUser = (props: { userID: string; userIcon: string }) => {
  const headerData = useContext(UserContext);
  return (
    <>
      <div className={`flex justify-center text-base font-bold ${headerData.user.isDarkMode ? "text-white" : "text-gray-700"}`}>
        <Link href={`/${props.userID}`} className="flex cursor-pointer">
          <img src={props.userIcon} alt="" width={24} height={24} className="mr-1" />
          <u>@{props.userID}</u>
        </Link>
      </div>
    </>
  );
};

export default PageUser;
