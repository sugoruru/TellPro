import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../providers/userProvider";

const HomeNav = (props: { pathName: string }) => {
  const headerData = useContext(UserContext);

  const IsLocation = (path: string) => {
    if (path == props.pathName) return "location";
    return "nonLocation";
  };
  return (
    <nav className={`${headerData.user.isDarkMode ? "bg-neutral-800 text-white border-white" : "bg-white text-black border-black"}`}>
      <div className="overflow-x-auto hidden-scrollbar">
        <ul className="flex text-base mx-auto max-w-screen-2xl px-2 md:px-8">
          <li className={"px-2 font-medium" + " " + IsLocation("/")}>
            <Link href="/">Home</Link>
          </li>
          <li className={"px-2 font-medium" + " " + IsLocation("/articles")}>
            <Link href="/articles">Articles</Link>
          </li>
          <li className={"px-2 font-medium" + " " + IsLocation("/questions")}>
            <Link href="/questions">Questions</Link>
          </li>
          <li className={"px-2 font-medium" + " " + IsLocation("/problems")}>
            <Link href="/problems">Problems</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default HomeNav;
