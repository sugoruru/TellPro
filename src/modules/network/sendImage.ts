import axios from "axios";

const sendImage = async (dataURL: string, setStateMessage: Function | undefined = undefined): Promise<string> => {
  const response = await axios.post("/api/img/upload", { image: dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, "") }, {
    onUploadProgress: function (progressEvent) {
      if (progressEvent.total) {
        if (setStateMessage)
          setStateMessage("画像データをアップロード中..." + Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%");
      }
    },
  });
  return response.data.data.link as string;
}
export default sendImage;