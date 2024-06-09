import handleImageChange from "@/modules/handle/handleImageChange";
import sendImage from "@/modules/network/sendImage";
import { Dialog, Transition } from "@headlessui/react";
import { Dispatch, Fragment, SetStateAction, useState } from "react";

const ImageUploader = (props: {
  mdAreaValue: string;
  sendingImageMessage: string;
  isOpenImageUpload: boolean;
  setSendingImageMessage: Dispatch<SetStateAction<string>>;
  setMdAreaValue: Dispatch<SetStateAction<string>>;
  setIsOpenImageUpload: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageValue, setImageValue] = useState("");

  const handleImageUpload = async () => {
    setIsSendingImage(true);
    try {
      if (selectedImage !== "") {
        const imageUrl = await sendImage(selectedImage, props.setSendingImageMessage);
        const imageTag = `![image](${imageUrl})`;
        props.setMdAreaValue(props.mdAreaValue + imageTag + "\n");
        setSelectedImage("");
      }
    } catch (e) {
      props.setSendingImageMessage("エラーが発生しました");
    }
    setIsSendingImage(false);
    props.setIsOpenImageUpload(false);
  };

  return (
    <Transition appear show={props.isOpenImageUpload || isSendingImage} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => props.setIsOpenImageUpload(false)}>
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
              <Dialog.Panel className="w-full text-center max-w-md transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  画像のアップロード
                </Dialog.Title>
                <div className="max-sm:block max-md:flex">
                  <div className="rounded-md border border-indigo-500 bg-gray-50 p-4 shadow-md hover:shadow-xl transition w-full">
                    <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-600 font-medium">Upload file</span>
                    </label>
                    <input
                      value={imageValue}
                      onClick={() => setImageValue("")}
                      onChange={async (e) => setSelectedImage(await handleImageChange(e))}
                      id="upload"
                      type="file"
                      className="hidden"
                      disabled={isSendingImage}
                      accept=".jpg, .jpeg, .png"
                    />
                  </div>
                  <img
                    src={selectedImage == "" ? "/svg/userIcon.svg" : selectedImage}
                    className={`w-full h-auto mx-auto mt-5 ${selectedImage === "" ? "hidden" : ""}`}
                    alt=""
                    width={150}
                    height={150}
                  />
                </div>
                <p className="mt-4 text-red-900 font-bold">{props.sendingImageMessage}</p>
                <button
                  type="button"
                  className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={() => props.setIsOpenImageUpload(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="mx-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={handleImageUpload}
                >
                  Send
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageUploader;
