import axios from "axios";

const sendImage = async (dataURL: string, setStateMessage: Function | undefined = undefined): Promise<string> => {
  // dataURLサイズが大きいときは、errorを返す
  if (dataURL.length > 1024 * 1024) {
    alert("画像サイズが大きすぎます。1MB以下の画像を選択してください。");
    return "";
  }
  if (setStateMessage)
    setStateMessage("画像データをアップロード中...");
  const response = await axios.post<{ ok: false, error: string } | { ok: true, data: { link: string } }>("/api/img/upload", { image: dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, "") });
  if (response.data.ok === false) {
    alert(response.data.error);
    return "";
  }
  return response.data.data.link as string;
}
export default sendImage;