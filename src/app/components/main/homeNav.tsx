import Link from "next/link";

const HomeNav = (props: { pathName: string }) => {
  const IsLocation = (path: string) => {
    if (path == props.pathName) return "location";
    return "nonLocation";
  };
  return (
    <nav className={`bg-white text-black border-black dark:bg-neutral-800 dark:text-white dark:border-white w-lvw`}>
      <div className="mr-3 overflow-x-auto hidden-scrollbar">
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
