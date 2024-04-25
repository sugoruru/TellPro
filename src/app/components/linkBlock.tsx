import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdEditNote, MdKeyboardArrowDown } from "react-icons/md";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTrashAlt } from "react-icons/fa";
import returnRandomString from "@/modules/algo/returnRandomString";
import data from "@/modules/tags.json";

const LinkBlock = (props: { page: Page; pageUser: User; me: User | null; stateFunctions: { setIsOpenDeletePageModal: Function; setDeletePageID: Function } }) => {
  const router = useRouter();
  const tagJSON: Tags = data;

  return (
    <>
      <div className="border-gray-200">
        <div className="bg-white transition border-b relative max-w-[60rem] mt-3 min-h-40 rounded-lg break-words mx-auto">
          <Link href={`/${props.page.userID}/pages/${props.page.ID}`} prefetch className="min-h-40 block">
            <div className="flex p-5">
              <div>
                <div className="flex">
                  <Image alt={props.pageUser.username} src={props.pageUser.icon} width={24} height={24} priority />
                  <u
                    className="ml-1 cursor-pointer"
                    onClick={() => {
                      router.push(`/${props.page.userID}`);
                    }}
                  >
                    @{props.page.userID}
                  </u>
                </div>
                <b className="mr-1">{props.page.title}</b>
                <div className={`${props.page.isPublic ? "bg-blue-400" : "bg-red-400"} text-white px-1 rounded-sm inline-block mb-1`}>{props.page.isPublic ? "公開" : "非公開"}</div>
                <div className="flex flex-wrap mb-2">
                  {props.page.tags.map((e) => (
                    <div className="text-xs select-none mr-1 mb-1 px-1 cursor-pointer flex rounded-sm h-4 bg-slate-300" key={returnRandomString(32)}>
                      {tagJSON.tags[Number(e)].name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
          {/* ページの管理者なら表示 */}
          <div className={`${props.me?.ID === props.page.userID ? "" : "hidden"} absolute top-3 right-3`}>
            <div className="flex">
              <Link title="編集" className={`cursor-pointer z-10`} href={`/${props.page.userID}/pages/${props.page.ID}/edit`}>
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 mr-1 hover:bg-blue-200 transition rounded-full">
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
                              props.stateFunctions.setIsOpenDeletePageModal(true);
                              props.stateFunctions.setDeletePageID(props.page.ID);
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
        </div>
      </div>
    </>
  );
};

export default LinkBlock;
