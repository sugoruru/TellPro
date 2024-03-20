import Link from "next/link";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";

const Header = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <header className="flex items-center justify-between py-4 md:py-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl" aria-label="logo" title="TellPro">
            <Image src="/svg/logo.svg" width={30} height={30} alt={""} />
            TellPro
          </Link>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2.5">
            <IoSearch className="flex-shrink-0 text-lg" />
            <div className="ml-2 sm:block">
              <a
                href="#"
                className="rounded-lg bg-indigo-500 px-5 py-2 text-center text-xs font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
              >
                Login
              </a>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;
