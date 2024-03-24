import { ChangeEvent } from "react";

const handleImageChange = (e: ChangeEvent<HTMLInputElement>): string => {
  const file = e.target.files?.[0];
  if (file?.size ? file.size > 1024 * 1024 * 10 : false) {
    alert("10MB以下の画像を選択してください");
  } else if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      return reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  return "";
};
export default handleImageChange;