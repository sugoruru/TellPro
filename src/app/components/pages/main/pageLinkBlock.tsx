import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdEditNote, MdKeyboardArrowDown } from "react-icons/md";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTrashAlt } from "react-icons/fa";
import returnRandomString from "@/modules/algo/returnRandomString";
import { PageList } from "@/types/page";
import { PageType } from "@/modules/other/pageTypes";
import { UserPublic } from "@/types/user";

const PageLinkBlock = (props: {
  page: PageList;
  pageUser: UserPublic;
  pageType: PageType;
  me?: UserPublic | null;
  stateFunctions?: { setIsOpenDeletePageModal: Function; setDeletePageID: Function } | undefined;
}) => {
  const router = useRouter();
  return (
    <>
      <div className={`border-gray-200 text-black dark:text-white`}>
        <div className={`transition border-b-4 border-r-4 relative max-w-[60rem] mt-3 rounded-lg break-words mx-auto bg-white dark:bg-slate-700`}>
          <Link href={`/${props.page.user_id}/${props.pageType}/${props.page.id}`} prefetch className="block">
            <div className="flex p-5 pl-8">
              <div>
                <div className="flex text-sm">
                  <div className="h-[30px] w-[30px] relative">
                    <Image alt={props.pageUser.username} src={props.pageUser.icon} fill priority sizes="100%" />
                  </div>
                  <div>
                    <span className="ml-2">
                      <Link className="hover:underline" href={`/${props.page.user_id}`}>
                        @{props.page.user_id}
                      </Link>
                      <span className={`${props.page.is_public ? (props.page.is_closed ? "bg-violet-400" : "bg-blue-400") : "bg-red-400"} text-white px-1 rounded-sm inline-block ml-2`}>
                        {props.page.is_public ? (props.page.is_closed ? "クローズ" : "公開") : "非公開"}
                      </span>
                    </span>
                    <br />
                    <span className="ml-2 text-gray-600">{`${new Date(props.page.date).getFullYear()}年${new Date(props.page.date).getMonth() + 1}月${new Date(props.page.date).getDate()}日`}</span>
                  </div>
                </div>
                <b className="mr-1 text-xl text-gray-800 ml-[calc(30px+0.5rem)] hover:underline">{props.page.title}</b>
                <div className="flex flex-wrap text-gray-600 ml-[calc(30px+0.5rem)]">
                  {props.page.tags.length !== 0 ? (
                    props.page.tags.map((e) =>
                      e === "" ? (
                        <Fragment key={returnRandomString(32)}></Fragment>
                      ) : (
                        <div className="text-xs select-none mr-1 mb-1 px-1 cursor-pointer flex rounded-sm h-4 bg-slate-300" key={returnRandomString(32)}>
                          {e}
                        </div>
                      )
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </Link>
          {/* ページの管理者(Userページのみ)なら表示 */}
          {!props.stateFunctions || props.me?.id !== props.page.user_id ? (
            <></>
          ) : (
            <div className={`absolute top-3 right-3`}>
              <div className="flex">
                <Link title="編集" className={`cursor-pointer z-10`} href={`/${props.page.user_id}/${props.pageType}/${props.page.id}/edit`}>
                  <div className="flex items-center justify-center w-8 text-black h-8 bg-blue-100 mr-1 hover:bg-blue-200 transition rounded-full">
                    <MdEditNote className="inline-flex text-xl" />
                  </div>
                </Link>
                {/* その他メニュー */}
                <Menu as="div" className="bg-blue-100 z-10 flex items-center justify-center w-8 h-8 hover:bg-blue-200 font-bold py-1 px-2 rounded-full">
                  <Menu.Button>
                    <MdKeyboardArrowDown className="text-xl text-black" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="transform translate-y-14 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? "bg-sky-200" : "text-gray-900"} text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm`}>エクスポート</button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                if (props.stateFunctions) {
                                  props.stateFunctions.setIsOpenDeletePageModal(true);
                                  props.stateFunctions.setDeletePageID(props.page.id);
                                }
                              }}
                              className={`${active ? "bg-sky-200" : "text-gray-900"} text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                              <FaTrashAlt className="mr-2" />
                              削除
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageLinkBlock;
