import axios from "axios";

const imageSendToImgur = async (dataURL: string, setStateMessage: Function | undefined = undefined): Promise<string> => {
  const formData = new FormData();
  formData.append("image", dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
  const response = await axios.post(process.env.NODE_ENV === "development" ? `${process.env.NEXT_PUBLIC_TRUTH_URL}/api/img/upload` : "https://api.imgur.com/3/image", formData, {
    headers: {
      Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
    },
    responseType: "json",
    onUploadProgress: function (progressEvent) {
      if (progressEvent.total) {
        if (setStateMessage)
          setStateMessage("画像データをアップロード中..." + Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%");
      }
    },
  });
  return response.data.data.link as string;
}
export default imageSendToImgur;