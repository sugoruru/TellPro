import Link from "next/link";
import Image from "next/image";
import { IoSearch, IoSettingsOutline, IoBookmarks, IoDocumentTextSharp } from "react-icons/io5";
import { RiQuestionnaireLine } from "react-icons/ri";
import { PiSignOut } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { FaRegCircleUser } from "react-icons/fa6";
import { Fragment, useContext, useState } from "react";
import { Dialog, FocusTrap, Menu, Transition } from "@headlessui/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserContext } from "./providers/userProvider";

const Header = () => {
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const { status } = useSession();
  const user = useContext(UserContext);
  const existUser = user ? true : false;

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <header className="flex items-center justify-between py-4 md:py-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl" aria-label="logo" title="TellPro">
              <Image src="/svg/logo.svg" width={30} height={30} alt={""} priority />
              TellPro
            </Link>
            {status == "unauthenticated" ? (
              <div className="flex items-center gap-2.5">
                <IoSearch className="flex-shrink-0 text-lg" />
                <button className="ml-2 sm:block" onClick={() => setIsLoginMenuOpen(true)}>
                  <span className="rounded-lg bg-indigo-500 px-5 py-2 text-center text-xs font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base">
                    ログイン
                  </span>
                </button>
              </div>
            ) : status == "authenticated" && existUser && user ? (
              <div>
                <Menu as="div" className="relative inline-block text-left z-50">
                  <div>
                    <Menu.Button>
                      <Image priority={false} src={user ? user.icon : "/svg/userIcon.svg"} className="cursor-pointer" width={40} height={40} alt={""} />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <div className="px-1 py-1 ">
                        <Menu.Item>
                          {({ active }) => (
                            <Link href={`/${user.ID}`}>
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <FaRegCircleUser className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                ユーザー
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/bookmarks">
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <IoBookmarks className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                ブックマーク
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/histories">
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <GoHistory className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                履歴
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/newPage">
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <IoDocumentTextSharp className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                記事の作成
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/newQuestion">
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <RiQuestionnaireLine className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                質問の作成
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/settings">
                              <button className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                                <IoSettingsOutline className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                                設定
                              </button>
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={() => signOut()} className={`${active ? "bg-violet-500 text-white" : "text-gray-700"} group flex w-full items-center rounded-md px-2 py-2 text-base`}>
                              <PiSignOut className={`${active ? "bg-violet-500 text-white" : "text-gray-500"} mr-2`} />
                              サインアウト
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <></>
            )}
          </header>
        </div>
      </div>
      <Transition appear show={isLoginMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsLoginMenuOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center align-middle shadow-xl transition-all">
                  <Dialog.Title as="h1" className="text-3xl font-medium leading-6 text-gray-900">
                    <div className="flex justify-center items-center gap-2.5">
                      <Image src="/svg/logo.svg" width={30} height={30} alt={""} />
                      <span>TellPro</span>
                    </div>
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Googleでログイン/サインアップが出来ます</p>
                  </div>
                  <FocusTrap>
                    <button className="gsi-material-button my-3" style={{ width: 100 }}>
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents" onClick={() => signIn("google", { callbackUrl: `${process.env.NEXT_PUBLIC_TRUTH_URL}/init` }, { prompt: "login" })}>
                          Sign in with Google
                        </span>
                      </div>
                    </button>
                  </FocusTrap>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Header;
