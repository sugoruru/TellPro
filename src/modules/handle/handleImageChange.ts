import { ChangeEvent } from "react";

const handleImageChange = async (e: ChangeEvent<HTMLInputElement>): Promise<string> => {
  const file = e.target.files?.[0];
  if (!file) {
    alert("ファイルが選択されていません");
  } else if (file?.size ? file.size > 1024 * 1024 * 10 : false) {
    alert("10MB以下の画像を選択してください");
  } else {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("ファイル読み込み中にエラーが発生しました"));
        }
      };
      reader.onerror = () => {
        reject(new Error("ファイル読み込み中にエラーが発生しました"));
      };
      reader.readAsDataURL(file);
    });
  }
  return "";
};
export default handleImageChange;