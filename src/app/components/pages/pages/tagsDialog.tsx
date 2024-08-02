import React, { memo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import TagsInput from "./tagsInput";
import { useTagsContext } from "../../hooks/tagsContext";

const TagsDialog = memo(function TagsDialogMemo() {
  const { isOpenTagEditor, handleSetIsOpenTagEditor } = useTagsContext();
  const handleClose = () => {
    handleSetIsOpenTagEditor(false);
  };

  return (
    <Transition appear show={isOpenTagEditor} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="w-full text-center max-w-md transform overflow-hidden rounded-2xl bg-white p-3 align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  タグの編集(5つまで)
                </Dialog.Title>
                <TagsInput />
                <button
                  type="button"
                  className="mx-2 mt-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={handleClose}
                >
                  決定
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default TagsDialog;
