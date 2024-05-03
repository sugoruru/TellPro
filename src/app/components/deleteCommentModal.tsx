import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface DeleteCommentModalProps {
  handleCommentDelete: () => void;
  isDeleteSending: boolean;
  isOpenDeleteCommentModal: boolean;
  stateFunc: {
    setIsOpenDeleteCommentModal: (isOpen: boolean) => void;
  };
}

const DeleteCommentModal = (props: DeleteCommentModalProps) => {
  return (
    <Transition appear show={props.isOpenDeleteCommentModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => props.stateFunc.setIsOpenDeleteCommentModal(false)}>
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
                  {props.isDeleteSending ? "削除中です..." : "本当に削除しますか？"}
                </Dialog.Title>
                {props.isDeleteSending ? (
                  <>
                    <div className="flex justify-center mt-2" aria-label="読み込み中">
                      <div className="animate-ping h-4 w-4 bg-blue-600 rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-2 text-center">
                      <p className="text-sm text-gray-500">この操作はもとに戻せません</p>
                    </div>
                  </>
                )}
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      props.handleCommentDelete();
                    }}
                    disabled={props.isDeleteSending}
                  >
                    <b>削除する</b>
                  </button>
                  <button
                    type="button"
                    className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => props.stateFunc.setIsOpenDeleteCommentModal(false)}
                    disabled={props.isDeleteSending}
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

export default DeleteCommentModal;
