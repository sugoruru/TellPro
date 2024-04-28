import Link from "next/link";

const HomeNav = (props: { pathName: string }) => {
  const IsLocation = (path: string) => {
    if (path == props.pathName) return "location";
    return "nonLocation";
  };
  return (
    <nav className="bg-white">
      <ul className="flex text-base mx-auto max-w-screen-2xl px-2 md:px-8">
        <li className={"px-2 font-medium" + " " + IsLocation("/")}>
          <Link href="/">Home</Link>
        </li>
        <li className={"px-2 font-medium" + " " + IsLocation("/questions")}>
          <Link href="/questions">Questions</Link>
        </li>
        <li className={"px-2 font-medium" + " " + IsLocation("/pages")}>
          <Link href="/pages">Pages</Link>
        </li>
      </ul>
    </nav>
  );
};

export default HomeNav;
