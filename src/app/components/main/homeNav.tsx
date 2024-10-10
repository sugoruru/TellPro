import Link from "next/link";

const HomeNavItems = {
  Home: "/",
  Articles: "/articles",
  Questions: "/questions",
  Problems: "/problems",
  "": "",
} as const;

type valueOf<T> = T[keyof T];

const HomeNav = (props: { path: valueOf<typeof HomeNavItems> }) => {
  const pathname = props.path;

  return (
    <div className={`bg-white text-black border-black dark:bg-neutral-800 dark:text-white dark:border-white w-screen`}>
      <nav className="mr-3 overflow-x-auto hidden-scrollbar font-medium">
        <ul className="flex text-base mx-auto max-w-screen-2xl px-2 md:px-8">
          {Object.entries(HomeNavItems).map(([name, _pathname]) => {
            return (
              <li className={`px-2 ${pathname === _pathname && "border-b-2 pb-1"}`} key={name}>
                <Link href={_pathname}>{name}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default HomeNav;
export { HomeNavItems };
