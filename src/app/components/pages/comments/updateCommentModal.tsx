"use client";
import Lex from "@/modules/md/md";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

interface UpdateCommentModalProps {
  handleUpdateComment: () => void;
  isUpdateSending: boolean;
  isOpenUpdateCommentModal: boolean;
  updateMdAreaValue: string;
  updateSendingMessage: string;
  stateFunc: {
    setIsOpenUpdateCommentModal: (isOpen: boolean) => void;
    setUpdateMdAreaValue: (value: string) => void;
  };
}

const UpdateCommentModal = (props: UpdateCommentModalProps) => {
  const [isCommentMarkdown, setIsCommentMarkdown] = useState(true);

  return (
    <Transition appear show={props.isOpenUpdateCommentModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => props.stateFunc.setIsOpenUpdateCommentModal(false)}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg text-center font-medium leading-6 text-gray-900">
                  {props.isUpdateSending ? "アップデート中..." : "コメントをアップデートする"}
                </Dialog.Title>
                {props.isUpdateSending ? (
                  <>
                    <div className="flex justify-center mt-2" aria-label="読み込み中">
                      <div className="animate-ping h-4 w-4 bg-blue-600 rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white">
                      <button
                        onClick={() => setIsCommentMarkdown(true)}
                        className={`${isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
                      >
                        編集(Markdown)
                      </button>
                      <button
                        onClick={() => setIsCommentMarkdown(false)}
                        className={`${!isCommentMarkdown ? "text-gray-800 border-b-2" : "text-gray-500"} hover:text-gray-800 text-sm font-bold py-2 px-4 border-blue-500`}
                      >
                        プレビュー
                      </button>
                    </div>
                    {isCommentMarkdown ? (
                      <textarea
                        className={`border ${
                          props.updateSendingMessage === "コメントを入力してください" && props.updateMdAreaValue === "" ? "border-red-500" : ""
                        } outline-1 resize-none rounded h-72 mt-2 outline-sky-400 p-1 w-full`}
                        placeholder="コメント(Markdown)"
                        onChange={(e) => props.stateFunc.setUpdateMdAreaValue(e.target.value)}
                        value={props.updateMdAreaValue}
                      ></textarea>
                    ) : (
                      <div>
                        <div className="overflow-y-scroll h-72 mt-2 border outline-1 outline-sky-400 p-1 w-full">{Lex({ text: props.updateMdAreaValue })}</div>
                      </div>
                    )}
                  </>
                )}
                <b className="ml-2 text-red-600">{props.updateSendingMessage}</b>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      props.handleUpdateComment();
                    }}
                    disabled={props.isUpdateSending}
                  >
                    <b>投稿する</b>
                  </button>
                  <button
                    type="button"
                    className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => props.stateFunc.setIsOpenUpdateCommentModal(false)}
                    disabled={props.isUpdateSending}
                  >
                    <b>キャンセル</b>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpdateCommentModal;
