import Link from "next/link";
import React from "react";

const PageUser = (props: { userID: string; userIcon: string }) => {
  return (
    <>
      <div className={`flex justify-center text-base font-bold text-gray-700 dark:text-white`}>
        <Link href={`/${props.userID}`} className="flex cursor-pointer">
          <img src={props.userIcon} alt="" width={24} height={24} className="mr-1" />
          <u>@{props.userID}</u>
        </Link>
      </div>
    </>
  );
};

export default PageUser;
